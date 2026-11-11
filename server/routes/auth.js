const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");
const { protect, adminOnly, loginLimiter } = require("../middleware");

const signToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// كوكي httpOnly بدل إرجاع التوكن بالـ body — غير قابل للقراءة من JS فبيوقف سرقته عبر XSS
// secure/sameSite ديناميكيين حسب req.secure: production (https, نطاقات مختلفة) لازم secure+None،
// وdev المحلي (http، نفس الـ host بس بورت مختلف) بيشتغل عادي بـ Lax بدون secure
const cookieOptions = (req) => ({
  httpOnly: true,
  secure: req.secure,
  sameSite: req.secure ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
});

const STAFF_ROLES = ["admin", "editor"];

// صيغة إيميل بسيطة (نفس المستخدمة بموديل Contact)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── POST /api/auth/register ──────────────────────────────
// الأدمن هو اللي بينشئ المستخدمين — فما منعطي كوكي جلسة للمستخدم الجديد،
// وإلا جلسة الأدمن نفسه بتتبدّل بجلسة المستخدم الجديد. منرجّع بياناته بس.
router.post("/register", protect, adminOnly, async (req, res) => {
  try {
    const { name, password } = req.body;
    // الدور: أدمن أو سب أدمن (editor) — الافتراضي سب أدمن
    const role = req.body.role === undefined || req.body.role === "" ? "editor" : req.body.role;
    if (!STAFF_ROLES.includes(role))
      return res.status(400).json({ error: "الدور لازم يكون admin أو editor" });
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

    if (!name || !email || !password)
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });

    if (!EMAIL_RE.test(email))
      return res.status(400).json({ error: "صيغة البريد الإلكتروني غير صحيحة" });

    if (password.length < 6)
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً" });

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Auth Register Error:", error); // ✅
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" }); // ✅
  }
});

// ─── POST /api/auth/login ─────────────────────────────────
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "البريد وكلمة المرور مطلوبان" });

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });

    const token = signToken(user._id);

    res.cookie("token", token, cookieOptions(req));
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Auth Login Error:", error); // ✅
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" }); // ✅
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────
router.get("/me", protect, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

// ─── GET /api/auth/users ──────────────────────────────────
// (أدمن) كل المستخدمين بدون كلمات السر، مع عدد العقارات اللي أضافها كل واحد (createdBy.id)
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const [users, counts] = await Promise.all([
      User.find().select("-password").sort({ createdAt: 1 }).lean(),
      Property.aggregate([
        { $match: { "createdBy.id": { $ne: null } } },
        { $group: { _id: "$createdBy.id", count: { $sum: 1 } } },
      ]),
    ]);
    const countById = new Map(counts.map((c) => [String(c._id), c.count]));
    res.json(users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      propertiesCount: countById.get(String(u._id)) || 0,
    })));
  } catch (error) {
    console.error("Auth Users GET Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ─── DELETE /api/auth/users/:id ───────────────────────────
// (أدمن) حذف مستخدم. ممنوع الأدمن يحذف حالو، وممنوع حذف آخر أدمن.
// عقاراته بتضل — createdBy.name محفوظ فيها نسخة.
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ error: "ID غير صالح" });

    if (String(req.user._id) === id)
      return res.status(400).json({ error: "ما فيك تحذف حسابك" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    if (user.role === "admin") {
      const admins = await User.countDocuments({ role: "admin" });
      if (admins <= 1)
        return res.status(400).json({ error: "ما فيك تحذف آخر أدمن" });
    }

    await user.deleteOne();
    res.json({ message: "تم حذف المستخدم" });
  } catch (error) {
    console.error("Auth Users DELETE Error:", error);
    res.status(500).json({ error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────
// clearCookie لازم ياخد نفس خيارات الكوكي الأصلية (secure + sameSite: none بالإنتاج)
// وإلا المتصفح بيعتبرها كوكي تانية وما بيمسح كوكي الجلسة cross-site.
// maxAge منشيلو — Express بيضبط تاريخ انتهاء بالماضي لحالو.
router.post("/logout", (req, res) => {
  const { maxAge, ...clearOptions } = cookieOptions(req);
  res.clearCookie("token", clearOptions);
  res.json({ success: true });
});

module.exports = router;