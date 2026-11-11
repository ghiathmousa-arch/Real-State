// سكربت ترحيل أسعار الإيجار لـ rentPrices
// ─────────────────────────────────────────────────────────────
// الخلفية: عقارات الإيجار كانت تخزّن سعرها بحقل price (ومنعرضه "/ شهرياً").
// هلق الإيجار إلو 4 أسعار (rentPrices.daily/weekly/monthly/yearly) و price = null.
// هالسكربت بينقل price → rentPrices.monthly لكل عقار إيجار سعره مو null
// وما عندو سعر شهري أصلاً.
//
// طريقة الاستخدام (من جذر المشروع):
//   node server/scripts/migrate-rent-prices.js          ← dry-run (افتراضي): بس بيطبع جدول بالتغييرات
//   node server/scripts/migrate-rent-prices.js --apply  ← بيكتب التغييرات على قاعدة البيانات
//
// عقارات الإيجار اللي عنوانها أو وصفها فيه "سنوي" أو "سنة" بتنطبع بجدول تحذير منفصل —
// سعرها على الأغلب سنوي مو شهري، فلازم ينتقل يدوياً لخانة السنوي بعد الترحيل.
//
// ⚠️ --apply بيعدّل قاعدة البيانات الحية مباشرة — خود نسخة احتياطية قبل.

const mongoose = require("mongoose");
// server/.env، أو ENV_FILE (مثلاً .env.test لقاعدة الاختبار)
require("../config/loadEnv").loadEnv();

const apply = process.argv.slice(2).includes("--apply");

const fail = (msg) => {
  console.error(`❌ ${msg}`);
  process.exit(1);
};

if (!process.env.MONGO_URI) fail("MONGO_URI مو موجود بـ server/.env");

const YEARLY_HINT = /سنوي|سنة/;
const fmt = (n) => (n == null ? "null" : Number(n).toLocaleString("en-US"));

// ── التنفيذ ──────────────────────────────────────────────────
const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

  // منشتغل على الـ collection مباشرة (بدون الموديل) عشان ما تتدخل validators
  // الموديل بعقارات قديمة ناقصها حقول
  const col = mongoose.connection.collection("properties");

  // عقار إيجار + price مو null + rentPrices.monthly فاضي (ما موجود أو null)
  const docs = await col
    .find({ type: "rent", price: { $ne: null }, "rentPrices.monthly": null })
    .project({ title: 1, description: 1, price: 1, rentPrices: 1 })
    .toArray();

  // كل عقارات الإيجار (حتى المرحّلة قبل) — للتحذير من الأسعار السنوية
  const yearlyHints = (await col
    .find({ type: "rent" })
    .project({ title: 1, description: 1, price: 1, rentPrices: 1 })
    .toArray())
    .filter((d) => YEARLY_HINT.test(`${d.title || ""} ${d.description || ""}`));

  console.log(`\nعقارات إيجار لازم ينتقل سعرها لـ rentPrices.monthly: ${docs.length}\n`);
  if (docs.length) {
    console.table(
      docs.map((d) => ({
        id: String(d._id),
        title: d.title,
        price: `${fmt(d.price)} → null`,
        monthly: fmt(d.price),
      }))
    );
  }

  if (yearlyHints.length) {
    console.log(`\n⚠️ عقارات إيجار فيها "سنوي" أو "سنة" — على الأغلب سعرها سنوي، صلّحها يدوياً من الداشبورد بعد الترحيل (انقل السعر لخانة السنوي): ${yearlyHints.length}`);
    console.table(
      yearlyHints.map((d) => ({
        id: String(d._id),
        title: d.title,
        price: fmt(d.price),
        monthly: fmt(d.rentPrices?.monthly),
        yearly: fmt(d.rentPrices?.yearly),
      }))
    );
  }

  if (!apply) {
    console.log("\n🔎 dry-run — ما تعدّل شي. ضيف --apply للتطبيق.");
    return;
  }

  if (docs.length === 0) {
    console.log("ما في شي للتعديل.");
    return;
  }

  // منكتب الحقول الأربعة بشكل صريح (dot notation) عشان ما نمسح أي مدة تانية معبّاية
  const ops = docs.map((d) => ({
    updateOne: {
      filter: { _id: d._id },
      update: {
        $set: {
          "rentPrices.monthly": d.price,
          "rentPrices.daily": d.rentPrices?.daily ?? null,
          "rentPrices.weekly": d.rentPrices?.weekly ?? null,
          "rentPrices.yearly": d.rentPrices?.yearly ?? null,
          price: null,
        },
      },
    },
  }));

  const result = await col.bulkWrite(ops);
  console.log(`\n✅ تم ترحيل ${result.modifiedCount} عقار إيجار (السعر صار بـ rentPrices.monthly)`);
};

run()
  .catch((err) => {
    console.error("❌ فشل السكربت:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
