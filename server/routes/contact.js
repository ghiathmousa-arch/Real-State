const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// POST /api/contact
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // إنشاء وحفظ الرسالة
    const contact = await Contact.create({ name, email, phone, message });

    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;