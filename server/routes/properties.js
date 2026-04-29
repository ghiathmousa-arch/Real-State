const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
// استيراد الميدل وير الجديد (تأكد من استخدام الأقواس {})
const { upload, compressImages } = require("../middleware/upload");

router.get("/", async (req, res) => {
  try {
    // req.query = البارامترات اللي بتيجي بعد علامة ? بالـ URL
    const { category, city, minPrice, maxPrice, type, search } = req.query;
    let query = {}; // كائن فارغ سنبني فيه شروط البحث

    if (category) query.category = category;   // فلتر حسب الفئة
    if (city) query.city = city;               // فلتر حسب المدينة
    if (type) query.type = type;               // فلتر حسب النوع (بيع/إيجار)

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice); // $gte = أكبر من أو يساوي
      if (maxPrice) query.price.$lte = parseFloat(maxPrice); // $lte = أصغر من أو يساوي
    }

    if (search) {
      // $or = ابحث بأي حقل من هالحقول
      // $regex = بحث نصي جزئي، $options: "i" = تجاهل كبير/صغير الحروف
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } }
      ];
    }

    const properties = await Property.find(query); // جلب النتائج من MongoDB
    res.json(properties); // إرجاع النتائج كـ JSON
  } catch (error) {
    res.status(500).json({ error: error.message }); // 500 = خطأ بالسيرفر
  }
});

// ── GET /featured ──────────────────────────
// جلب العقارات المميزة (الموصى بها) فقط
router.get("/featured", async (req, res) => {
  try {
    // ابحث عن العقارات اللي isFeatured = true وstatus = active
    const properties = await Property.find({ isFeatured: true, status: "active" });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GET /:id ───────────────────────────────
// جلب عقار واحد بالـ ID
// مثال: GET /api/properties/69ef29920a86bea159371a60
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id); // البحث بالـ _id
    if (!property) return res.status(404).json({ error: "العقار غير موجود" }); // 404 = مو موجود
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- إضافة عقار جديد ---
// لاحظ استخدام upload.any() لتجنب خطأ Field name missing إذا تغير اسم الحقل بالخطأ
router.post("/", upload.any(), compressImages, async (req, res) => {
  try {
    const b = req.body;
    const toNum = (v) => (v !== undefined && v !== "" ? Number(v) : null);
    const toArr = (v) => {
      if (!v) return [];
      if (Array.isArray(v)) return v;
      return v.split(",").map(f => f.trim()).filter(f => f);
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
      images: req.compressedImages, // نضع هنا مصفوفة الصور التي تم ضغطها
      features: toArr(b.features),
      isFeatured: b.isFeatured === true || b.isFeatured === "true",
      status: b.status || "active"
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ── PUT /:id ───────────────────────────────
// تعديل عقار موجود
router.put("/:id", upload.array("images", 10), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });

    let images = property.images || []; // الصور الموجودة مسبقاً
    if (req.files && req.files.length > 0) {
      // أضف الصور الجديدة على القديمة (مو استبدال)
      images = [...images, ...req.files.map(f => `/uploads/${f.filename}`)];
    }

    // findByIdAndUpdate: ابحث بالـ ID وعدّل
    // { new: true } = أرجع البيانات بعد التعديل مو قبله
    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,  // نشر كل البيانات القادمة
        price: req.body.price ? parseFloat(req.body.price) : property.price,
        images,
        isFeatured: req.body.isFeatured === "true",
        features: req.body.features
          ? req.body.features.split(",").map(f => f.trim()).filter(f => f)
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
// حذف عقار بالـ ID
router.delete("/:id", async (req, res) => {
  try {
    // findByIdAndDelete = ابحث واحذف بنفس الوقت
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ error: "العقار غير موجود" });
    res.json({ message: "تم حذف العقار بنجاح" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;