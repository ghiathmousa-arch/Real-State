// سكربت نسخ البيانات الحية لقاعدة الاختبار
// ─────────────────────────────────────────────────────────────
// بينسخ properties و users و contacts من القاعدة الحية لقاعدة اختبار منفصلة، عشان نجرّب
// الموقع والداشبورد والسكريبتات بدون ما نلمس البيانات الحقيقية.
//
// طريقة الاستخدام (من جذر المشروع):
//   node server/scripts/clone-to-test-db.js
//       ← المصدر = MONGO_URI من server/.env، والهدف = MONGO_URI من server/.env.test
//   node server/scripts/clone-to-test-db.js --from "<رابط>" --to "<رابط أو اسم قاعدة>"
//       ← --to باسم قاعدة بس (مثلاً realestate_test) = نفس cluster المصدر بقاعدة تانية
//
// الأمان:
//   • المصدر قراءة بس — ما في ولا كتابة عليه أبداً.
//   • بيرفض إذا المصدر والهدف نفس القاعدة، أو إذا اسم قاعدة الهدف ما فيه "test".
//   • الهدف بيتمسح أول (collections التلاتة بس) وبعدين بينكتب.

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { SERVER_DIR, dbNameFromUri } = require("../config/loadEnv");

const COLLECTIONS = ["properties", "users", "contacts"];

const fail = (msg) => {
  console.error(`❌ ${msg}`);
  process.exit(1);
};

// ── الخيارات ─────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (name) => {
  const i = args.indexOf(`--${name}`);
  if (i >= 0) return args[i + 1];
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  return eq ? eq.slice(name.length + 3) : undefined;
};

// منقرا ملفات الـ env مباشرة (dotenv.parse) بدل ما نحمّلها بـ process.env — هيك ما بيختلطوا
const readEnvUri = (file) => {
  const p = path.join(SERVER_DIR, file);
  if (!fs.existsSync(p)) return undefined;
  return dotenv.parse(fs.readFileSync(p)).MONGO_URI;
};

// بيحط اسم قاعدة جديد مكان القديم بالرابط (أو بيضيفه إذا مش موجود)
const withDbName = (uri, db) => {
  const m = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(\/[^?]*)?(\?.*)?$/);
  if (!m) fail("رابط المصدر مش بصيغة mongodb:// أو mongodb+srv://");
  return `${m[1]}/${db}${m[3] || ""}`;
};

const hostOf = (uri) => (String(uri).match(/^mongodb(?:\+srv)?:\/\/(?:[^@/]*@)?([^/?]+)/) || [])[1] || "";

const fromUri = getArg("from") || readEnvUri(".env");
if (!fromUri) fail("ما في مصدر: مرّر --from أو حط MONGO_URI بـ server/.env");

let toArg = getArg("to") || readEnvUri(".env.test");
if (!toArg) fail("ما في هدف: مرّر --to (رابط أو اسم قاعدة) أو حط MONGO_URI بـ server/.env.test");
const toUri = /^mongodb(\+srv)?:\/\//.test(toArg) ? toArg : withDbName(fromUri, toArg);

const toDbName = dbNameFromUri(toUri);
if (!toDbName) fail("اسم قاعدة الهدف لازم يكون مكتوب صراحة بالرابط (…/realestate_test)");
if (!toDbName.toLowerCase().includes("test"))
  fail(`اسم قاعدة الهدف "${toDbName}" ما فيه "test" — منوقف عشان ما نكتب على قاعدة حقيقية`);
// فحص أولي قبل الاتصال (وفي فحص تاني بعده بالأسماء الفعلية)
if (fromUri === toUri || (hostOf(fromUri) === hostOf(toUri) && dbNameFromUri(fromUri) === toDbName))
  fail(`المصدر والهدف نفس القاعدة (${toDbName}) — منوقف`);

// ── التنفيذ ──────────────────────────────────────────────────
const run = async () => {
  const src = await mongoose.createConnection(fromUri, { serverSelectionTimeoutMS: 15000 }).asPromise();
  const dst = await mongoose.createConnection(toUri, { serverSelectionTimeoutMS: 15000 }).asPromise();

  try {
    // الاسم الفعلي للقاعدة بعد الاتصال (إذا رابط المصدر بلا اسم، MongoDB بيستعمل "test")
    const srcKey = `${hostOf(fromUri)}/${src.name}`;
    const dstKey = `${hostOf(toUri)}/${dst.name}`;
    if (srcKey === dstKey || src.name === dst.name)
      fail(`المصدر والهدف نفس القاعدة (${src.name}) — منوقف`);

    console.log(`\nالمصدر (قراءة بس): ${hostOf(fromUri)} / ${src.name}`);
    console.log(`الهدف (بيتمسح وبينكتب): ${hostOf(toUri)} / ${dst.name}\n`);

    const summary = [];
    for (const name of COLLECTIONS) {
      const docs = await src.db.collection(name).find({}).toArray();
      const target = dst.db.collection(name);
      const removed = (await target.deleteMany({})).deletedCount;
      if (docs.length) await target.insertMany(docs, { ordered: false });
      summary.push({ collection: name, copied: docs.length, "removed from test": removed });
    }

    console.table(summary);
    console.log(`\n✅ تم النسخ لـ "${dst.name}". المصدر ما انلمس.`);
  } finally {
    await Promise.allSettled([src.close(), dst.close()]);
  }
};

run().catch((err) => {
  console.error("❌ فشل السكربت:", err.message);
  process.exitCode = 1;
});
