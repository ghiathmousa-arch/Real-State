// استيراد مكتبة React الأساسية
import React from 'react';
// استيراد الأيقونات اللازمة لتنسيق واجهة عرض تفاصيل العقار من مكتبة react-icons
import {
  MdClose, MdLocationOn, MdSquareFoot,
  MdAttachMoney, MdDescription, MdOutlineMeetingRoom,
  MdLayers, MdMeetingRoom, MdCheckCircle, MdInfoOutline
} from "react-icons/md";

// تعريف واجهة الأنواع (Interface) لتحديد البيانات المستقبلة (Props) للمكون لضمان سلامة الكود وثباته (TypeScript)
interface Props {
  isOpen: boolean;        // حالة فتح أو إغلاق النافذة الجانبية المنبثقة
  onClose: () => void;     // الدالة المسؤولة عن إغلاق النافذة
  property: any;          // كائن يحتوي على جميع تفاصيل العقار المراد عرضه
  onEditClick: () => void; // الدالة التي يتم استدعاؤها عند الضغط على زر التعديل لفتح مودال التعديل بشكل سلس
}

// جلب رابط الـ API الأساسي من متغيرات البيئة لضمان التوافق التام بين التطوير المحلي والإنتاج (Railway)
const API_URL = import.meta.env.VITE_API_URL || "";
// تنظيف الرابط وحذف كلمة /api للحصول على الرابط الجذري الصافي للسيرفر لمعالجة مسارات صوَر العقارات بشكل صحيح
const BASE_URL = API_URL.replace(/\/api\/?$/, "");

// بناء مكون نافذة عرض تفاصيل العقار (PropertyDetailsModal)
const PropertyDetailsModal = ({ isOpen, onClose, property, onEditClick }: Props) => {
  // شرط وقائي: إذا كانت النافذة مغلقة أو بيانات العقار غير متوفرة، لا تقم برسم (Render) أي شيء في المتصفح
  if (!isOpen || !property) return null;

  // دالة مساعده لتنسيق الأرقام (مثل السعر) وإضافة فواصل الآلاف (مثال: 1,000,000) لتسهيل القراءة على المستخدم
  const formatPrice = (price: number) => price?.toLocaleString('en-US');

  return (
    // الحاوية الرئيسية الثابتة (Fixed) لتغطية الشاشة بالكامل وضمان ظهور النافذة فوق جميع عناصر لوحة التحكم الأخرى
    <div className="fixed inset-0 z-[110] flex items-center justify-end">

      {/* الخلفية المظلمة الشفافة مع تأثير الضبابية الفاخر (Blur)، وعند الضغط عليها في أي مكان فارغ يتم إغلاق النافذة */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />

      {/* القائمة أو النافذة الجانبية البيضاء التي تحتوي على تفاصيل العقار وتتحرك بسلاسة من اليمين/اليسار فور الفتح */}
      <div className="relative bg-[#fcfdfe] h-full w-full max-w-xl shadow-2xl animate-in slide-in-from-left duration-500 border-r border-white/20 shadow-blue-900/20 flex flex-col">

        {/* ---- 1. قسم الصورة العلوية (الهيدر) ---- */}
        <div className="relative h-56 sm:h-80 w-full shrink-0">
          {/* عرض الصورة الأولى للعقار ديناميكياً من السيرفر المرفوع، أو عرض صورة رمادية بديلة إذا لم يرفع المستخدم صوراً */}
          <img
            src={
              property.images?.[0]
                ? property.images[0].startsWith('http')
                  ? property.images[0]
                  : `${BASE_URL}/${property.images[0].replace(/^\//, '')}`
                : 'https://via.placeholder.com/800x600'
            }
            className="w-full h-full object-cover"
            alt={property.title}
          />
          {/* طبقة تدرج لوني أسود شفاف أسفل الصورة لضمان وضوح وقراءة النصوص البيضاء المكتوبة فوقها */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f2d4a] via-transparent to-transparent opacity-90" />

          {/* زر الإغلاق (X) العائم أعلى اليمين مع تأثير ضبابي وتغيير الألوان بسلاسة عند حرك الماوس */}
          <button onClick={onClose} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl">
            <MdClose size={24} />
          </button>

          {/* حاوية النصوص المكتوبة فوق الصورة (التصنيف، الحالة، العنوان، الموقع) */}
          <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-8 text-white text-right">
            {/* شارات (Badges) تصنيف العقار وحالته (نشط / معلق) */}
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              {/* شارة نوع وتصنيف العقار (مثال: شقة، أرض، فيلا) */}
              <span className="px-3 py-1 bg-blue-500 rounded-lg text-[10px] font-black uppercase tracking-wider">{property.category}</span>
              {/* شارة ديناميكية يتغير لونها حسب حالة العقار (أخضر للنشط، برتقالي للمعلق والتأكيد) */}
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${property.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}>
                {property.status === 'active' ? 'نشط' : 'معلق'}
              </span>
            </div>
            {/* عنوان العقار الرئيسي بخط عريض وكبير جداً وواضح */}
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">{property.title}</h2>
            {/* عرض المدينة والعنوان التفصيلي بجانب أيقونة الموقع الجغرافي الصغير */}
            <div className="flex items-center gap-1 text-blue-200 mt-1 sm:mt-2 font-medium">
              <MdLocationOn size={16} />
              <span className="text-xs sm:text-sm">{property.city} - {property.address}</span>
            </div>
          </div>
        </div>

        {/* ---- 2. قسم محتوى تفاصيل العقار (قابل للتمرير عمودياً في الشاشات الصغيرة) ---- */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 sm:space-y-8 text-right" dir="rtl">

          {/* قسم السعر والمساحة مرتبين في شبكة هندسية (Grid) متوازية من عمودين */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* بطاقة عرض السعر الرقمي مع رمز العملة */}
            <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-green-50 text-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <MdAttachMoney size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter">السعر</p>
                <p className="text-sm sm:text-lg font-black text-[#0f2d4a] truncate">{formatPrice(property.price)} <small className="text-[9px] sm:text-[10px]">ل.س</small></p>
              </div>
            </div>
            {/* بطاقة عرض مساحة العقار الإجمالية */}
            <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <MdSquareFoot size={20} />
              </div>
              <div>
                <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter">المساحة</p>
                <p className="text-sm sm:text-lg font-black text-[#0f2d4a]">{property.area} <small className="text-[9px] sm:text-[10px]">م²</small></p>
              </div>
            </div>
          </div>

          {/* قسم المواصفات الداخلية والهيكلية للعقار (الغرف، الطابق، حالة الفرش، ونوع الملكية) */}
          <section className="space-y-3 sm:space-y-4">
            <h4 className="text-[#0f2d4a] font-black flex items-center gap-2 text-base sm:text-lg">
              <MdInfoOutline className="text-blue-600" /> المواصفات
            </h4>
            {/* استعراض مصفوفة البيانات ديناميكياً بهدف توفير الأكواد المتكررة وبناء بطاقات المواصفات الفرعية */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: "الغرف", value: property.rooms || "—", icon: <MdOutlineMeetingRoom /> },
                { label: "الطابق", value: property.floor || "—", icon: <MdLayers /> },
                { label: "الفرش", value: property.isFurnished ? "مفروش" : "خالي", icon: <MdMeetingRoom /> },
                { label: "الملكية", value: property.ownership || "—", icon: <MdCheckCircle /> },
              ].map((item, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white transition-all group">
                  {/* أيقونة المواصفة مع تأثيرات وتغيير ألوان تفاعلية عند مرور مؤشر الماوس */}
                  <div className="text-blue-500/50 group-hover:text-blue-600 mb-1 transition-colors text-base sm:text-lg">{item.icon}</div>
                  {/* اسم الخاصية الفرعية (مثل: الغرف أو الملكية) */}
                  <p className="text-gray-400 text-[9px] font-bold">{item.label}</p>
                  {/* القيمة الفعلية القادمة للعقار من قاعدة بيانات مونجو دي بي (MongoDB) */}
                  <p className="text-[#0f2d4a] text-xs font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* قسم النص الوصفي الشامل المكتوب من قِبل المُعلن */}
          <section className="space-y-3 sm:space-y-4">
            <h4 className="text-[#0f2d4a] font-black flex items-center gap-2 text-base sm:text-lg">
              <MdDescription className="text-blue-600" /> الوصف
            </h4>
            {/* عرض حقل النص الوصفي، وإظهار جملة افتراضية واضحة في حال كان الحقل فارغاً في قاعدة البيانات */}
            <p className="p-4 sm:p-6 bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 text-gray-500 text-sm leading-relaxed">
              {property.description || "لا يوجد وصف إضافي لهذا العقار"}
            </p>
          </section>
        </div>

        {/* ---- 3. قسم تذييل النافذة الثابت (Footer) المخصص لزر إجراء التعديل ---- */}
        <div className="shrink-0 px-5 sm:px-8 py-4 sm:py-6 bg-[#fcfdfe] border-t border-gray-100">
          {/* عند ضغط الأدمن على هذا الزر، يتم استدعاء الدالة الممررة onEditClick لفتح مودال التعديل فوراً */}
          <button
            onClick={onEditClick}
            className="w-full py-4 sm:py-5 bg-[#0f2d4a] text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-base sm:text-lg shadow-2xl shadow-blue-900/40 hover:bg-blue-900 transition-all active:scale-[0.98]"
          >
            تعديل بيانات هذا العقار
          </button>
        </div>
      </div>
    </div>
  );
};

// تصدير المكون بشكل افتراضي ليتم استدعاؤه وعرضه داخل لوحة التحكم الرئيسية الخاصة بالعقارات
export default PropertyDetailsModal;