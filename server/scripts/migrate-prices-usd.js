// سكربت ترحيل الأسعار للدولار الأمريكي (USD)
// ─────────────────────────────────────────────────────────────
// الخلفية: حقل price كان فيه قيم مخلوطة — بعضها بالدولار (مثلاً 12000) وبعضها بالليرة
// (مثلاً 429000000). القرار: كل الأسعار بالمنصة بالدولار فقط.
// أي سعر أكبر من THRESHOLD منعتبره "مشبوه" (على الأغلب بالليرة).
//
// طريقة الاستخدام (من جذر المشروع):
//   node server/scripts/migrate-prices-usd.js                      ← dry-run (افتراضي): بس بيطبع جدول
//   node server/scripts/migrate-prices-usd.js --rate=13000 --apply ← بيقسم على سعر الصرف وبيقرّب لأقرب 100$
//   node server/scripts/migrate-prices-usd.js --null-suspicious --apply ← بيحوّلهم لـ null ("السعر عند الطلب")
//
// ⚠️ --apply بيعدّل قاعدة البيانات الحية مباشرة — خود نسخة احتياطية قبل.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const THRESHOLD = 5_000_000; // أي سعر فوق 5 مليون منعتبره بالليرة

// ── قراءة الخيارات ───────────────────────────────────────────
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const getValue = (name) => {
  const arg = args.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1] : undefined;
};

const apply = has("--apply");
const nullSuspicious = has("--null-suspicious");
const rateRaw = getValue("rate");
const rate = rateRaw !== undefined ? Number(rateRaw) : undefined;

const fail = (msg) => {
  console.error(`❌ ${msg}`);
  process.exit(1);
};

if (apply) {
  if (nullSuspicious && rateRaw !== undefined)
    fail("اختار وحدة بس: --rate=<سعر الصرف> أو --null-suspicious");
  if (!nullSuspicious && rateRaw === undefined)
    fail("--apply بدو --rate=<سعر صرف الدولار بالليرة> أو --null-suspicious");
  if (rateRaw !== undefined && (!Number.isFinite(rate) || rate <= 0))
    fail(`سعر الصرف غير صالح: ${rateRaw}`);
}

if (!process.env.MONGO_URI) fail("MONGO_URI مو موجود بـ server/.env");

// ── التنفيذ ──────────────────────────────────────────────────
const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

  // منشتغل على الـ collection مباشرة (بدون الموديل) عشان ما تتدخل validators
  // الموديل الجديدة بعقارات قديمة ناقصها حقول
  const col = mongoose.connection.collection("properties");
  const docs = await col
    .find({ price: { $gt: THRESHOLD } })
    .project({ title: 1, price: 1, type: 1 })
    .sort({ price: -1 })
    .toArray();

  const fmt = (n) => (n == null ? "null" : Number(n).toLocaleString("en-US"));

  const toUsd = (price) => Math.round(price / rate / 100) * 100;

  console.log(`\nعقارات سعرها أكبر من ${fmt(THRESHOLD)} (على الأغلب بالليرة): ${docs.length}\n`);
  console.table(
    docs.map((d) => {
      const row = {
        id: String(d._id),
        title: d.title,
        price: fmt(d.price),
        type: d.type,
      };
      if (rate) row.usd = fmt(toUsd(d.price));
      return row;
    })
  );

  if (!apply) {
    console.log("\n🔎 dry-run — ما تعدّل شي. ضيف --apply مع --rate=<…> أو --null-suspicious للتطبيق.");
    return;
  }

  if (docs.length === 0) {
    console.log("ما في شي للتعديل.");
    return;
  }

  const ops = docs.map((d) => ({
    updateOne: {
      filter: { _id: d._id },
      update: { $set: { price: nullSuspicious ? null : toUsd(d.price) } },
    },
  }));

  const result = await col.bulkWrite(ops);
  console.log(`\n✅ تم تعديل ${result.modifiedCount} عقار ${nullSuspicious ? "(صار سعرهم null)" : `(سعر الصرف ${fmt(rate)})`}`);
};

run()
  .catch((err) => {
    console.error("❌ فشل السكربت:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
