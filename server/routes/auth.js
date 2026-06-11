const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { protect, adminOnly, loginLimiter } = require("../middleware");

const signToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// ─── POST /api/auth/register ──────────────────────────────
router.post("/register", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });

    if (password.length < 6)
      return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً" });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
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

    res.json({
      token,
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

module.exports = router;