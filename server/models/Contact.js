const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  replied: { type: Boolean, default: false }, // هل تم الرد؟
}, { timestamps: true });

module.exports = mongoose.model("Contact", ContactSchema);