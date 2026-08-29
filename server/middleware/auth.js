const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── protect: يتحقق هل المستخدم مسجل دخول ───────────────
const protect = async (req, res, next) => {
  // المصدر الأساسي: كوكي httpOnly (token) اللي بيرسلها المتصفح تلقائياً
  // نقبل كمان Authorization: Bearer لأي استخدام مباشر للـ API خارج المتصفح
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    token = header.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token)
    return res.status(401).json({ error: "غير مصرح — يرجى تسجيل الدخول" });

  try {
    // نفك تشفير التوكن ونتحقق منه باستخدام الـ Secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // نجيب بيانات المستخدم من DB (بدون كلمة المرور)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user)
      return res.status(401).json({ error: "المستخدم غير موجود" });

    next(); // كل شي تمام، كمّل للـ Route
  } catch {
    res.status(401).json({ error: "توكن غير صالح أو منتهي الصلاحية" });
  }
};

// ─── adminOnly: يسمح فقط للـ Admin ───────────────────────
// يُستخدم بعد protect دائماً
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ error: "هذا الإجراء للمسؤولين فقط" });
  next();
};

module.exports = { protect, adminOnly };