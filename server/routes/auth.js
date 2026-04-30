const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

// دالة توليد التوكن — تأخذ الـ ID وترجع توكن مشفر
const signToken = (id) =>
  jwt.sign(
    { id },                          // البيانات اللي داخل التوكن
    process.env.JWT_SECRET,          // المفتاح السري من .env
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } // مدة الصلاحية
  );

// ─── POST /api/auth/register ─────────────────────────────
// تسجيل مستخدم جديد
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // تحقق من إن كل الحقول موجودة
    if (!name || !email || !password)
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });

    // تحقق من طول كلمة المرور
    if (password.length < 6)
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });

    // تحقق إذا الإيميل مسجل مسبقاً
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً" });

    // إنشاء المستخدم — كلمة المرور بتتشفر تلقائياً من الـ pre("save")
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────
// تسجيل الدخول
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "البريد وكلمة المرور مطلوبان" });

    // نجيب المستخدم من DB
    const user = await User.findOne({ email });

    // نتحقق من المستخدم والمرور معاً (حتى لا نكشف أيهما خطأ)
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });

    const token = signToken(user._id);

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────
// جلب بيانات المستخدم الحالي
// protect = يمر من الحارس أولاً قبل ما يوصل لهون
router.get("/me", protect, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

module.exports = router;