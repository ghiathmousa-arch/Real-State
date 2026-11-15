// سكربت تعبئة createdBy للعقارات القديمة
// ─────────────────────────────────────────────────────────────
// الخلفية: createdBy (مين أضاف العقار) حقل جديد بينكتب وقت الإضافة. العقارات القديمة ما فيها،
// فهالسكربت بيعطيها لأول مستخدم admin (الأقدم بالإنشاء) عشان عمود "أضافه" وفلتر الأشخاص
// بالداشبورد يشتغلوا عليها كمان.
//
// طريقة الاستخدام (من جذر المشروع):
//   node server/scripts/migrate-created-by.js          ← dry-run (افتراضي): بس بيطبع جدول بالتغييرات
//   node server/scripts/migrate-created-by.js --apply  ← بيكتب التغييرات على قاعدة البيانات
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

// ── التنفيذ ──────────────────────────────────────────────────
const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

  // منشتغل على الـ collections مباشرة (بدون الموديل) عشان ما تتدخل validators
  // الموديل بعقارات قديمة ناقصها حقول
  const users = mongoose.connection.collection("users");
  const col = mongoose.connection.collection("properties");

  const admin = await users.find({ role: "admin" }).sort({ createdAt: 1, _id: 1 }).limit(1).next();
  if (!admin) fail("ما في ولا مستخدم admin بقاعدة البيانات");

  // بلا createdBy أو createdBy.id فاضي
  const docs = await col
    .find({ $or: [{ createdBy: { $exists: false } }, { createdBy: null }, { "createdBy.id": null }] })
    .project({ title: 1, "action.by": 1, createdAt: 1 })
    .toArray();

  console.log(`\nالأدمن: ${admin.name} (${admin.email}) — ${admin._id}`);
  console.log(`عقارات بلا createdBy: ${docs.length}\n`);
  if (docs.length) {
    console.table(
      docs.map((d) => ({
        id: String(d._id),
        title: d.title,
        "action.by": d.action?.by ?? "—",
        createdBy: `→ ${admin.name}`,
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

  const result = await col.updateMany(
    { _id: { $in: docs.map((d) => d._id) } },
    { $set: { createdBy: { id: admin._id, name: admin.name } } }
  );
  console.log(`\n✅ تم تعديل ${result.modifiedCount} عقار (createdBy = ${admin.name})`);
};

run()
  .catch((err) => {
    console.error("❌ فشل السكربت:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
