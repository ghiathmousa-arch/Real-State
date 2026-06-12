const mongoose = require("mongoose"); // استيراد mongoose

// تعريف شكل بيانات العقار بـ MongoDB
const PropertySchema = new mongoose.Schema({
  title: String,          // عنوان العقار بالعربي
  titleEn: String,        // عنوان العقار بالإنجليزي
  description: String,    // وصف العقار بالعربي
  descriptionEn: String,  // وصف العقار بالإنجليزي
  category: String,       // الفئة بالعربي (شقة، منزل...)
  categoryEn: String,     // الفئة بالإنجليزي
  type: String,           // نوع العملية: buy أو rent
  price: Number,          // السعر (اختياري - ممكن ما يكون موجود)
  city: String,           // المدينة بالعربي
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
  status: { type: String, default: "active" },   // حالة العقار: active, pending, sold

  // معلومات آخر إجراء تم على العقار (إضافة / بيع / تحديث)
  action: {
    type: { type: String, enum: ["added", "sold", "updated"], default: "added" },
    by: { type: String, default: "Admin" },
    at: { type: Date, default: Date.now }
  }

}, { timestamps: true }); // timestamps = يضيف createdAt و updatedAt تلقائياً

module.exports = mongoose.model("Property", PropertySchema); // تصدير الموديل