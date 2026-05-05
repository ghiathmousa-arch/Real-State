const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const { upload, compressImages } = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/auth"); // ← جديد

// ── GET / ──────────────────────────────────
// عام — أي أحد يقدر يشوف العقارات
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
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const properties = await Property.find(query);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /featured ──────────────────────────
// عام — جلب العقارات المميزة
router.get("/featured", async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, status: "active" });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /:id ───────────────────────────────
// عام — جلب عقار واحد
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST / ─────────────────────────────────
// Admin فقط — إضافة عقار جديد
// protect: تحقق من التوكن أولاً
// adminOnly: تحقق إن المستخدم Admin
router.post("/", protect, adminOnly, upload.any(), compressImages, async (req, res) => {
  try {
    const b = req.body;
    const toNum = (v) => (v !== undefined && v !== "" ? Number(v) : null);
    const toArr = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      return v.split(",").map((f) => f.trim()).filter((f) => f);
    };

    const property = await Property.create({
      title: b.title,
      description: b.description,
      category: b.category,
      type: b.type,
      price: toNum(b.price),
      city: b.city,
      area: toNum(b.area),
      rooms: toNum(b.rooms),
      bathrooms: toNum(b.bathrooms),
      address: b.address || "",
      images: req.compressedImages,
      features: toArr(b.features),
      isFeatured: b.isFeatured === true || b.isFeatured === "true",
      status: b.status || "active",
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /:id ───────────────────────────────
// Admin فقط — تعديل عقار موجود
// ── PUT /:id ───────────────────────────────
// Admin فقط — تعديل عقار موجود
// استخدمنا upload.any() و compressImages لضمان معالجة الصور بنفس جودة الإضافة
// ... (داخل دالة الـ PUT)
router.put("/:id", protect, adminOnly, upload.any(), compressImages, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    if (!property) return res.status(404).json({ error: "العقار غير موجود" })

    const b = req.body
    const toNum = (v) => (v !== undefined && v !== "" ? Number(v) : null)

    // منطق الصور
    let finalImages
    if (b.replaceImages === 'true' && req.compressedImages?.length > 0) {
      // استبدل القديمة بالجديدة كلياً
      finalImages = req.compressedImages
    } else {
      // ابقِ القديمة نظيفة بدون undefined
      finalImages = (property.images || []).filter(img => img && !img.includes('undefined'))
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        ...b,
        price: b.price ? toNum(b.price) : property.price,
        area: b.area ? toNum(b.area) : property.area,
        rooms: b.rooms ? toNum(b.rooms) : property.rooms,
        bathrooms: b.bathrooms ? toNum(b.bathrooms) : property.bathrooms,
        images: finalImages,
        isFeatured: b.isFeatured === "true" || b.isFeatured === true,
      },
      { new: true }
    )

    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── DELETE /:id ────────────────────────────
// Admin فقط — حذف عقار
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });
    res.json({ message: "تم حذف العقار بنجاح" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;