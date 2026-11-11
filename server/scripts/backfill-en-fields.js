// سكربت تعبئة الاسم الإنجليزي للمدينة والفئة (cityEn / categoryEn)
// ─────────────────────────────────────────────────────────────
// الخلفية: cityEn و categoryEn كانوا يجوا من الفورم يدوياً، فبعض العقارات القديمة
// فيها فاضيين أو مكتوبين غلط. هلق السيرفر بيحسبهن من CITIES / CATEGORIES
// (server/constants/property.js) حسب القيمة العربية — وهالسكربت بيصلّح القديم.
//
// طريقة الاستخدام (من جذر المشروع):
//   node server/scripts/backfill-en-fields.js          ← dry-run (افتراضي): بس بيطبع جدول بالتغييرات
//   node server/scripts/backfill-en-fields.js --apply  ← بيكتب التغييرات على قاعدة البيانات
//
// العقارات اللي مدينتها أو فئتها العربية مش موجودة بالقائمة ما بتنلمس —
// بتنطبع بجدول منفصل لتصليحها يدوياً.
//
// ⚠️ --apply بيعدّل قاعدة البيانات الحية مباشرة — خود نسخة احتياطية قبل.

const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { CITIES, CATEGORIES } = require("../constants/property");

const apply = process.argv.slice(2).includes("--apply");

const fail = (msg) => {
  console.error(`❌ ${msg}`);
  process.exit(1);
};

if (!process.env.MONGO_URI) fail("MONGO_URI مو موجود بـ server/.env");

const findEn = (list, ar) => list.find((item) => item.ar === String(ar ?? "").trim())?.en ?? null;

// ── التنفيذ ──────────────────────────────────────────────────
const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

  // منشتغل على الـ collection مباشرة (بدون الموديل) عشان ما تتدخل validators
  // الموديل بعقارات قديمة ناقصها حقول
  const col = mongoose.connection.collection("properties");
  const docs = await col
    .find({})
    .project({ title: 1, city: 1, cityEn: 1, category: 1, categoryEn: 1 })
    .toArray();

  const changes = [];   // عقارات لازم يتحدّث فيها حقل أو اتنين
  const unknown = [];   // عقارات قيمتها العربية مش بالقائمة — تصليح يدوي

  for (const d of docs) {
    const set = {};

    const cityEn = findEn(CITIES, d.city);
    if (!cityEn) unknown.push({ id: String(d._id), title: d.title, field: "city", value: d.city });
    else if (d.cityEn !== cityEn) set.cityEn = cityEn;

    const categoryEn = findEn(CATEGORIES, d.category);
    if (!categoryEn) unknown.push({ id: String(d._id), title: d.title, field: "category", value: d.category });
    else if (d.categoryEn !== categoryEn) set.categoryEn = categoryEn;

    if (Object.keys(set).length) changes.push({ doc: d, set });
  }

  console.log(`\nعدد العقارات الكلي: ${docs.length} — بدها تحديث: ${changes.length}\n`);
  if (changes.length) {
    console.table(
      changes.map(({ doc, set }) => ({
        id: String(doc._id),
        title: doc.title,
        cityEn: set.cityEn ? `${doc.cityEn || "(فاضي)"} → ${set.cityEn}` : "—",
        categoryEn: set.categoryEn ? `${doc.categoryEn || "(فاضي)"} → ${set.categoryEn}` : "—",
      }))
    );
  }

  if (unknown.length) {
    console.log(`\n⚠️ قيم عربية مش موجودة بالقائمة (ما رح تنلمس — صلّحها يدوياً أو ضيفها لـ constants/property.js): ${unknown.length}`);
    console.table(unknown);
  }

  if (!apply) {
    console.log("\n🔎 dry-run — ما تعدّل شي. ضيف --apply للتطبيق.");
    return;
  }

  if (changes.length === 0) {
    console.log("ما في شي للتعديل.");
    return;
  }

  const ops = changes.map(({ doc, set }) => ({
    updateOne: { filter: { _id: doc._id }, update: { $set: set } },
  }));

  const result = await col.bulkWrite(ops);
  console.log(`\n✅ تم تعديل ${result.modifiedCount} عقار`);
};

run()
  .catch((err) => {
    console.error("❌ فشل السكربت:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
