const { protect, adminOnly, staffOnly } = require("./auth");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

// حد الطلبات العام — 100 طلب كل 15 دقيقة
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "طلبات كثيرة جداً، حاول بعد قليل" }
});

// حد خاص بـ login — 10 محاولات فقط كل 15 دقيقة
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  // 
  message: { error: "محاولات دخول كثيرة، حاول بعد 15 دقيقة" }
});

// ✅ حد خاص بفورم التواصل — 5 رسائل بالساعة من نفس الـ IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: "أرسلت رسائل كثيرة، حاول بعد ساعة" }
});

// حد خاص بفورم "اعرض عقارك" — 5 طلبات ناجحة بالساعة من نفس الـ IP (فيه رفع صور، فأشد من فورم التواصل).
// skipFailedRequests: المحاولات الفاشلة (>= 400، مثلاً خطأ بحقل) ما بتنعدّ — وإلا كبير العمر اللي
// بيغلط بالفورم كم مرة بيتسكّر عليه ساعة كاملة
const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skipFailedRequests: true,
  message: { error: "أرسلت طلبات كثيرة، حاول بعد ساعة أو تواصل معنا عبر واتساب" }
});

// ── sanitizeBody ──────────────────────────────────────────
// mongoSanitize العام بـ index.js بيشتغل قبل ما multer يقرا فورمات رفع الصور (multipart)،
// فـ body هالطلبات ما بينفحص. هالـ middleware بينحط بعد multer مباشرة بكل راوت فيه رفع:
// بيشيل أي مفتاح بيبلّش بـ $ أو فيه نقطة (متل {"$gt": ""}) قبل ما يوصل لأي query
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") mongoSanitize.sanitize(req.body);
  next();
};

module.exports = { protect, adminOnly, staffOnly, sanitizeBody, requestLimiter, apiLimiter, loginLimiter, contactLimiter };