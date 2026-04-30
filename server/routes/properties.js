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
router.put("/:id", protect, adminOnly, upload.array("images", 10), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });

    let images = property.images || [];
    if (req.files && req.files.length > 0) {
      images = [...images, ...req.files.map((f) => `/uploads/${f.filename}`)];
    }

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        price: req.body.price ? parseFloat(req.body.price) : property.price,
        images,
        isFeatured: req.body.isFeatured === "true",
        features: req.body.features
          ? req.body.features.split(",").map((f) => f.trim()).filter((f) => f)
          : property.features,
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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