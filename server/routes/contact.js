const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const { Resend } = require("resend");

// ← الـ Resend client ينشأ مرة وحدة بس
const resend = new Resend(process.env.RESEND_API_KEY);

// --- استقبال رسالة جديدة من الزائر ---
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const contact = await Contact.create({ name, email, phone, message });
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- جلب كل الرسائل للأدمن ---
router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- حذف رسالة ---
router.delete("/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف الرسالة" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- إرسال رد على رسالة ---
router.post("/:id/reply", async (req, res) => {
  try {
    const { replyText } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, error: "الرسالة غير موجودة" });
    }

    // تحديث حالة الرسالة فوراً في قاعدة البيانات
    contact.replied = true;
    await contact.save();

    // الرد الفوري للواجهة
    res.json({ success: true, message: "تم إرسال الرد بنجاح" });

    // إرسال الإيميل في الخلفية عبر Resend (HTTPS مش SMTP)
    resend.emails.send({
      from: "Syrian Estate <onboarding@resend.dev>",
      to: contact.email,
      subject: "ردّ على رسالتك - Syrian Estate",
      html: `
        <div dir="rtl" style="font-family:sans-serif;line-height:1.7;padding:20px;max-width:600px;margin:auto">
          <h3 style="color:#004e80;border-bottom:2px solid #e3e8f9;padding-bottom:10px">Syrian Estate</h3>
          <p>مرحباً ${contact.name}،</p>
          <p style="background:#f9f9ff;padding:15px;border-radius:8px;border-right:4px solid #004e80">
            ${replyText}
          </p>
          <hr style="border:1px solid #e3e8f9;margin:16px 0"/>
          <p style="color:#888;font-size:12px">رسالتك الأصلية: ${contact.message}</p>
        </div>
      `,
    }).catch(err => console.error("Mail Error:", err.message));

  } catch (error) {
    console.error("Reply Error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;