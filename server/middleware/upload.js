const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;

// ── إعداد Cloudinary ──────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── إعداد Multer (تخزين مؤقت بالـ RAM) ───────────────────────────────────────
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 7 * 1024 * 1024 }, // أقصى حجم 7 ميجا
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const isMimetype = allowed.test(file.mimetype);
    const isExtname = allowed.test(path.extname(file.originalname).toLowerCase());

    if (isMimetype && isExtname) {
      cb(null, true);
    } else {
      cb(new Error("يرجى رفع صور فقط بلاحقة مدعومة"));
    }
  },
});

// ── ضغط الصور ورفعها على Cloudinary ─────────────────────────────────────────
const compressImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    req.compressedImages = [];
    return next();
  }

  req.compressedImages = [];

  try {
    await Promise.all(
      req.files.map(async (file) => {
        // ضغط الصورة بـ sharp وتحويلها WebP في الذاكرة
        const compressedBuffer = await sharp(file.buffer)
          .resize(1200, null, { withoutEnlargement: true })
          .webp({ quality: 75 })
          .toBuffer();

        // رفع الصورة المضغوطة مباشرة على Cloudinary
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "real-state",           // مجلد على Cloudinary
              public_id: uuidv4(),            // اسم فريد
              resource_type: "image",
              format: "webp",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(compressedBuffer);
        });

        req.compressedImages.push(result.secure_url); // رابط HTTPS دائم من Cloudinary
      })
    );

    next();
  } catch (error) {
    res.status(500).json({ error: "فشلت عملية معالجة الصور: " + error.message });
  }
};

module.exports = { upload, compressImages };