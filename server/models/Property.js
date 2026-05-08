const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  title: String,
  titleEn: String,
  description: String,
  descriptionEn: String,
  category: String,
  categoryEn: String,
  type: String,
  price: Number,
  city: String,
  cityEn: String,
  area: Number,
  rooms: Number,
  bathrooms: Number,
  address: String,
  addressEn: String,
  images: [String],
  features: [String],
  featuresEn: [String],
  isFeatured: { type: Boolean, default: false },
  status: { type: String, default: "active" },




  // ← جديد
  action: {
    type: { type: String, enum: ["added", "sold", "updated"], default: "added" },
    by: { type: String, default: "Admin" },
    at: { type: Date, default: Date.now }
  }

}, { timestamps: true });

module.exports = mongoose.model("Property", PropertySchema);

