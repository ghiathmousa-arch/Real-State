const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim(),
  });
};

const storage = multer.memoryStorage();

// صور بس (نفس الفلتر للعقارات ولفورم "اعرض عقارك")
const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const isMimetype = allowed.test(file.mimetype);
  const isExtname = allowed.test(path.extname(file.originalname).toLowerCase());
  if (isMimetype && isExtname) cb(null, true);
  else cb(new Error("يرجى رفع صور فقط بلاحقة مدعومة"));
};

const upload = multer({
  storage,
  limits: {
    fileSize: 7 * 1024 * 1024, // أقصى حجم للصورة الواحدة: 7 ميجا
    files: 12                  // ✅ أقصى عدد صور بالطلب الواحد: 12
  },
  fileFilter: imageFileFilter,
});

// رفع صور فورم "اعرض عقارك" العام — نفس الفلتر والحجم (7MB) وحد أقصى 12 صورة (متل العقار) بحقل "images"
const REQUEST_MAX_IMAGES = 12;
const requestUpload = multer({
  storage,
  limits: { fileSize: 7 * 1024 * 1024, files: REQUEST_MAX_IMAGES },
  fileFilter: imageFileFilter,
});

// ملفوف عشان أخطاء الرفع (عدد/حجم/نوع) ترجع 400 برسالة خاصة بالفورم بدل رسالة الـ 12 صورة العامة
const uploadRequestImages = (req, res, next) => {
  requestUpload.array("images", REQUEST_MAX_IMAGES)(req, res, (err) => {
    if (!err) return next();
    const messages = {
      LIMIT_FILE_COUNT: `الحد الأقصى ${REQUEST_MAX_IMAGES} صور`,
      LIMIT_UNEXPECTED_FILE: `الحد الأقصى ${REQUEST_MAX_IMAGES} صور`,
      LIMIT_FILE_SIZE: "حجم الصورة الواحدة لازم يكون أقل من 7 ميجابايت",
    };
    res.status(400).json({ error: messages[err.code] || err.message || "تعذّر رفع الصور" });
  });
};

// ضغط الصور ورفعها لـ Cloudinary.
// • الصور الصغيرة (المتصفح صغّرها أصلاً لـ 1600px — shrinkImage بالواجهة): بتنرفع لـ Cloudinary مباشرة
//   بدون sharp، وCloudinary بيحوّلها لـ webp. السيرفر المجاني ضعيف، وإعادة الضغط كانت تاخد ثواني لكل صورة.
// • الصور الكبيرة (مثلاً من API مباشر أو متصفح ما صغّر): sharp — **وحدة وحدة** بقفل، لأن صورة الموبايل
//   (~12 ميغابكسل) بتاخد ~50MB بالذاكرة وكذا وحدة سوا كانت تتجاوز ذاكرة Render (512MB).
//   .rotate() بيطبّق اتجاه الصورة (EXIF).
// • الرفع لـ Cloudinary بيصير 3 صور بنفس الوقت (شبكة مش ذاكرة) — والترتيب بيضل متل ما اختاره المستخدم.
// • إذا فشلت أي صورة، منحذف اللي انرفع عشان ما يضل يتيم على Cloudinary.
sharp.cache(false);
sharp.concurrency(1);

const MAX_DIM = 1600;
const SMALL_FILE_BYTES = 1.5 * 1024 * 1024;
const UPLOAD_CONCURRENCY = 3;

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "real-state", public_id: uuidv4(), resource_type: "image", format: "webp" },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });

// قفل بسيط: شغلة sharp وحدة بالمرة (حماية الذاكرة)
let sharpQueue = Promise.resolve();
const withSharpLock = (fn) => {
  const run = sharpQueue.then(fn, fn);
  sharpQueue = run.catch(() => {});
  return run;
};

// الصورة جاهزة للرفع المباشر؟ (صغيرة، وأبعادها ≤ 1600 — قراءة الـ header بس، رخيصة)
const isAlreadySmall = async (buffer) => {
  if (buffer.length > SMALL_FILE_BYTES) return false;
  try {
    const { width, height } = await sharp(buffer).metadata();
    return Boolean(width && height && Math.max(width, height) <= MAX_DIM);
  } catch {
    return false;
  }
};

const prepareImage = async (file) => {
  const buffer = file.buffer;
  file.buffer = null; // منحرّر النسخة بالـ req بأسرع وقت
  if (await isAlreadySmall(buffer)) return buffer;
  return withSharpLock(() =>
    sharp(buffer, { failOn: "none" })
      .rotate()
      .resize(MAX_DIM, MAX_DIM, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer()
  );
};

const compressImages = async (req, res, next) => {
  configureCloudinary();
  req.compressedImages = [];

  const files = req.files || [];
  if (files.length === 0) return next();

  const urls = new Array(files.length); // نفس ترتيب المستخدم
  let failed = null;
  let nextIndex = 0;

  const worker = async () => {
    while (!failed && nextIndex < files.length) {
      const i = nextIndex++;
      try {
        const buffer = await prepareImage(files[i]);
        urls[i] = (await uploadToCloudinary(buffer)).secure_url;
      } catch (error) {
        failed = failed || error;
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, worker));

  if (failed) {
    // التفاصيل باللوغ بس (بدون مفاتيح) — للمستخدم رسالة عامة
    console.error("compressImages Error:", failed?.message || failed);
    deleteCloudinaryImages(urls.filter(Boolean));
    return res.status(500).json({ error: "فشلت عملية معالجة الصور — جرّب صور أقل أو أصغر" });
  }

  req.compressedImages = urls;
  next();
};

// ── حذف الصور من Cloudinary ─────────────────────────────────
// رابط Cloudinary بالصيغة: https://res.cloudinary.com/<cloud>/image/upload/[تحويلات/]v123/real-state/<id>.webp
// والـ public_id هو "real-state/<id>" (بدون الإصدار v123 وبدون الامتداد)
const CLOUDINARY_FOLDER = "real-state";

const getCloudinaryPublicId = (url) => {
  if (typeof url !== "string" || !url.includes("res.cloudinary.com")) return null;

  const afterUpload = url.split("?")[0].split("/upload/")[1];
  if (!afterUpload) return null;

  const segments = afterUpload.split("/");
  // منشيل أي تحويلات (f_auto,q_auto...) والإصدار v123 من البداية
  const versionIdx = segments.findIndex((s) => /^v\d+$/.test(s));
  const rest = versionIdx >= 0
    ? segments.slice(versionIdx + 1)
    : segments.slice(segments.findIndex((s) => s === CLOUDINARY_FOLDER));

  const publicId = rest.join("/").replace(/\.[a-z0-9]+$/i, "");

  // أمان: منحذف بس صور مجلد العقارات تبعنا — ما منلمس أي شي تاني بالحساب
  return publicId.startsWith(`${CLOUDINARY_FOLDER}/`) ? publicId : null;
};

// بتحذف مجموعة صور من Cloudinary. ما بترمي أبداً — الفشل بينسجّل بالـ log بس،
// عشان حذف صورة ما يفشّل طلب الحذف أو التعديل نفسه
const deleteCloudinaryImages = async (urls) => {
  const publicIds = [...new Set((urls || []).map(getCloudinaryPublicId).filter(Boolean))];
  if (publicIds.length === 0) return;

  // بيئة الاختبار: النسخة فيها نفس روابط صور الموقع الحي — أي حذف كان رح يمسح صور العقارات
  // الحقيقية. DISABLE_CLOUDINARY_DELETE=true = منطبع شو كان رح ينحذف وما منحذف شي
  if (process.env.DISABLE_CLOUDINARY_DELETE === "true") {
    console.log(`🧪 [DISABLE_CLOUDINARY_DELETE] ما انحذف شي — كان رح ينحذف (${publicIds.length}):`, publicIds.join(", "));
    return;
  }

  try {
    configureCloudinary();
    const results = await Promise.allSettled(
      publicIds.map((id) => cloudinary.uploader.destroy(id, { resource_type: "image" }))
    );

    results.forEach((r, i) => {
      if (r.status === "rejected")
        console.error("Cloudinary Delete Error:", publicIds[i], r.reason?.message || r.reason);
      else if (r.value?.result !== "ok")
        console.warn("Cloudinary Delete:", publicIds[i], r.value?.result); // مثلاً "not found"
    });
  } catch (error) {
    console.error("Cloudinary Delete Error:", error.message);
  }
};

module.exports = { upload, uploadRequestImages, compressImages, deleteCloudinaryImages, getCloudinaryPublicId };