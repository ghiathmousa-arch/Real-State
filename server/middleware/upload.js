const multer = require("multer"); // مكتبة استقبال الملفات من الـ Form
const path = require("path"); // للتعامل مع مسارات المجلدات
const fs = require("fs"); // للتحكم بالملفات (إنشاء مجلد uploads)
const sharp = require("sharp"); // المكتبة الأساسية لضغط الصور
const { v4: uuidv4 } = require("uuid"); // لتوليد اسم عشوائي فريد لكل صورة

// إعداد التخزين في الذاكرة المؤقتة (RAM) بدلاً من الهاردسك لتجنب حفظ الصور الأصلية الكبيرة
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 7 * 1024 * 1024 }, // أقصى حجم مسموح 7 ميجا بايت
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/; // اللواحق المسموح بها
    const isMimetype = allowed.test(file.mimetype);
    const isExtname = allowed.test(path.extname(file.originalname).toLowerCase());

    if (isMimetype && isExtname) {
      cb(null, true); // اقبل الملف إذا كان صورة
    } else {
      cb(new Error("يرجى رفع صور فقط بلاحقة مدعومة")); // ارفض الملف إذا كان شيئاً آخر
    }
  }
});

// وظيفة ضغط الصور وتحويلها لصيغة WebP
const compressImages = async (req, res, next) => {
  // إذا لم يرفع المستخدم أي صور، ننشئ مصفوفة فارغة ونكمل العمل (حتى لا يتوقف السيرفر)
  if (!req.files || req.files.length === 0) {
    req.compressedImages = [];
    return next();
  }

  const uploadDir = path.join(__dirname, "../uploads");
  // إنشاء المجلد إذا لم يكن موجوداً على السيرفر
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  req.compressedImages = []; // مصفوفة لتخزين الروابط التي ستذهب لقاعدة البيانات

  try {
    // معالجة جميع الصور المرفوعة في وقت واحد لسرعة الاستجابة
    await Promise.all(
      req.files.map(async (file) => {
        const fileName = `${uuidv4()}.webp`; // تحويل اسم الصورة لاسم فريد وصيغة WebP الخفيفة
        const filePath = path.join(uploadDir, fileName); // المسار الكامل للملف على الجهاز

        await sharp(file.buffer) // قراءة الملف من الذاكرة المؤقتة
          .resize(1200, null, { withoutEnlargement: true }) // تصغير العرض لـ 1200 بكسل إذا كانت الصورة ضخمة
          .webp({ quality: 75 }) // ضغط الجودة لـ 75% (توازن ممتاز بين الحجم والوضوح)
          .toFile(filePath); // حفظ النسخة المضغوطة فقط في مجلد uploads

        req.compressedImages.push(`/uploads/${fileName}`); // إضافة الرابط للمصفوفة
      })
    );
    next(); // الانتقال للمرحلة التالية (حفظ البيانات في الداتابيز)
  } catch (error) {
    res.status(500).json({ error: "فشلت عملية معالجة الصور: " + error.message });
  }
};

module.exports = { upload, compressImages }; // تصدير الأدوات لاستخدامها في الراوتس