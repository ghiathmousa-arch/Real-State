const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Property = require("../models/Property");
const { upload, compressImages } = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware");

// ── GET / ──────────────────────────────────────────────────
// مفتوح — جلب العقارات مع فلترة
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

// ── GET /featured ──────────────────────────────────────────
router.get("/featured", async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, status: "active" });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

// ── POST / ─────────────────────────────────────────────────
// للأدمن فقط — إضافة عقار
router.post("/", protect, adminOnly, upload.any(), compressImages, async (req, res) => {
  try {
    const b = req.body;

    if (!b.title || !b.price || !b.city || !b.category || !b.type)
      return res.status(400).json({ error: "العنوان والسعر والمدينة والفئة والنوع مطلوبة" });

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
    res.status(500).json({ error: error.message });
  }
});

// ── PUT /:id ───────────────────────────────────────────────
// للأدمن فقط — تعديل عقار
router.put("/:id", protect, adminOnly, upload.any(), compressImages, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID غير صالح" });

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });

    const b = req.body;
    const toNum = (v) => (v !== undefined && v !== "" ? Number(v) : null);
    const toArr = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      return v.split(",").map((f) => f.trim()).filter((f) => f);
    };

    let finalImages;
    if (b.replaceImages === "true" && req.compressedImages?.length > 0) {
      finalImages = req.compressedImages;
    } else {
      finalImages = (property.images || []).filter(img => img && !img.includes("undefined"));
    }

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
        price: b.price ? toNum(b.price) : property.price,
        city: b.city ?? property.city,
        cityEn: b.cityEn ?? property.cityEn ?? "",
        area: b.area ? toNum(b.area) : property.area,
        rooms: b.rooms ? toNum(b.rooms) : property.rooms,
        bathrooms: b.bathrooms ? toNum(b.bathrooms) : property.bathrooms,
        address: b.address ?? property.address ?? "",
        addressEn: b.addressEn ?? property.addressEn ?? "",
        images: finalImages,
        features: b.features ? toArr(b.features) : property.features,
        featuresEn: b.featuresEn ? toArr(b.featuresEn) : property.featuresEn ?? [],
        isFeatured: b.isFeatured === "true" || b.isFeatured === true,
        status: b.status ?? property.status,
        action: {
          type: b.status === "sold" ? "sold" : "updated",
          by: req.user.name,
          at: new Date()
        }
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── DELETE /:id ────────────────────────────────────────────
// للأدمن فقط — حذف عقار
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "ID غير صالح" });

    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });
    res.json({ message: "تم حذف العقار بنجاح" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;