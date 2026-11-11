const mongoose = require("mongoose"); // استيراد mongoose

// تعريف شكل بيانات العقار بـ MongoDB
const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },    // عنوان العقار بالعربي
  titleEn: String,        // عنوان العقار بالإنجليزي
  description: String,    // وصف العقار بالعربي
  descriptionEn: String,  // وصف العقار بالإنجليزي
  category: { type: String, required: true }, // الفئة بالعربي (شقة، منزل...)
  categoryEn: String,     // الفئة بالإنجليزي
  type: { type: String, enum: ["buy", "rent"], required: true }, // نوع العملية: buy أو rent
  price: { type: Number, min: 0 }, // سعر البيع بالدولار الأمريكي (USD) فقط — اختياري، null = "السعر عند الطلب". عقار الإيجار = null

  // أسعار الإيجار بالدولار — كل مدة اختيارية، اللي بيتعبّى بس بيظهر. ولا وحدة = "السعر عند الطلب"
  // (عقار البيع كلها null)
  rentPrices: {
    daily: { type: Number, min: 0, default: null },   // يومي
    weekly: { type: Number, min: 0, default: null },  // أسبوعي
    monthly: { type: Number, min: 0, default: null }, // شهري
    yearly: { type: Number, min: 0, default: null },  // سنوي
  },

  // مفروش؟ — null = غير محدد
  furnished: { type: String, enum: ["furnished", "unfurnished", null], default: null },
  city: { type: String, required: true },     // المدينة بالعربي
  cityEn: String,         // المدينة بالإنجليزي
  area: Number,           // المساحة بالمتر المربع
  rooms: Number,          // عدد الغرف
  bathrooms: Number,      // عدد الحمامات
  address: String,        // العنوان التفصيلي بالعربي
  addressEn: String,      // العنوان التفصيلي بالإنجليزي
  images: [String],       // مصفوفة روابط الصور
  features: [String],     // مميزات العقار بالعربي (حديقة، مسبح...)
  featuresEn: [String],   // مميزات العقار بالإنجليزي

  videoUrl: { type: String, default: "" }, // رابط فيديو يوتيوب تبع العقار (رابط عادي بدون معالجة)

  isFeatured: { type: Boolean, default: false }, // هل العقار موصى به؟ افتراضياً لا
  status: { type: String, enum: ["active", "pending", "sold"], default: "active" }, // حالة العقار

  // معلومات آخر إجراء تم على العقار (إضافة / بيع / تحديث)
  action: {
    type: { type: String, enum: ["added", "sold", "updated"], default: "added" },
    by: { type: String, default: "Admin" },
    at: { type: Date, default: Date.now }
  }

}, { timestamps: true }); // timestamps = يضيف createdAt و updatedAt تلقائياً

// ── الفهارس (indexes) ─────────────────────────────────────
// القائمة العامة بتفلتر على status وبتعرض الأحدث أول، والفلاتر الشائعة على المدينة والنوع والمميز
PropertySchema.index({ status: 1, createdAt: -1 });
PropertySchema.index({ city: 1 });
PropertySchema.index({ type: 1, status: 1 }); // فلترة بيع/إيجار بالقائمة العامة (النشط بس)
PropertySchema.index({ isFeatured: 1 });

module.exports = mongoose.model("Property", PropertySchema); // تصدير الموديل