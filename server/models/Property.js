const mongoose = require("mongoose"); // استيراد mongoose

// طلب التعديل المعلّق (شوف pendingChanges تحت) — بدون _id خاص فيه
const PendingChangesSchema = new mongoose.Schema({
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  newImages: { type: [String], default: [] },
  keepImages: { type: [String], default: undefined },
  submittedBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
  },
  submittedAt: Date,
}, { _id: false, minimize: false });

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

  // مين أضاف العقار — بينكتب مرة وحدة وقت الإضافة وما بيتغيّر أبداً (بعكس action.by اللي بيتبدّل مع كل تعديل).
  // name محفوظ نسخة عشان يضل ظاهر حتى لو المستخدم انحذف
  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
  },

  // طلب تعديل من سب أدمن (editor) بانتظار موافقة الأدمن — null = ما في طلب.
  // data: الحقول اللي انبعتت بالطلب (متل body الـ PUT)، newImages: الصور الجديدة المرفوعة على Cloudinary،
  // keepImages: الصور القديمة اللي لازم تضل (null = ما انبعتت = كلها بتضل)
  pendingChanges: { type: PendingChangesSchema, default: null },

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
PropertySchema.index({ "createdBy.id": 1 }); // فلتر "حسب الشخص" بالداشبورد

module.exports = mongoose.model("Property", PropertySchema); // تصدير الموديل