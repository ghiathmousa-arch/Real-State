const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Property = require("../models/Property");
const { upload, compressImages, deleteCloudinaryImages } = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware");

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

const MAX_IMAGES = 12; // الحد الأقصى لصور العقار الواحد (نفس حد multer بـ upload.js)

// ── التحقق من السعر ────────────────────────────────────────
// كل الأسعار بالمنصة بالدولار الأمريكي (USD). القيمة الفاضية = null ("السعر عند الطلب")
const MAX_PRICE_USD = 100_000_000;
const parsePrice = (v) => {
  if (v === undefined || v === null || String(v).trim() === "") return { value: null };
  const n = Number(v);
  if (!Number.isFinite(n))
    return { error: "السعر لازم يكون رقم (بالدولار الأمريكي)" };
  if (n < 0)
    return { error: "السعر ما بيصير يكون سالب" };
  if (n > MAX_PRICE_USD)
    return { error: "السعر أكبر من 100,000,000 دولار — تأكد إنك كاتبه بالدولار مو بالليرة" };
  return { value: n };
};

// ── GET / ──────────────────────────────────────────────────
// القائمة العامة: بترجّع العقارات النشطة بس (status: "active") — المعلّق والمباع ما بيظهروا بالموقع
router.get("/", async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, type, search } = req.query;
    const hasFilters = Boolean(category || city || minPrice || maxPrice || type || search);

    // القائمة الكاملة (بدون فلاتر) هي الأكتر استدعاءً — كاشها لوحدها كافي
    if (!hasFilters && isFresh(cache.list)) {
      return res.json(cache.list.data);
    }

    let query = { status: "active" };

    if (category) query.category = category;
    if (city) query.city = city;
    if (type) query.type = type;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
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

    const properties = await Property.find(query);

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

    const properties = await Property.find({ isFeatured: true, status: "active" });
    cache.featured = { data: properties, expiresAt: Date.now() + CACHE_TTL_MS };
    res.json(properties);
  } catch (error) {
    console.error("Properties Featured Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── GET /admin/all ─────────────────────────────────────────
// لوحة التحكم: كل العقارات بكل الحالات. لازم يجي قبل /:id وإلا "admin" بينقرا كـ id
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
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

// ── GET /recent ────────────────────────────────────────────
router.get("/recent", async (req, res) => {
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

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });

    cache.byId.set(req.params.id, { data: property, expiresAt: Date.now() + CACHE_TTL_MS });
    res.json(property);
  } catch (error) {
    console.error("Properties GetById Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── POST / ─────────────────────────────────────────────────
router.post("/", protect, adminOnly, upload.any(), compressImages, async (req, res) => {
  discardUploadsOnError(req, res);
  try {
    const b = req.body;

    // ✅ السعر صار اختياري - تم حذفه من شرط الإلزامية
    if (!b.title || !b.city || !b.category || !b.type)
      return res.status(400).json({ error: "العنوان والمدينة والفئة والنوع مطلوبة" });

    const price = parsePrice(b.price);
    if (price.error) return res.status(400).json({ error: price.error });

    const toNum = (v) => (v !== undefined && v !== "" ? Number(v) : null);
    const toArr = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      return v.split(",").map((f) => f.trim()).filter((f) => f);
    };

    const property = await Property.create({
      title: b.title,
      titleEn: b.titleEn || "",
      description: b.description,
      descriptionEn: b.descriptionEn || "",
      category: b.category,
      categoryEn: b.categoryEn || "",
      type: b.type,
      price: price.value,
      city: b.city,
      cityEn: b.cityEn || "",
      area: toNum(b.area),
      rooms: toNum(b.rooms),
      bathrooms: toNum(b.bathrooms),
      address: b.address || "",
      addressEn: b.addressEn || "",
      images: req.compressedImages,
      features: toArr(b.features),
      featuresEn: toArr(b.featuresEn),
      videoUrl: b.videoUrl || "", // ✅ رابط فيديو يوتيوب تبع العقار
      isFeatured: b.isFeatured === true || b.isFeatured === "true",
      status: b.status || "active",
      action: {
        type: "added",
        by: req.user.name,
        at: new Date()
      }
    });

    invalidatePropertiesCache();
    res.status(201).json(property);
  } catch (error) {
    console.error("Properties POST Error:", error);
    if (error.name === "ValidationError" || error.name === "CastError")
      return res.status(400).json({ error: VALIDATION_ERROR_MSG });
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── PUT /:id ───────────────────────────────────────────────
router.put("/:id", protect, adminOnly, upload.any(), compressImages, async (req, res) => {
  discardUploadsOnError(req, res);
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID غير صالح" });

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });

    const b = req.body;

    // السعر ما انبعت = منخلّي القديم؛ انبعت = لازم يكون صالح
    let price = property.price;
    if (b.price !== undefined) {
      const parsed = parsePrice(b.price);
      if (parsed.error) return res.status(400).json({ error: parsed.error });
      price = parsed.value;
    }

    const toNum = (v) => (v !== undefined && v !== "" ? Number(v) : null);
    const toArr = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      return v.split(",").map((f) => f.trim()).filter((f) => f);
    };

    // ── الصور ──
    // الواجهة بتبعت keepImages (JSON array لروابط الصور القديمة اللي لازم تضل) + الصور الجديدة.
    // finalImages = keepImages (بس الروابط الموجودة فعلاً بالعقار) + الجديدة المرفوعة.
    // إذا keepImages ما انبعت أبداً، منخلّي كل الصور القديمة ومنضيف الجديدة عليها.
    const existingImages = (property.images || []).filter(img => img && !img.includes("undefined"));
    const newImages = req.compressedImages || [];

    let keptImages = existingImages;
    if (b.keepImages !== undefined) {
      let requested;
      try {
        requested = JSON.parse(b.keepImages);
      } catch {
        requested = null;
      }
      if (!Array.isArray(requested))
        return res.status(400).json({ error: "قائمة الصور المحفوظة (keepImages) غير صالحة" });

      // منحافظ على الترتيب اللي بعتته الواجهة، ومنتجاهل أي رابط مش تابع لهالعقار أو مكرر
      keptImages = [...new Set(requested)].filter(url => existingImages.includes(url));
    }

    const finalImages = [...keptImages, ...newImages];
    if (finalImages.length > MAX_IMAGES)
      return res.status(400).json({ error: `الحد الأقصى ${MAX_IMAGES} صورة للعقار — المجموع صار ${finalImages.length}` });

    const removedImages = existingImages.filter(url => !keptImages.includes(url));

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        title: b.title ?? property.title,
        titleEn: b.titleEn ?? property.titleEn ?? "",
        description: b.description ?? property.description,
        descriptionEn: b.descriptionEn ?? property.descriptionEn ?? "",
        category: b.category ?? property.category,
        categoryEn: b.categoryEn ?? property.categoryEn ?? "",
        type: b.type ?? property.type,
        price,
        city: b.city ?? property.city,
        cityEn: b.cityEn ?? property.cityEn ?? "",
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
        // ما انبعت = منخلّي القيمة القديمة بدل ما نصفّرها
        isFeatured: b.isFeatured !== undefined
          ? b.isFeatured === "true" || b.isFeatured === true
          : property.isFeatured,
        status: b.status ?? property.status,
        action: {
          type: b.status === "sold" ? "sold" : "updated",
          by: req.user.name,
          at: new Date()
        }
      },
      // runValidators: عشان enum/required/min بالموديل ينطبقوا على التعديل كمان (مش بس الإضافة)
      { new: true, runValidators: true }
    );

    invalidatePropertiesCache();
    res.json(updated);

    // الصور يلي انشالت بالتعديل منحذفها من Cloudinary بعد نجاح الحفظ —
    // الدالة ما بترمي، والفشل بينسجّل بالـ log بس
    deleteCloudinaryImages(removedImages);
  } catch (error) {
    console.error("Properties PUT Error:", error);
    if (error.name === "ValidationError" || error.name === "CastError")
      return res.status(400).json({ error: VALIDATION_ERROR_MSG });
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

    // صور العقار المحذوف ما إلها لزمة على Cloudinary — الفشل ما بيفشّل الطلب
    deleteCloudinaryImages(property.images);
    res.json({ message: "تم حذف العقار بنجاح" });
  } catch (error) {
    console.error("Properties DELETE Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

module.exports = router;