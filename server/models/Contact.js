const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String,
    required: true,
    trim: true,
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "بريد إلكتروني غير صالح"],
  },
  phone: { type: String, trim: true, maxlength: 30 },
  message: { type: String, required: true, maxlength: 5000 },
  replied: { type: Boolean, default: false }, // هل تم الرد؟
}, { timestamps: true });

module.exports = mongoose.model("Contact", ContactSchema);
