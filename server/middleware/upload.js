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

const compressImages = async (req, res, next) => {
  configureCloudinary();
  // ✅ تم حذف الـ console.log الذي كان يكشف مفاتيح Cloudinary

  if (!req.files || req.files.length === 0) {
    req.compressedImages = [];
    return next();
  }

  req.compressedImages = [];

  try {
    await Promise.all(
      req.files.map(async (file) => {
        const compressedBuffer = await sharp(file.buffer)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer();

        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "real-state",
              public_id: uuidv4(),
              resource_type: "image",
              format: "webp"
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary Upload Error:", error.message); // ✅ بدون تفاصيل حساسة
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          stream.end(compressedBuffer);
        });

        req.compressedImages.push(result.secure_url);
      })
    );
    next();
  } catch (error) {
    res.status(500).json({ error: "فشلت عملية معالجة الصور" }); // ✅ بدون تفاصيل error.message
  }
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