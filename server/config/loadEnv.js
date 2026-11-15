// تحميل متغيرات البيئة — مكان واحد للسيرفر وللسكريبتات.
// بدون ENV_FILE: server/.env متل قبل تماماً.
// مع ENV_FILE (مثلاً ".env.test"): بيقرا هالملف بدالو — نسبي لمجلد server أو مسار كامل.
//   PowerShell:  $env:ENV_FILE=".env.test"; npm run dev
// بيئة الاختبار (ENV_FILE) لازم تكون على قاعدة اسمها فيه "test" — وإلا منوقف، عشان ما نشتغل
// على القاعدة الحية بالغلط.

const path = require("path");
const dotenv = require("dotenv");

const SERVER_DIR = path.join(__dirname, "..");

const resolveEnvPath = () =>
  process.env.ENV_FILE
    ? path.resolve(SERVER_DIR, process.env.ENV_FILE)
    : path.join(SERVER_DIR, ".env");

// اسم القاعدة المكتوب بالرابط (mongodb://host/<db>?...) — "" إذا مش مكتوب
// (بهالحالة MongoDB بيستعمل "test" افتراضياً، فما منعتمد عليه)
const dbNameFromUri = (uri) => {
  const m = String(uri || "").match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]*)/);
  return m ? decodeURIComponent(m[1]) : "";
};

const loadEnv = () => {
  const envPath = resolveEnvPath();
  const result = dotenv.config({ path: envPath });

  if (process.env.ENV_FILE) {
    if (result.error) {
      console.error(`❌ ENV_FILE: ما قدرت اقرا ${envPath}`);
      process.exit(1);
    }
    const db = dbNameFromUri(process.env.MONGO_URI);
    if (!db || !db.toLowerCase().includes("test")) {
      console.error(`❌ ENV_FILE=${process.env.ENV_FILE}: MONGO_URI لازم يكون لقاعدة اسمها فيه "test" ومكتوب صراحة بالرابط (هلق: "${db || "مش مكتوب"}") — منوقف عشان ما نلمس القاعدة الحية`);
      process.exit(1);
    }
    console.log(`🧪 بيئة اختبار: ${path.basename(envPath)} — القاعدة "${db}"${process.env.DISABLE_CLOUDINARY_DELETE === "true" ? " — حذف Cloudinary متوقف" : " — ⚠️ حذف Cloudinary شغّال!"}`);
  }
  return envPath;
};

module.exports = { loadEnv, resolveEnvPath, dbNameFromUri, SERVER_DIR };
