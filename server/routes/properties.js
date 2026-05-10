const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const { upload, compressImages } = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/auth");

// ── GET / ──────────────────────────────────
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
router.get("/featured", async (req, res) => {
  try {
    const properties = await Property.find({ isFeatured: true, status: "active" });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /recent ────────────────────────────
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

// ── GET /:id ───────────────────────────────
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
      titleEn: b.titleEn || "",  // ✅ أضفناه
      description: b.description,
      descriptionEn: b.descriptionEn || "",  // ✅ أضفناه
      category: b.category,
      categoryEn: b.categoryEn || "",  // ✅ أضفناه
      type: b.type,
      price: toNum(b.price),
      city: b.city,
      cityEn: b.cityEn || "",  // ✅ أضفناه
      area: toNum(b.area),
      rooms: toNum(b.rooms),
      bathrooms: toNum(b.bathrooms),
      address: b.address || "",
      addressEn: b.addressEn || "",  // ✅ أضفناه
      images: req.compressedImages,
      features: toArr(b.features),
      featuresEn: toArr(b.featuresEn),     // ✅ أضفناه
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

// ── PUT /:id ───────────────────────────────
router.put("/:id", protect, adminOnly, upload.any(), compressImages, async (req, res) => {
  try {
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
        titleEn: b.titleEn ?? property.titleEn ?? "",  // ✅ أضفناه
        description: b.description ?? property.description,
        descriptionEn: b.descriptionEn ?? property.descriptionEn ?? "",  // ✅ أضفناه
        category: b.category ?? property.category,
        categoryEn: b.categoryEn ?? property.categoryEn ?? "",  // ✅ أضفناه
        type: b.type ?? property.type,
        price: b.price ? toNum(b.price) : property.price,
        city: b.city ?? property.city,
        cityEn: b.cityEn ?? property.cityEn ?? "",  // ✅ أضفناه
        area: b.area ? toNum(b.area) : property.area,
        rooms: b.rooms ? toNum(b.rooms) : property.rooms,
        bathrooms: b.bathrooms ? toNum(b.bathrooms) : property.bathrooms,
        address: b.address ?? property.address ?? "",
        addressEn: b.addressEn ?? property.addressEn ?? "",  // ✅ أضفناه
        images: finalImages,
        features: b.features ? toArr(b.features) : property.features,
        featuresEn: b.featuresEn ? toArr(b.featuresEn) : property.featuresEn ?? [], // ✅ أضفناه
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

// ── DELETE /:id ────────────────────────────
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