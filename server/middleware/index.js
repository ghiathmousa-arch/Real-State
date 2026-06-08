const { protect, adminOnly } = require("./auth");
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
  message: { error: "محاولات دخول كثيرة، حاول بعد 15 دقيقة" }
});

module.exports = { protect, adminOnly, apiLimiter, loginLimiter };