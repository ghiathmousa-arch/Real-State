const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Property = require("../models/Property");
const { upload, compressImages } = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware");

// ── GET / ──────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { category, city, minPrice, maxPrice, type, search } = req.query;
    let query = {};

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
    res.json(properties);
  } catch (error) {
    console.error("Properties GET Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── GET /featured ──────────────────────────────────────────
router.get("/featured", async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, status: "active" });
    res.json(properties);
  } catch (error) {
    console.error("Properties Featured Error:", error);
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
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID غير صالح" });

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });
    res.json(property);
  } catch (error) {
    console.error("Properties GetById Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── POST / ─────────────────────────────────────────────────
router.post("/", protect, adminOnly, upload.any(), compressImages, async (req, res) => {
  try {
    const b = req.body;

    // ✅ السعر صار اختياري - تم حذفه من شرط الإلزامية
    if (!b.title || !b.city || !b.category || !b.type)
      return res.status(400).json({ error: "العنوان والمدينة والفئة والنوع مطلوبة" });

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
      price: toNum(b.price),
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

    res.status(201).json(property);
  } catch (error) {
    console.error("Properties POST Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ── PUT /:id ───────────────────────────────────────────────
router.put("/:id", protect, adminOnly, upload.any(), compressImages, async (req, res) => {
  try {
    // ... (باقي الكود اللي فوق متل ما هو)

    const b = req.body;

    // ✅ 1. تعديل دالة toNum لترجع null إذا كان الحقل فاضي أو كلمة null
    const toNum = (v) => {
      if (v === undefined || v === "" || v === "null" || v === "undefined") return null;
      return Number(v);
    };

    const toArr = (v) => { /* ... */ };

    // ... 

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        title: b.title ?? property.title,
        titleEn: b.titleEn ?? property.titleEn ?? "",
        description: b.description ?? property.description,
        // ... (باقي الحقول متل ما هي)

        // ✅ 2. التعديل الأهم هنا: 
        // إذا كان الحقل مبعوت (سواء رقم أو فاضي)، منمرره لـ toNum اللي رح تعطيه null لو فاضي.
        // وإذا مو مبعوت أبداً (undefined)، وقتها بس بناخد السعر القديم.
        price: b.price !== undefined ? toNum(b.price) : property.price,

        city: b.city ?? property.city,
        // ... (باقي الكود لآخر الـ Update)
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    console.error("Properties PUT Error:", error);
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
    res.json({ message: "تم حذف العقار بنجاح" });
  } catch (error) {
    console.error("Properties DELETE Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

module.exports = router;