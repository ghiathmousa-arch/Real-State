// استيراد مكتبة ريآكت والـ Hooks الأساسية لإدارة الحالة والتأثيرات الجانبية
import { useState, useEffect } from 'react'
// استيراد أيقونات الإغلاق، الحفظ، ورفع الملفات من مكتبة react-icons
import { MdClose, MdSave, MdCloudUpload } from "react-icons/md"
// استيراد مكتبة Axios لإرسال طلبات الـ HTTP إلى خادم الخلفية (Backend)
import axios from 'axios'
// استيراد مكون نافذة النجاح المنبثقة لإظهارها عند إتمام التعديل
import SuccessModal from '../SuccessModal/SuccessModal'

// مصفوفة تحتوي على أسماء المحافظات السورية باللغة العربية لعرضها في قائمة الاختيارات
const CITIES = [
  "دمشق", "ريف dمشق", "حلب", "ريف حلب", "حمص",
  "حماة", "اللاذقية", "طرطوس", "إدلب", "درعا",
  "السويداء", "القنيطرة", "دير الزور", "الحسكة", "الرقة"
]
// مصفوفة المحافظات باللغة الإنجليزية لتتوافق مع دعم الثنائية اللغوية في المنصة
const CITIES_EN = [
  "Damascus", "Rif Dimashq", "Aleppo", "Rif Aleppo", "Homs",
  "Hama", "Latakia", "Tartus", "Idlib", "Daraa",
  "Suwayda", "Quneitra", "Deir ez-Zor", "Al-Hasakah", "Raqqa"
]
// مصفوفة أنواع فئات العقارات باللغة العربية
const CATEGORIES = ["شقة", "منزل", "أرض", "مزرعة"]
// مصفوفة أنواع فئات العقارات باللغة الإنجليزية
const CATEGORIES_EN = ["Apartment", "House", "Land", "Farm"]

// تعريف واجهة البيانات (TypeScript Interface) لتحديد أنواع الـ Props المستقبلة للمكون
interface Props {
  isOpen: boolean      // حالة فتح أو إغلاق المودال (نافذة منبثقة)
  onClose: () => void  // دالة لتنفيذ إغلاق المودال
  property: any        // كائن العقار المراد تعديل بياناته حالياً
  onSuccess: () => void // دالة تحديث البيانات في الجدول بعد نجاح التعديل
}

// جلب رابط الـ API الأساسي من متغيرات البيئة (Environment Variables)
const API_URL = import.meta.env.VITE_API_URL || "";
// تنظيف الرابط من كلمة /api للحصول على رابط السيرفر الجذري من أجل عرض الصور الساكنة
const BASE_URL = API_URL.replace(/\/api\/?$/, "");

// المكون الأساسي لنافذة تعديل العقار
const EditPropertyModal = ({ isOpen, onClose, property, onSuccess }: Props) => {
  // حالة (State) لتخزين بيانات نموذج التعديل ككائن ديناميكي
  const [formData, setFormData] = useState<any>({})
  // حالة لتخزين ملفات الصور الجديدة المحددة من قِبل المستخدم للرفع
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  // حالات لتخزين وإدارة قوائم ميزات العقار (مثل: مسبح، كراج) بالعربية والإنجليزية
  const [features, setFeatures] = useState<string[]>([])
  const [featuresEn, setFeaturesEn] = useState<string[]>([])
  // حالة لتخزين النص المكتوب حالياً داخل حقل إدخال الميزة الواحدة قبل إضافتها
  const [featureInput, setFeatureInput] = useState("")
  const [featureInputEn, setFeatureInputEn] = useState("")
  // حالة للتحكم في وضع التحميل وظهور مؤشر "جاري الحفظ" على زر الإرسال
  const [loading, setLoading] = useState(false)
  // حالة للتحكم في إظهار أو إخفاء مودال نجاح العملية
  const [showSuccess, setShowSuccess] = useState(false)

  // تأثير (Effect) يعمل فور تغير العقار المستهدف، ليقوم بملء الحقول بالبيانات الحالية للعقار
  useEffect(() => {
    if (property) {
      setFormData({ ...property })               // نسخ بيانات العقار داخل الـ State الخاصة بالنموذج
      setFeatures(property.features || [])       // تعيين الميزات العربية الحالية إن وجدت
      setFeaturesEn(property.featuresEn || [])   // تعيين الميزات الإنجليزية الحالية إن وجدت
    }
  }, [property])

  // حارس برمجى: إذا كانت حالة النافذة مغلقة (isOpen === false) لا تقم برندر أي عنصر HTML
  if (!isOpen) return null

  // دالة لتحديث قيمة حقل معين داخل كائن formData عند الكتابة في المدخلات
  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  // دالة لإضافة ميزة جديدة باللغة العربية إلى مصفوفة الميزات والتأكد من عدم تكرارها
  const addFeature = () => {
    const val = featureInput.trim()
    if (val && !features.includes(val)) {
      setFeatures(prev => [...prev, val])
      setFeatureInput("") // تفريغ حقل الإدخال بعد الإضافة الناجحة
    }
  }

  // دالة لإضافة ميزة جديدة باللغة الإنجليزية إلى مصفوفة الميزات الخاصة بها
  const addFeatureEn = () => {
    const val = featureInputEn.trim()
    if (val && !featuresEn.includes(val)) {
      setFeaturesEn(prev => [...prev, val])
      setFeatureInputEn("") // تفريغ حقل الإدخال بعد الإضافة الناجحة
    }
  }

  // الدالة المسؤولة عن معالجة وإرسال البيانات إلى السيرفر عند الضغط على زر الحفظ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // منع السلوك الافتراضي للمتصفح بإعادة تحميل الصفحة عند إرسال الفورم
    setLoading(true)   // تفعيل وضع التحميل لمنع نقرات المستخدم المتكررة
    try {
      const token = localStorage.getItem("token") // جلب توكن التحقق (JWT) المخزن في المتصفح لتوثيق الطلب
      const data = new FormData()                 // إنشاء كائن FormData للتمكن من إرسال النصوص والملفات (الصور) معاً

      // قائمة بجميع الحقول النصية والرقمية المطلوب نقلها من النموذج إلى السيرفر
      // ✅ تمت إضافة videoUrl لهاي القائمة
      const fields = [
        'title', 'titleEn', 'description', 'descriptionEn',
        'category', 'categoryEn', 'type', 'price', 'city', 'cityEn',
        'area', 'rooms', 'bathrooms', 'address', 'addressEn', 'status', 'videoUrl'
      ]

      // التكرار على الحقول وإضافتها للـ FormData في حال كانت تحتوي على قيم حقيقية
      fields.forEach(f => {
        if (formData[f] !== undefined && formData[f] !== null)
          data.append(f, String(formData[f]))
      })

      // تحويل وتحضير القيم المنطقية وقوائم المصفوفات إلى نصوص متوافقة مع الـ Backend
      data.append('isFeatured', String(formData.isFeatured === true || formData.isFeatured === "true"))
      data.append('features', features.join(','))     // تحويل مصفوفة الميزات العربية إلى نص مفصول بفواصل
      data.append('featuresEn', featuresEn.join(',')) // تحويل مصفوفة الميزات الإنجليزية إلى نص مفصول بفواصل

      // التحقق مما إذا قام المستخدم باختيار صور جديدة لاستبدال الصور القديمة بالعقار
      if (selectedFiles && selectedFiles.length > 0) {
        data.append('replaceImages', 'true') // إخبار السيرفر بضرورة مسح الصور القديمة وتعويضها بالجديدة
        Array.from(selectedFiles).forEach(file => data.append('images', file)) // إلحاق كافة ملفات الصور بالطلب
      } else {
        data.append('replaceImages', 'false') // إخبار السيرفر بالاحتفاظ بالصور القديمة دون تعديل
      }

      // إرسال طلب من نوع PUT إلى السيرفر لتحديث العقار عبر الـ ID الخاص به وتمرير التوكن في الهيدر
      await axios.put(`${BASE_URL}/api/properties/${property._id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })

      setShowSuccess(true) // إظهار نافذة النجاح المنبثقة عند نجاح الاستجابة من السيرفر
    } catch (error: any) {
      // طباعة الخطأ في الكونسول في حال فشل الاتصال بالسيرفر أو رفض التعديل
      console.error("فشل التعديل:", error.response?.data?.error || "خطأ في السيرفر")
    } finally {
      setLoading(false) // إلغاء وضع التحميل وإعادة زر الحفظ لحالته الطبيعية
    }
  }

  // معالجة وبناء مسار الصورة الحالية لضمان قراءتها بشكل صحيح دون مشاكل في السلاش
  const currentImg = property?.images?.[0];
  const imgSrc = currentImg
    ? (currentImg.startsWith('http') ? currentImg : `${BASE_URL}/${currentImg.replace(/^\//, '')}`)
    : null;

  return (
    <>
      {/* الحاوية الرئيسية الشاملة للشاشة بالكامل لإظهار المودال فوق المحتوى (Z-Index: 150) */}
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
        {/* الخلفية المعتمة خلف النافذة مع ميزة الضبابية (Blur)، إغلاق النافذة عند النقر عليها */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

        {/* نموذج إدخال البيانات الملتف داخل بطاقة بيضاء قابلة للتمرير الرأسي ذو حواف دائرية كبيرة */}
        <form onSubmit={handleSubmit}
          className="relative bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 overflow-y-auto max-h-[95vh] sm:max-h-[90vh] shadow-2xl"
          dir="rtl"
        >
          {/* قسم ترويسة المودال (العنوان وزر الإغلاق X) */}
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0f2d4a]">تعديل بيانات العقار</h2>
              <p className="text-xs text-gray-400 font-bold mt-1">تحديث المعلومات بالعربي والإنجليزي</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 sm:p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
              <MdClose size={22} />
            </button>
          </div>

          {/* قسم معاينة الصورة الحالية للعقار قبل الاستبدال (يختفي في حال اختيار صور جديدة) */}
          {imgSrc && !selectedFiles && (
            <div className="mb-5">
              <p className="text-xs font-black text-gray-400 mb-2">الصورة الحالية</p>
              <img src={imgSrc} className="w-full h-36 sm:h-40 object-cover rounded-2xl border border-gray-100" alt="current" />
            </div>
          )}

          {/* شبكة توزيع العناصر (Grid) لتقسيم المدخلات إلى عمودين في الشاشات الكبيرة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* حقل إدخال عنوان العقار باللغة العربية */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">عنوان العقار</label>
              <input type="text"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} />
            </div>
            {/* حقل إدخال عنوان العقار باللغة الإنجليزية مع اتجاه نص من اليسار لليمين */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">Property Title (EN)</label>
              <input type="text" dir="ltr"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.titleEn || ''} onChange={e => handleChange('titleEn', e.target.value)} />
            </div>

            {/* حقل الوصف التفصيلي للعقار بالعربية (مساحة نصية متعددة الأسطر) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">الوصف</label>
              <textarea rows={3}
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a] resize-none"
                value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} />
            </div>
            {/* حقل الوصف التفصيلي للعقار بالإنجليزية */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">Description (EN)</label>
              <textarea rows={3} dir="ltr"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a] resize-none"
                value={formData.descriptionEn || ''} onChange={e => handleChange('descriptionEn', e.target.value)} />
            </div>

            {/* قائمة منسدلة (Select) لاختيار فئة العقار بالعربية */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">الفئة</label>
              <select className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.category || ''} onChange={e => handleChange('category', e.target.value)}>
                <option value="">اختر الفئة</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* قائمة منسدلة لاختيار فئة العقار بالإنجليزية */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">Category (EN)</label>
              <select dir="ltr" className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.categoryEn || ''} onChange={e => handleChange('categoryEn', e.target.value)}>
                <option value="">Select Category</option>
                {CATEGORIES_EN.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* قائمة تحديد نوع المعاملة (بيع أو إيجار) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">النوع</label>
              <select className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.type || ''} onChange={e => handleChange('type', e.target.value)}>
                <option value="buy">بيع</option>
                <option value="rent">إيجار</option>
              </select>
            </div>

            {/* حقل إدخال سعر العقار مع فلترة برمجية تمنع كتابة أي رموز غير الأرقام الحسابية */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">السعر (ل.س)</label>
              <input type="text" inputMode="numeric"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-blue-600"
                value={formData.price || ''}
                onChange={e => handleChange('price', e.target.value.replace(/[^0-9]/g, ''))} />
            </div>

            {/* حقل المساحة الإجمالية بالأمتار المربعة */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">المساحة (م²)</label>
              <input type="number"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.area || ''} onChange={e => handleChange('area', e.target.value)} />
            </div>

            {/* قائمة اختيار المدينة المستهدفة بالعربية */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">المدينة</label>
              <select className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.city || ''} onChange={e => handleChange('city', e.target.value)}>
                <option value="">اختر المدينة</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* قائمة اختيار المدينة المستهدفة بالإنجليزية */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">City (EN)</label>
              <select dir="ltr" className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.cityEn || ''} onChange={e => handleChange('cityEn', e.target.value)}>
                <option value="">Select City</option>
                {CITIES_EN.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* حقل تفاصيل العنوان الدقيق أو الشارع والمنطقة محلياً */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">العنوان التفصيلي</label>
              <input type="text"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} />
            </div>
            {/* حقل تفاصيل العنوان الدقيق بالإنجليزية */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">Address (EN)</label>
              <input type="text" dir="ltr"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.addressEn || ''} onChange={e => handleChange('addressEn', e.target.value)} />
            </div>

            {/* حقل تحديد عدد الغرف الإجمالي داخل العقار */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">عدد الغرف</label>
              <input type="number"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.rooms || ''} onChange={e => handleChange('rooms', e.target.value)} />
            </div>
            {/* حقل تحديد عدد الحمامات */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">عدد الحمامات</label>
              <input type="number"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.bathrooms || ''} onChange={e => handleChange('bathrooms', e.target.value)} />
            </div>

            {/* ✅ حقل رابط فيديو يوتيوب - جديد */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">رابط فيديو يوتيوب (اختياري)</label>
              <input type="url" dir="ltr" placeholder="https://youtu.be/xxxxxxx"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.videoUrl || ''} onChange={e => handleChange('videoUrl', e.target.value)} />
            </div>

            {/* قائمة تحديد حالة ظهور العقار (نشط، مباع، معلق تحت المراجعة) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">الحالة</label>
              <select className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.status || 'active'} onChange={e => handleChange('status', e.target.value)}>
                <option value="active">نشط</option>
                <option value="sold">مباع</option>
                <option value="pending">معلق</option>
              </select>
            </div>
            {/* قائمة تحديد ما إذا كان العقار مميزاً (Is Featured) ليظهر في البانر الرئيسي للموقع أولاً */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">مميز؟</label>
              <select className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.isFeatured ? "true" : "false"} onChange={e => handleChange('isFeatured', e.target.value)}>
                <option value="true">نعم</option>
                <option value="false">لا</option>
              </select>
            </div>

            {/* قسم إدارة وإضافة مميزات العقار بالعربية (نظام تاق / شارات متعددة) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">المميزات (عربي)</label>
              <div className="flex gap-2">
                {/* حقل إدخال الميزة، يدعم الضغط على زر Enter لإضافتها مباشرة وبأمان */}
                <input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="مسبح، حديقة..."
                  className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a]" />
                <button type="button" onClick={addFeature} className="px-4 py-2 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition">+</button>
              </div>
              {/* حلقة (Loop) لعرض الميزات العربية المضافة مسبقاً على هيئة شارات زرقاء قابلة للحذف */}
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {features.map((f, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold">
                      {f}
                      <button type="button" onClick={() => setFeatures(prev => prev.filter((_, j) => j !== i))} className="text-blue-400 hover:text-red-500">
                        <MdClose size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* قسم إدارة وإضافة مميزات العقار بالإنجليزية (شارات خضراء) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">Features (EN)</label>
              <div className="flex gap-2">
                <input value={featureInputEn} onChange={e => setFeatureInputEn(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeatureEn())}
                  placeholder="Pool, Garden..." dir="ltr"
                  className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a]" />
                <button type="button" onClick={addFeatureEn} className="px-4 py-2 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition">+</button>
              </div>
              {/* حلقة (Loop) لعرض الميزات الإنجليزية المضافة حالياً على هيئة شارات خضراء قابلة للحذف */}
              {featuresEn.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {featuresEn.map((f, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold">
                      {f}
                      <button type="button" onClick={() => setFeaturesEn(prev => prev.filter((_, j) => j !== i))} className="text-green-400 hover:text-red-500">
                        <MdClose size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* حقل سحب وإفلات أو اختيار الصور الجديدة، يمتد على كامل عرض الفورم في الشاشات الكبيرة */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-black text-gray-400">
                استبدال الصور {selectedFiles ? `— تم اختيار ${selectedFiles.length} صور` : "(اختياري)"}
              </label>
              <div className="relative group">
                {/* حقل إدخال مخفي الشفافية تماماً ولكنه يغطي المساحة بالكامل لاستقبال حدث النقر والرفع السلس */}
                <input type="file" multiple accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={e => setSelectedFiles(e.target.files)} />
                {/* واجهة صندوق الرفع الرسومية المتفاعلة حركياً وتغيير ألوانها عند اختيار الصور */}
                <div className={`p-5 sm:p-6 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-2 transition-all
                  ${selectedFiles ? "border-blue-400 bg-blue-50" : "border-gray-200 group-hover:border-blue-400"}`}>
                  <MdCloudUpload size={30} className={selectedFiles ? "text-blue-500" : "text-gray-300 group-hover:text-blue-500"} />
                  <span className="text-xs font-bold text-gray-400 text-center">
                    {selectedFiles ? `${selectedFiles.length} صور جاهزة — ستحل محل القديمة` : "اسحب الصور هنا أو اضغط للاختيار"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* زر تقديم وإرسال الفورم لحفظ كافة التعديلات في قاعدة البيانات عبر الـ API */}
          <button type="submit" disabled={loading}
            className="w-full mt-6 sm:mt-8 py-4 sm:py-5 bg-[#0f2d4a] text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-900 shadow-xl transition-all disabled:opacity-50">
            <MdSave size={22} />
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>
      </div>

      {/* استدعاء مكون نافذة النجاح المنبثقة، وتمرير وظائف إعادة جلب البيانات وإغلاق جميع النوافذ عند تأكيد النقر */}
      <SuccessModal
        isOpen={showSuccess}
        title="تم التعديل!"
        message="تم تحديث بيانات العقار بنجاح"
        primaryBtn={{
          label: "حسناً",
          onClick: () => { setShowSuccess(false); onSuccess(); onClose() }
        }}
      />
    </>
  )
}

// تصدير المكون بشكل افتراضي ليتمكن المطور من استدعائه واستخدامه داخل صفحات المشروع الأخرى
export default EditPropertyModal;