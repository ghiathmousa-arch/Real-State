const { protect, adminOnly, staffOnly } = require("./auth");
const rateLimit = require("express-rate-limit");

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

// حد خاص بفورم "اعرض عقارك" — 3 طلبات بالساعة من نفس الـ IP (فيه رفع صور، فأشد من فورم التواصل)
const requestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: "أرسلت طلبات كثيرة، حاول بعد ساعة أو تواصل معنا عبر واتساب" }
});

module.exports = { protect, adminOnly, staffOnly, requestLimiter, apiLimiter, loginLimiter, contactLimiter };