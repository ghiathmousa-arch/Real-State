const mongoose = require("mongoose");
const { CITIES, CATEGORIES } = require("../constants/property");
const { toLatinDigits } = require("../utils/propertyFields");

// طلب "اعرض عقارك" من زائر (مالك عقار) — collection منفصلة عن العقارات.
// ما بينزل عالموقع أبداً: الأدمن/السب أدمن بيحوّله لعقار حقيقي (converted) أو بيرفضه (rejected).
// اسم ورقم المالك بيضلوا هون بس — ما بينتقلوا للعقار ولا بيطلعوا للعامة.

const MAX_REQUEST_IMAGES = 6;

const PropertyRequestSchema = new mongoose.Schema({
  // ── المالك ──
  ownerName: { type: String, required: true, trim: true, maxlength: 100 },
  ownerPhone: {
    type: String,
    required: true,
    trim: true,
    // أرقام عربية ← لاتينية، ومنشيل المسافات والشرطات — قبل التحقق
    set: (v) => toLatinDigits(v).replace(/[\s-]/g, ""),
    match: [/^\+?[0-9]{7,20}$/, "رقم الهاتف لازم يكون أرقام بس (7–20 رقم، مع + اختياري)"],
  },
  ownerNote: { type: String, trim: true, maxlength: 1000, default: "" },

  // ── العقار ──
  type: { type: String, enum: ["buy", "rent"], required: true },
  category: { type: String, required: true, enum: CATEGORIES.map((c) => c.ar) },
  city: { type: String, required: true, enum: CITIES.map((c) => c.ar) },
  area: { type: Number, min: 0, default: null },
  rooms: { type: Number, min: 0, default: null },
  bathrooms: { type: Number, min: 0, default: null },
  address: { type: String, trim: true, maxlength: 300, default: "" },
  description: { type: String, trim: true, maxlength: 3000, default: "" },
  price: { type: Number, min: 0, default: null }, // للبيع — بالدولار
  rentPrices: {                                   // للإيجار — نفس شكل Property
    daily: { type: Number, min: 0, default: null },
    weekly: { type: Number, min: 0, default: null },
    monthly: { type: Number, min: 0, default: null },
    yearly: { type: Number, min: 0, default: null },
  },
  furnished: { type: String, enum: ["furnished", "unfurnished", null], default: null },

  // روابط Cloudinary — حد أقصى 6
  images: {
    type: [String],
    default: [],
    validate: [(v) => v.length <= MAX_REQUEST_IMAGES, `الحد الأقصى ${MAX_REQUEST_IMAGES} صور`],
  },

  // ── المعالجة ──
  status: { type: String, enum: ["new", "converted", "rejected"], default: "new" },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null }, // لما يتحوّل
  handledBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
  },
  rejectReason: { type: String, trim: true, maxlength: 500, default: "" },
}, { timestamps: true });

PropertyRequestSchema.index({ status: 1, createdAt: -1 });

PropertyRequestSchema.statics.MAX_IMAGES = MAX_REQUEST_IMAGES;

module.exports = mongoose.model("PropertyRequest", PropertyRequestSchema);
