const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const { Resend } = require("resend");
const { protect, adminOnly, contactLimiter } = require("../middleware");

const resend = new Resend(process.env.RESEND_API_KEY);

// ننظّف أي نص جاي من المستخدم قبل حقنه بقالب HTML بالإيميل (منع HTML injection)
const escapeHtml = (str) =>
  String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));

// ── POST / ─────────────────────────────────────────────────
router.post("/", contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message)
      return res.status(400).json({ success: false, error: "الاسم والبريد والرسالة مطلوبة" });

    const contact = await Contact.create({ name, email, phone, message });
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error("Contact POST Error:", error); // ✅ التفاصيل بالـ logs فقط

    // أخطاء التحقق (إيميل بصيغة غلط، نص أطول من الحد) غلط من المستخدم مو من السيرفر —
    // لازم ترجع 400 برسالة مفهومة، مش 500 "خطأ بالسيرفر" يلي بيخلي الزائر ما يعرف شو يصلّح
    if (error.name === "ValidationError")
      return res.status(400).json({
        success: false,
        error: "تأكد من صحة البيانات: البريد الإلكتروني بصيغة صحيحة، والرسالة أقصر من 5000 حرف",
      });

    res.status(500).json({ success: false, error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" }); // ✅ رسالة عامة
  }
});

// ── GET / ──────────────────────────────────────────────────
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error("Contact GET Error:", error); // ✅
    res.status(500).json({ success: false, error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" }); // ✅
  }
});

// ── DELETE /:id ────────────────────────────────────────────
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, error: "ID غير صالح" });

    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "تم حذف الرسالة" });
  } catch (error) {
    console.error("Contact DELETE Error:", error); // ✅
    res.status(500).json({ success: false, error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" }); // ✅
  }
});

// ── POST /:id/reply ────────────────────────────────────────
router.post("/:id/reply", protect, adminOnly, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, error: "ID غير صالح" });

    const { replyText } = req.body;

    if (!replyText)
      return res.status(400).json({ success: false, error: "نص الرد مطلوب" });

    // عنوان المرسل من البيئة — onboarding@resend.dev ما بيبعت إلا لإيميل صاحب حساب Resend،
    // فلازم دومين موثّق بـ Resend (مثال: "Syrian Estate <noreply@yourdomain.com>")
    const mailFrom = (process.env.MAIL_FROM || "").trim();
    if (!mailFrom) {
      console.error("Contact Reply Error: MAIL_FROM is not set");
      return res.status(500).json({ success: false, error: "إعداد البريد غير مكتمل" });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact)
      return res.status(404).json({ success: false, error: "الرسالة غير موجودة" });

    // منستنّى الإرسال فعلياً — وما منعلّم الرسالة replied إلا إذا نجح
    // (Resend SDK ما بيرمي عند الفشل، بيرجّع { error } — فلازم نفحصه)
    let sendResult;
    try {
      sendResult = await resend.emails.send({
        from: mailFrom,
        to: contact.email,
        subject: "ردّ على رسالتك - Syrian Estate",
        html: `
          <div dir="rtl" style="font-family:sans-serif;line-height:1.7;padding:20px;max-width:600px;margin:auto">
            <h3 style="color:#004e80;border-bottom:2px solid #e3e8f9;padding-bottom:10px">Syrian Estate</h3>
            <p>مرحباً ${escapeHtml(contact.name)}،</p>
            <p style="background:#f9f9ff;padding:15px;border-radius:8px;border-right:4px solid #004e80">
              ${escapeHtml(replyText)}
            </p>
            <hr style="border:1px solid #e3e8f9;margin:16px 0"/>
            <p style="color:#888;font-size:12px">رسالتك الأصلية: ${escapeHtml(contact.message)}</p>
          </div>
        `,
      });
    } catch (err) {
      sendResult = { error: err };
    }

    if (!sendResult || sendResult.error) {
      console.error("Mail Error:", sendResult?.error?.message || sendResult?.error);
      return res.status(502).json({ success: false, error: "تعذّر إرسال الرد بالبريد — لم يتم تعليم الرسالة كمردود عليها، حاول مرة تانية" });
    }

    contact.replied = true;
    await contact.save();

    res.json({ success: true, message: "تم إرسال الرد بنجاح" });
  } catch (error) {
    console.error("Contact Reply Error:", error); // ✅
    res.status(500).json({ success: false, error: "حدث خطأ بالسيرفر، يرجى المحاولة لاحقاً" }); // ✅
  }
});

module.exports = router;