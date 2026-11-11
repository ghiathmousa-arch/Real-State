// راوتات "اعرض عقارك" — /api/property-requests
// POST / عام (زائر بيعرض عقاره). الباقي للأدمن والسب أدمن (staffOnly): القائمة، العدد، الرفض، والتحويل لعقار.
// اسم ورقم المالك بيضلوا بالطلب بس — ما بيروحوا على Property أبداً.

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const PropertyRequest = require("../models/PropertyRequest");
const Property = require("../models/Property");
const { upload, uploadRequestImages, compressImages, deleteCloudinaryImages } = require("../middleware/upload");
const { protect, staffOnly, requestLimiter } = require("../middleware");
const { CITIES, CATEGORIES } = require("../constants/property");
const { parseListingPrices, parseFurnished, findEn, toNum, toLatinDigits, CITY_ERROR_MSG, CATEGORY_ERROR_MSG, buildNewPropertyData } = require("../utils/propertyFields");
const { invalidatePropertiesCache } = require("./properties");

const SERVER_ERROR = "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً";
const MAX_PROPERTY_IMAGES = 12; // نفس حد صور العقار

// الصور بتنرفع على Cloudinary قبل الحفظ — إذا الطلب فشل (>= 400) منحذفها عشان ما تضل يتيمة
const discardUploadsOnError = (req, res) => {
  res.on("finish", () => {
    if (res.statusCode >= 400 && req.compressedImages?.length)
      deleteCloudinaryImages(req.compressedImages);
  });
};

// ── التحقق من الطلب العام (قبل رفع الصور) ────────────────────
const PHONE_RE = /^\+?[0-9]{7,20}$/;
const validateRequestBody = (b) => {
  const errors = {};
  const ownerName = String(b.ownerName ?? "").trim();
  // منشيل المسافات والشرطات من الرقم — كبار العمر بيكتبوه "0991 234 567"
  // والأرقام العربية (٠٩٩...) بتتحوّل قبل
  const ownerPhone = toLatinDigits(b.ownerPhone).replace(/[\s-]/g, "");

  if (!ownerName) errors.ownerName = "الاسم مطلوب";
  else if (ownerName.length > 100) errors.ownerName = "الاسم طويل كتير";
  if (!ownerPhone) errors.ownerPhone = "رقم الهاتف مطلوب";
  else if (!PHONE_RE.test(ownerPhone)) errors.ownerPhone = "رقم الهاتف لازم يكون أرقام بس (7–20 رقم)";
  if (b.type !== "buy" && b.type !== "rent") errors.type = "اختار بيع أو إيجار";
  if (!findEn(CATEGORIES, b.category)) errors.category = b.category ? CATEGORY_ERROR_MSG : "الفئة مطلوبة";
  if (!findEn(CITIES, b.city)) errors.city = b.city ? CITY_ERROR_MSG : "المدينة مطلوبة";
  if (String(b.description ?? "").length > 3000) errors.description = "الوصف أطول من 3000 حرف";
  if (String(b.ownerNote ?? "").length > 1000) errors.ownerNote = "الملاحظة أطول من 1000 حرف";
  if (String(b.address ?? "").length > 300) errors.address = "العنوان طويل كتير";
  for (const f of ["area", "rooms", "bathrooms"]) {
    const n = toNum(b[f]);
    if (n !== null && (!Number.isFinite(n) || n < 0)) errors[f] = "لازم يكون رقم موجب";
  }

  const prices = b.type === "buy" || b.type === "rent" ? parseListingPrices(b) : { price: null, rentPrices: {} };
  if (prices.error) errors.price = prices.error;

  if (Object.keys(errors).length) return { errors };

  return {
    data: {
      ownerName,
      ownerPhone,
      ownerNote: String(b.ownerNote ?? "").trim(),
      type: b.type,
      category: String(b.category).trim(),
      city: String(b.city).trim(),
      area: toNum(b.area),
      rooms: toNum(b.rooms),
      bathrooms: toNum(b.bathrooms),
      address: String(b.address ?? "").trim(),
      description: String(b.description ?? "").trim(),
      price: prices.price,
      rentPrices: prices.rentPrices,
      furnished: parseFurnished(b.furnished),
    },
  };
};

// honeypot: حقل "website" مخفي بالفورم — البشر ما بيشوفوه، البوتات بتعبّيه
const isBot = (b) => typeof b.website === "string" && b.website.trim() !== "";

// ── POST / (عام) ──────────────────────────────────────────
// الترتيب: rate limit ← قراءة الفورم (الصور بالذاكرة) ← honeypot ← تحقق ← رفع الصور لـ Cloudinary ← حفظ.
// هيك البيانات الغلط والبوتات ما بيرفعوا ولا صورة.
router.post(
  "/",
  requestLimiter,
  uploadRequestImages,
  (req, res, next) => {
    // نجاح وهمي للبوت — ما منحفظ شي وما منرفع شي
    if (isBot(req.body)) return res.status(201).json({ message: "تم استلام طلبك" });

    const checked = validateRequestBody(req.body);
    if (checked.errors)
      return res.status(400).json({ error: Object.values(checked.errors)[0], fields: checked.errors });

    req.requestData = checked.data;
    next();
  },
  compressImages,
  async (req, res) => {
    discardUploadsOnError(req, res);
    try {
      await PropertyRequest.create({ ...req.requestData, images: req.compressedImages || [] });
      // رسالة نجاح بس — بدون بيانات الطلب
      res.status(201).json({ message: "تم استلام طلبك — فريقنا بيتواصل معك قريباً" });
    } catch (error) {
      console.error("PropertyRequest POST Error:", error);
      if (error.name === "ValidationError")
        return res.status(400).json({ error: "تأكد من صحة البيانات المدخلة" });
      res.status(500).json({ error: SERVER_ERROR });
    }
  }
);

// ── GET / (أدمن وسب أدمن) ─────────────────────────────────
// ?status=new|converted|rejected — الأحدث أول
const STATUSES = ["new", "converted", "rejected"];
router.get("/", protect, staffOnly, async (req, res) => {
  try {
    const { status } = req.query;
    if (status !== undefined && !STATUSES.includes(status))
      return res.status(400).json({ error: "الحالة غير صالحة — المسموح: new, converted, rejected" });

    const requests = await PropertyRequest.find(status ? { status } : {}).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("PropertyRequest GET Error:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
});

// ── GET /count — عدد الطلبات الجديدة (للـ badge) ───────────
router.get("/count", protect, staffOnly, async (req, res) => {
  try {
    const count = await PropertyRequest.countDocuments({ status: "new" });
    res.json({ count });
  } catch (error) {
    console.error("PropertyRequest Count Error:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
});

// ── GET /:id — طلب واحد (صفحة التحويل بالداشبورد بتجيبه بعد أي refresh) ──
router.get("/:id", protect, staffOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID غير صالح" });
    const request = await PropertyRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "الطلب غير موجود" });
    res.json(request);
  } catch (error) {
    console.error("PropertyRequest GetById Error:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
});

// جلب طلب جديد (مش محوّل ولا مرفوض) — بيرجّع الطلب أو بيرد بالخطأ
const findNewRequest = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: "ID غير صالح" });
    return null;
  }
  const request = await PropertyRequest.findById(req.params.id);
  if (!request) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return null;
  }
  if (request.status !== "new") {
    res.status(409).json({ error: "هالطلب انعالج من قبل" });
    return null;
  }
  return request;
};

// ── POST /:id/reject ──────────────────────────────────────
// رفض الطلب + سبب اختياري، وصوره بتنحذف من Cloudinary
router.post("/:id/reject", protect, staffOnly, async (req, res) => {
  try {
    const request = await findNewRequest(req, res);
    if (!request) return;

    const images = request.images || [];
    request.status = "rejected";
    request.rejectReason = String(req.body?.reason ?? "").trim().slice(0, 500);
    request.handledBy = { id: req.user._id, name: req.user.name };
    request.images = []; // الروابط ما عاد إلها وجود بعد الحذف
    await request.save();

    res.json({ message: "تم رفض الطلب" });
    deleteCloudinaryImages(images);
  } catch (error) {
    console.error("PropertyRequest Reject Error:", error);
    res.status(500).json({ error: SERVER_ERROR });
  }
});

// ── POST /:id/convert ─────────────────────────────────────
// بيستقبل بيانات فورم الإضافة النهائية (بعد تعديل الأدمن) + keepRequestImages (JSON array لصور الطلب
// اللي لازم تنتقل للعقار) + أي صور جديدة، وبيعمل Property حقيقي بنفس منطق POST /api/properties.
// createdBy = اللي حوّله. صور الطلب اللي ما انحطت بالعقار بتنحذف من Cloudinary.
router.post("/:id/convert", protect, staffOnly, upload.any(), compressImages, async (req, res) => {
  discardUploadsOnError(req, res);
  try {
    const request = await findNewRequest(req, res);
    if (!request) return;

    let keep = request.images || [];
    if (req.body.keepRequestImages !== undefined) {
      let parsed;
      try { parsed = JSON.parse(req.body.keepRequestImages); } catch { parsed = null; }
      if (!Array.isArray(parsed))
        return res.status(400).json({ error: "قائمة صور الطلب (keepRequestImages) غير صالحة" });
      // بس صور هالطلب، بالترتيب المطلوب وبدون تكرار
      keep = [...new Set(parsed)].filter((url) => request.images.includes(url));
    }

    const images = [...keep, ...(req.compressedImages || [])];
    if (images.length > MAX_PROPERTY_IMAGES)
      return res.status(400).json({ error: `الحد الأقصى ${MAX_PROPERTY_IMAGES} صورة للعقار — المجموع صار ${images.length}` });

    // بيانات المالك (الاسم والرقم) ما بتنبعت هون أصلاً — buildNewPropertyData بتاخد حقول العقار بس
    const built = buildNewPropertyData(req.body, images, req.user);
    if (built.error) return res.status(400).json({ error: built.error });

    const property = await Property.create(built.data);
    // الصور الجديدة صارت تابعة للعقار — أي خطأ بعد هون ما لازم يحذفها
    req.compressedImages = [];

    request.status = "converted";
    request.propertyId = property._id;
    request.handledBy = { id: req.user._id, name: req.user.name };
    const dropped = request.images.filter((url) => !keep.includes(url));
    request.images = keep;
    await request.save();

    invalidatePropertiesCache();
    res.status(201).json(property);
    deleteCloudinaryImages(dropped);
  } catch (error) {
    console.error("PropertyRequest Convert Error:", error);
    if (error.name === "ValidationError" || error.name === "CastError")
      return res.status(400).json({ error: "بيانات العقار غير صالحة — تأكد من النوع والحالة والأرقام" });
    res.status(500).json({ error: SERVER_ERROR });
  }
});

module.exports = router;
