const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Property = require("../models/Property");
const { upload, compressImages, deleteCloudinaryImages } = require("../middleware/upload");
const { protect, adminOnly, staffOnly } = require("../middleware");
const { CITIES, CATEGORIES } = require("../constants/property");

// ── كاش بسيط بالذاكرة ────────────────────────────────────────
// نكاش القائمة العامة (بدون فلاتر)، قائمة الأدمن، المميزة، وتفاصيل كل عقار لفترة قصيرة
// (تخفيف الضغط عن الأكتر endpoints استدعاءً)، ونصفّرها فوراً عند أي
// إضافة/تعديل/حذف بنفس الراوتر — عشان الأدمن ما يشوف بيانات قديمة بعد أي تغيير
const CACHE_TTL_MS = 30 * 1000;
const cache = {
  list: null,      // القائمة العامة — النشط بس
  adminList: null, // قائمة الأدمن — كل الحالات (منفصلة عشان ما يتسرّب المعلّق/المباع للعام)
  featured: null,
  byId: new Map(),
};
const isFresh = (entry) => !!entry && entry.expiresAt > Date.now();
const invalidatePropertiesCache = () => {
  cache.list = null;
  cache.adminList = null;
  cache.featured = null;
  cache.byId.clear();
};

// الصور بتنرفع على Cloudinary (compressImages) قبل ما نوصل للتحقق — فإذا الطلب فشل
// لأي سبب (400/404/500) منحذف الصور الجديدة يلي انرفعت عشان ما تضل يتيمة بالحساب
const discardUploadsOnError = (req, res) => {
  res.on("finish", () => {
    if (res.statusCode >= 400 && req.compressedImages?.length)
      deleteCloudinaryImages(req.compressedImages);
  });
};

// أخطاء تحقق الموديل (نوع غير buy/rent، حالة غير معروفة، رقم غير صالح...) غلط بالبيانات مش بالسيرفر
const VALIDATION_ERROR_MSG = "بيانات العقار غير صالحة — تأكد من النوع (بيع/إيجار) والحالة والأرقام";

// الراوتات العامة ما بترجّع طلبات التعديل المعلّقة ولا ID المستخدم اللي أضاف العقار
const PUBLIC_SELECT = "-pendingChanges -createdBy.id";

const MAX_IMAGES = 12; // الحد الأقصى لصور العقار الواحد (نفس حد multer بـ upload.js)

// التحقق من السعر و rentPrices ومفروش والمدينة/الفئة — مشترك مع راوتات "اعرض عقارك"
const {
  parsePrice, EMPTY_RENT_PRICES, parseRentPrices, FURNISHED_VALUES, parseFurnished, RENT_PERIODS,
  findEn, CITY_ERROR_MSG, CATEGORY_ERROR_MSG, buildNewPropertyData, toNum, toLatinDigits,
} = require("../utils/propertyFields");

// ── GET / ──────────────────────────────────────────────────
// القائمة العامة: بترجّع العقارات النشطة بس (status: "active") — المعلّق والمباع ما بيظهروا بالموقع
router.get("/", async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, type, search, rentPeriod, furnished } = req.query;
    const hasFilters = Boolean(
      category || city || minPrice || maxPrice || type || search || rentPeriod || furnished
    );

    if (rentPeriod !== undefined && !RENT_PERIODS.includes(rentPeriod))
      return res.status(400).json({ error: "مدة الإيجار غير صالحة — المسموح: daily, weekly, monthly, yearly" });
    if (furnished !== undefined && !FURNISHED_VALUES.includes(furnished))
      return res.status(400).json({ error: "قيمة مفروش غير صالحة — المسموح: furnished, unfurnished" });

    // القائمة الكاملة (بدون فلاتر) هي الأكتر استدعاءً — كاشها لوحدها كافي
    if (!hasFilters && isFresh(cache.list)) {
      return res.json(cache.list.data);
    }

    let query = { status: "active" };

    if (category) query.category = category;
    if (city) query.city = city;
    if (type) query.type = type;
    if (furnished) query.furnished = furnished;

    // مع rentPeriod: بس العقارات اللي إلها سعر لهالمدة، وفلتر السعر بينطبق على هالمدة بدل price
    const priceField = rentPeriod ? `rentPrices.${rentPeriod}` : "price";
    if (rentPeriod) query[priceField] = { $ne: null };

    if (minPrice || maxPrice) {
      query[priceField] = query[priceField] || {};
      if (minPrice) query[priceField].$gte = parseFloat(toLatinDigits(minPrice));
      if (maxPrice) query[priceField].$lte = parseFloat(toLatinDigits(maxPrice));
    }

    if (search) {
      if (search.length > 100) {
        return res.status(400).json({ error: "نص البحث طويل جداً" });
      }

      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { city: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const properties = await Property.find(query).select(PUBLIC_SELECT);

    if (!hasFilters) {
      cache.list = { data: properties, expiresAt: Date.now() + CACHE_TTL_MS };
    }

    res.json(properties);
  } catch (error) {
    console.error("Properties GET Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── GET /featured ──────────────────────────────────────────
router.get("/featured", async (req, res) => {
  try {
    if (isFresh(cache.featured)) {
      return res.json(cache.featured.data);
    }

    const properties = await Property.find({ isFeatured: true, status: "active" }).select(PUBLIC_SELECT);
    cache.featured = { data: properties, expiresAt: Date.now() + CACHE_TTL_MS };
    res.json(properties);
  } catch (error) {
    console.error("Properties Featured Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── GET /admin/all ─────────────────────────────────────────
// لوحة التحكم (أدمن وسب أدمن): كل العقارات بكل الحالات. لازم يجي قبل /:id وإلا "admin" بينقرا كـ id
// ?createdBy=<userId> = عقارات شخص معيّن — النتيجة المفلترة ما بتنكاش
router.get("/admin/all", protect, staffOnly, async (req, res) => {
  try {
    const { createdBy } = req.query;
    if (createdBy !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(createdBy))
        return res.status(400).json({ error: "معرّف المستخدم غير صالح" });
      const properties = await Property.find({ "createdBy.id": createdBy }).sort({ createdAt: -1 });
      return res.json(properties);
    }

    if (isFresh(cache.adminList)) {
      return res.json(cache.adminList.data);
    }

    const properties = await Property.find().sort({ createdAt: -1 });
    cache.adminList = { data: properties, expiresAt: Date.now() + CACHE_TTL_MS };
    res.json(properties);
  } catch (error) {
    console.error("Properties Admin GET Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── GET /pending-changes ───────────────────────────────────
// طلبات تعديل السب أدمن بانتظار الموافقة (الأقدم أول). لازم يجي قبل /:id
router.get("/pending-changes", protect, adminOnly, async (req, res) => {
  try {
    const properties = await Property
      .find({ pendingChanges: { $ne: null } })
      .sort({ "pendingChanges.submittedAt": 1 });
    res.json(properties);
  } catch (error) {
    console.error("Properties Pending GET Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── GET /recent ────────────────────────────────────────────
// آخر النشاطات بالداشبورد (RecentActivities) — بترجّع كل الحالات (معلّق ومباع)
// فلازم تكون للأدمن بس، والموقع العام ما بيستدعيها
router.get("/recent", protect, adminOnly, async (req, res) => {
  try {
    const properties = await Property
      .find()
      .sort({ "action.at": -1, createdAt: -1 })
      .limit(5)
      .select("title city price status action");
    res.json(properties);
  } catch (error) {
    console.error("Properties Recent Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── GET /:id ───────────────────────────────────────────────
// بترجّع العقار مهما كانت حالته (حتى المباع) عشان الروابط القديمة تضل تفتح —
// والواجهة بتعرض شارة "مباع" أو "معلّق" واضحة
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID غير صالح" });

    const cached = cache.byId.get(req.params.id);
    if (isFresh(cached)) {
      return res.json(cached.data);
    }

    const property = await Property.findById(req.params.id).select(PUBLIC_SELECT);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });

    cache.byId.set(req.params.id, { data: property, expiresAt: Date.now() + CACHE_TTL_MS });
    res.json(property);
  } catch (error) {
    console.error("Properties GetById Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── POST / ─────────────────────────────────────────────────
// أدمن وسب أدمن — الإضافة بتنزل فوراً للاتنين. السب أدمن ما بيقدر يحط isFeatured
router.post("/", protect, staffOnly, upload.any(), compressImages, async (req, res) => {
  discardUploadsOnError(req, res);
  try {
    // التحقق وبناء البيانات بدالة مشتركة (نفسها بتحويل "طلب عرض" لعقار)
    const built = buildNewPropertyData(req.body, req.compressedImages, req.user);
    if (built.error) return res.status(400).json({ error: built.error });

    const property = await Property.create(built.data);

    invalidatePropertiesCache();
    res.status(201).json(property);
  } catch (error) {
    console.error("Properties POST Error:", error);
    if (error.name === "ValidationError" || error.name === "CastError")
      return res.status(400).json({ error: VALIDATION_ERROR_MSG });
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── التعديل: دالة مشتركة ───────────────────────────────────
// منطق تعديل العقار كامل (الحقول، السعر و rentPrices، مفروش، cityEn/categoryEn، الصور keep+new
// مع MAX_IMAGES) — بتستعمله الـ PUT تبع الأدمن، الموافقة على طلب تعديل السب أدمن،
// والتحقق المسبق من طلب السب أدمن (dryRun) قبل ما ينحفظ.
//   body: الحقول متل body الـ PUT (الحقل ما انبعت = يضل القديم). keepImages: JSON string أو array
//   newImages: روابط صور جديدة مرفوعة على Cloudinary
//   user: مين عمل التعديل (بيروح لـ action.by)
//   options.allowFeatured: الأدمن بس بيقدر يغيّر isFeatured
//   options.dryRun: بس تحقق ورجّع النتيجة بدون حفظ
//   options.extraUpdate: حقول إضافية بتنحفظ بنفس العملية (مثلاً pendingChanges: null)
// بترجّع { error, status } إذا البيانات غلط، أو { updated, removedImages } — والمستدعي
// مسؤول يحذف removedImages من Cloudinary بعد نجاح الحفظ.
const applyPropertyUpdate = async (property, body, newImages, user, options = {}) => {
  const { allowFeatured = false, dryRun = false, extraUpdate = {} } = options;
  const b = body || {};
  const fail = (error) => ({ error, status: 400 });

  // البيع: السعر ما انبعت = منخلّي القديم؛ انبعت = لازم يكون صالح. rentPrices بتتصفّر.
  // الإيجار: price = null، وأسعار المدد نفس القاعدة (ما انبعت = القديم، "" = null).
  // هيك تغيير النوع بيصفّر الطرف التاني تلقائياً.
  const type = b.type ?? property.type;
  let price = null;
  let rentPrices = { ...EMPTY_RENT_PRICES };
  if (type === "rent") {
    const parsed = parseRentPrices(b, property.type === "rent" ? property.rentPrices : EMPTY_RENT_PRICES);
    if (parsed.error) return fail(parsed.error);
    rentPrices = parsed.value;
  } else {
    price = property.type === "rent" ? null : property.price;
    if (b.price !== undefined) {
      const parsed = parsePrice(b.price);
      if (parsed.error) return fail(parsed.error);
      price = parsed.value;
    }
  }

  const furnished = b.furnished !== undefined ? parseFurnished(b.furnished) : property.furnished ?? null;

  // المدينة/الفئة: إذا تغيّرت لازم تكون من القائمة، والإنجليزي بيتحدّث معها.
  // إذا ما تغيّرت منقبل القيمة القديمة حتى لو مش بالقائمة (عقارات قديمة) عشان ما ينقفل تعديلها
  const city = b.city !== undefined ? String(b.city).trim() : property.city;
  const cityEn = findEn(CITIES, city);
  if (!cityEn && city !== property.city) return fail(CITY_ERROR_MSG);

  const category = b.category !== undefined ? String(b.category).trim() : property.category;
  const categoryEn = findEn(CATEGORIES, category);
  if (!categoryEn && category !== property.category) return fail(CATEGORY_ERROR_MSG);

  const toArr = (v) => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    return v.split(",").map((f) => f.trim()).filter((f) => f);
  };

  // ── الصور ──
  // keepImages = روابط الصور القديمة اللي لازم تضل. finalImages = keepImages (بس الروابط الموجودة
  // فعلاً بالعقار) + الجديدة. إذا keepImages ما انبعت أبداً، منخلّي كل القديمة ومنضيف الجديدة عليها.
  const existingImages = (property.images || []).filter(img => img && !img.includes("undefined"));
  const keep = parseKeepImages(b.keepImages);
  if (keep.error) return fail(keep.error);

  // منحافظ على الترتيب المطلوب، ومنتجاهل أي رابط مش تابع لهالعقار أو مكرر
  const keptImages = keep.value
    ? [...new Set(keep.value)].filter(url => existingImages.includes(url))
    : existingImages;

  const finalImages = [...keptImages, ...(newImages || [])];
  if (finalImages.length > MAX_IMAGES)
    return fail(`الحد الأقصى ${MAX_IMAGES} صورة للعقار — المجموع صار ${finalImages.length}`);

  const removedImages = existingImages.filter(url => !keptImages.includes(url));

  const update = {
    title: b.title ?? property.title,
    titleEn: b.titleEn ?? property.titleEn ?? "",
    description: b.description ?? property.description,
    descriptionEn: b.descriptionEn ?? property.descriptionEn ?? "",
    category,
    categoryEn: categoryEn ?? property.categoryEn ?? "",
    type,
    price,
    rentPrices,
    furnished,
    city,
    cityEn: cityEn ?? property.cityEn ?? "",
    // انبعت = منحدّثه (و"" بيصير null عشان الأدمن يقدر يمسحه)، ما انبعت = منخلّي القديم
    area: b.area !== undefined ? toNum(b.area) : property.area,
    rooms: b.rooms !== undefined ? toNum(b.rooms) : property.rooms,
    bathrooms: b.bathrooms !== undefined ? toNum(b.bathrooms) : property.bathrooms,
    address: b.address ?? property.address ?? "",
    addressEn: b.addressEn ?? property.addressEn ?? "",
    images: finalImages,
    // انبعتوا فاضيين ("") = منصفّرهم، ما انبعتوا = منخلّي القديم
    features: b.features !== undefined ? toArr(b.features) : property.features,
    featuresEn: b.featuresEn !== undefined ? toArr(b.featuresEn) : property.featuresEn ?? [],
    videoUrl: b.videoUrl ?? property.videoUrl ?? "",
    // ما انبعت (أو مش أدمن) = منخلّي القيمة القديمة بدل ما نصفّرها
    isFeatured: allowFeatured && b.isFeatured !== undefined
      ? b.isFeatured === "true" || b.isFeatured === true
      : property.isFeatured,
    status: b.status ?? property.status,
    action: {
      type: b.status === "sold" ? "sold" : "updated",
      by: user?.name || "Admin",
      at: new Date()
    },
    ...extraUpdate,
  };

  if (dryRun) {
    // نفس تحقق الموديل (enum/min...) بدون حفظ — عشان طلب السب أدمن يرفض البيانات الغلط فوراً
    const probe = new Property({ ...property.toObject(), ...update });
    await probe.validate();
    return { updated: null, removedImages: [] };
  }

  const updated = await Property.findByIdAndUpdate(
    property._id,
    update,
    // runValidators: عشان enum/required/min بالموديل ينطبقوا على التعديل كمان (مش بس الإضافة)
    { new: true, runValidators: true }
  );
  return { updated, removedImages };
};

// keepImages بييجي JSON string من الفورم، أو array من طلب تعديل محفوظ. undefined/null = ما انبعت
function parseKeepImages(raw) {
  if (raw === undefined || raw === null) return { value: null };
  let value = raw;
  if (typeof raw === "string") {
    try { value = JSON.parse(raw); } catch { value = null; }
  }
  if (!Array.isArray(value))
    return { error: "قائمة الصور المحفوظة (keepImages) غير صالحة" };
  return { value };
}

// الحقول اللي بتنحفظ بطلب تعديل السب أدمن — isFeatured مش منها (للأدمن بس)
const EDITOR_FIELDS = [
  "title", "titleEn", "description", "descriptionEn", "category", "type", "price",
  "rentDaily", "rentWeekly", "rentMonthly", "rentYearly", "furnished", "city",
  "area", "rooms", "bathrooms", "address", "addressEn", "features", "featuresEn",
  "videoUrl", "status",
];

const sendValidationError = (res, error) => {
  if (error.name === "ValidationError" || error.name === "CastError")
    return res.status(400).json({ error: VALIDATION_ERROR_MSG });
  res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
};

// ── PUT /:id ───────────────────────────────────────────────
// الأدمن: بيتطبّق فوراً. السب أدمن (editor): ما بيتعدّل العقار — بينحفظ طلب تعديل
// بـ pendingChanges (202) لحد ما الأدمن يوافق أو يرفض. طلب جديد بيستبدل القديم.
router.put("/:id", protect, staffOnly, upload.any(), compressImages, async (req, res) => {
  // بالـ 202 (طلب السب أدمن) الصور الجديدة لازم تضل — هالدالة بتحذفها بس إذا الرد >= 400
  discardUploadsOnError(req, res);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID غير صالح" });

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });

    const b = req.body;
    const newImages = req.compressedImages || [];

    // ── السب أدمن: طلب تعديل ──
    if (req.user.role !== "admin") {
      const data = {};
      EDITOR_FIELDS.forEach((f) => { if (b[f] !== undefined) data[f] = b[f]; });

      // تحقق مسبق بنفس منطق التعديل — البيانات الغلط بترجع 400 هلق مش وقت الموافقة
      const check = await applyPropertyUpdate(property, { ...data, keepImages: b.keepImages }, newImages, req.user, { dryRun: true });
      if (check.error) return res.status(check.status).json({ error: check.error });

      const keep = parseKeepImages(b.keepImages);
      const previousNewImages = property.pendingChanges?.newImages || [];

      await Property.updateOne(
        { _id: property._id },
        {
          pendingChanges: {
            data,
            newImages,
            keepImages: keep.value ?? undefined,
            submittedBy: { id: req.user._id, name: req.user.name },
            submittedAt: new Date(),
          },
        }
      );

      invalidatePropertiesCache();
      res.status(202).json({ message: "تم إرسال التعديل بانتظار موافقة الأدمن" });

      // الطلب القديم انستبدل — صوره الجديدة ما عاد إلها لزمة
      deleteCloudinaryImages(previousNewImages);
      return;
    }

    // ── الأدمن: تعديل فوري ──
    const result = await applyPropertyUpdate(property, b, newImages, req.user, { allowFeatured: true });
    if (result.error) return res.status(result.status).json({ error: result.error });

    invalidatePropertiesCache();
    res.json(result.updated);

    // الصور يلي انشالت بالتعديل منحذفها من Cloudinary بعد نجاح الحفظ —
    // الدالة ما بترمي، والفشل بينسجّل بالـ log بس
    deleteCloudinaryImages(result.removedImages);
  } catch (error) {
    console.error("Properties PUT Error:", error);
    sendValidationError(res, error);
  }
});

// ── POST /:id/approve-changes ─────────────────────────────
// الأدمن بيوافق على طلب تعديل السب أدمن: بيتطبّق بنفس منطق الـ PUT، action.by = اسم السب أدمن
router.post("/:id/approve-changes", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID غير صالح" });

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });

    const pending = property.pendingChanges;
    if (!pending) return res.status(404).json({ error: "ما في طلب تعديل معلّق لهالعقار" });

    const body = { ...(pending.data || {}) };
    if (pending.keepImages) body.keepImages = pending.keepImages;

    const result = await applyPropertyUpdate(
      property, body, pending.newImages || [],
      { name: pending.submittedBy?.name },
      { extraUpdate: { pendingChanges: null } }
    );
    if (result.error) return res.status(result.status).json({ error: result.error });

    invalidatePropertiesCache();
    res.json(result.updated);
    deleteCloudinaryImages(result.removedImages);
  } catch (error) {
    console.error("Properties Approve Error:", error);
    sendValidationError(res, error);
  }
});

// ── POST /:id/reject-changes ──────────────────────────────
// رفض طلب التعديل: الصور الجديدة اللي رفعها السب أدمن بتنحذف من Cloudinary والعقار ما بيتغيّر
router.post("/:id/reject-changes", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID غير صالح" });

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });
    if (!property.pendingChanges) return res.status(404).json({ error: "ما في طلب تعديل معلّق لهالعقار" });

    const discarded = property.pendingChanges.newImages || [];
    await Property.updateOne({ _id: property._id }, { pendingChanges: null });

    invalidatePropertiesCache();
    res.json({ message: "تم رفض التعديل" });
    deleteCloudinaryImages(discarded);
  } catch (error) {
    console.error("Properties Reject Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── DELETE /:id ────────────────────────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID غير صالح" });

    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });

    invalidatePropertiesCache();

    // صور العقار المحذوف (وصور طلب التعديل المعلّق إذا في) ما إلها لزمة على Cloudinary —
    // الفشل ما بيفشّل الطلب
    deleteCloudinaryImages([...(property.images || []), ...(property.pendingChanges?.newImages || [])]);
    res.json({ message: "تم حذف العقار بنجاح" });
  } catch (error) {
    console.error("Properties DELETE Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

module.exports = router;
// راوتات "اعرض عقارك" بتضيف عقارات كمان (التحويل) — لازم تصفّر نفس الكاش
module.exports.invalidatePropertiesCache = invalidatePropertiesCache;
