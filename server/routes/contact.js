const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const existing = await Contact.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: "تم استقبال رسالتك مسبقاً، سنتواصل معك قريباً"
      });
    }
    const contact = await Contact.create({ name, email, phone, message });
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف الرسالة" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/:id/reply", async (req, res) => {
  try {
    const { replyText } = req.body;
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ success: false, error: "الرسالة غير موجودة" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"فريق الدعم" <${process.env.EMAIL_USER}>`,
      to: contact.email,
      subject: "ردّ على رسالتك",
      html: `
        <div dir="rtl" style="font-family:sans-serif;line-height:1.7">
          <p>مرحباً ${contact.name}،</p>
          <p>${replyText}</p>
          <hr/>
          <p style="color:#888;font-size:12px">رسالتك الأصلية: ${contact.message}</p>
        </div>
      `,
    });

    contact.replied = true;
    await contact.save();

    res.json({ success: true, message: "تم إرسال الرد بنجاح" });

  } catch (error) {
    console.error("Reply Error:", error.message) // ← الجديد
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;