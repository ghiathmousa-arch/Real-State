const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── protect: يتحقق هل المستخدم مسجل دخول ───────────────
const protect = async (req, res, next) => {
  // نقرأ الـ Header من الطلب
  // الفرونت يرسل: Authorization: Bearer eyJhbGci...
  const header = req.headers.authorization;

  // لو ما في header أو ما يبدأ بـ Bearer، نرفض الطلب
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ error: "غير مصرح — يرجى تسجيل الدخول" });

  try {
    // نأخذ التوكن فقط بدون كلمة Bearer
    const token = header.split(" ")[1];

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