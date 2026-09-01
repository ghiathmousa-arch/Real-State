import { useState } from "react"
import {
  MdClose, MdLocationOn, MdSquareFoot, MdAttachMoney,
  MdDescription, MdOutlineMeetingRoom, MdCheckCircle,
  MdInfoOutline, MdChevronLeft, MdChevronRight, MdBathtub,
  MdCalendarToday, MdUpdate, MdStar, MdHome, MdSell
} from "react-icons/md"
import { getImgSrc, formatPrice, BASE_URL } from '../../../utils/format'

interface Props {
  isOpen: boolean
  onClose: () => void
  property: any
  onEditClick: () => void
}

// ── إحصائيات العقار — array بدل تكرار JSX ──────────────
const buildStats = (property: any) => [
  { label: "السعر", value: property.price != null ? `${formatPrice(property.price)} ل.س` : "—", icon: <MdAttachMoney size={20} />, color: "text-green-600", bg: "bg-green-50" },
  { label: "المساحة", value: `${property.area} م²`, icon: <MdSquareFoot size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "الغرف", value: property.rooms || "—", icon: <MdOutlineMeetingRoom size={20} />, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "الحمامات", value: property.bathrooms || "—", icon: <MdBathtub size={20} />, color: "text-cyan-600", bg: "bg-cyan-50" },
  { label: "النوع", value: property.type === "buy" ? "للبيع" : "للإيجار", icon: <MdSell size={20} />, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "الفئة", value: property.category || "—", icon: <MdHome size={20} />, color: "text-indigo-600", bg: "bg-indigo-50" },
]

const PropertyDetailsModal = ({ isOpen, onClose, property, onEditClick }: Props) => {
  const [activeImg, setActiveImg] = useState(0)

  if (!isOpen || !property) return null

  // ما في صور؟ مصفوفة فاضية — ما بنعرض صورة افتراضية إطلاقاً، بتضل الخلفية الرمادية فاضية
  const images: string[] = property.images?.length
    ? property.images.map((img: string) =>
      img.startsWith("http") ? img : `${BASE_URL}/${img.replace(/^\//, "")}`
    )
    : []

  const stats = buildStats(property)
  const features = property.features || []
  const isActive = property.status === "active"
  const createdAt = property.createdAt
    ? new Date(property.createdAt).toLocaleDateString("ar-SY")
    : "—"

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 h-full w-full max-w-xl shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">

        {/* ── معرض الصور ── */}
        <div className="relative h-56 sm:h-72 w-full shrink-0 bg-gray-100 dark:bg-gray-800">
          {images.length > 0 && (
            <img src={images[activeImg]} className="w-full h-full object-cover" alt={property.title} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <button onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-lg z-10">
            <MdClose size={22} />
          </button>

          {images.length > 1 && (
            <>
              <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10">
                <MdChevronRight size={22} className="text-gray-700 dark:text-gray-200" />
              </button>
              <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all z-10">
                <MdChevronLeft size={22} className="text-gray-700 dark:text-gray-200" />
              </button>
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImg ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
                ))}
              </div>
            </>
          )}

          <div className="absolute bottom-4 right-4 left-4 text-white text-right">
            <div className="flex items-center gap-2 mb-2 flex-wrap justify-end">
              <span className="px-2.5 py-1 bg-blue-500 rounded-lg text-[10px] font-bold uppercase">
                {property.category || "عقار"}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${isActive ? "bg-green-500" : "bg-amber-500"}`}>
                {isActive ? "نشط" : "معلق"}
              </span>
              {property.isFeatured && (
                <span className="px-2.5 py-1 bg-emerald-500 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1">
                  <MdStar size={12} /> مميز
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black leading-tight mb-1">{property.title}</h2>
            <div className="flex items-center gap-1 text-blue-200 text-xs sm:text-sm">
              <MdLocationOn size={14} />
              <span>{property.city} - {property.address}</span>
            </div>
          </div>
        </div>

        {/* ── المحتوى ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-right" dir="rtl">

          {/* الإحصائيات */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {stats.map((stat, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-2.5">
                <div className={`w-9 h-9 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-gray-400 dark:text-gray-500 text-[9px] font-bold uppercase">{stat.label}</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* الوصف */}
          {property.description && (
            <section className="space-y-2">
              <h4 className="text-gray-800 dark:text-white font-bold flex items-center gap-2 text-base">
                <MdDescription className="text-blue-600" /> الوصف
              </h4>
              <p className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {property.description}
              </p>
            </section>
          )}

          {/* المميزات */}
          {features.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-gray-800 dark:text-white font-bold flex items-center gap-2 text-base">
                <MdCheckCircle className="text-blue-600" /> المميزات
              </h4>
              <div className="flex flex-wrap gap-2">
                {features.map((f: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-100 dark:border-blue-800">
                    {f}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* معلومات إضافية */}
          <section className="space-y-2">
            <h4 className="text-gray-800 dark:text-white font-bold flex items-center gap-2 text-base">
              <MdInfoOutline className="text-blue-600" /> معلومات إضافية
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mb-1">تاريخ الإضافة</p>
                <p className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 justify-end">
                  <MdCalendarToday size={14} className="text-blue-500" /> {createdAt}
                </p>
              </div>
              {property.action && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-gray-400 dark:text-gray-500 text-[10px] font-bold mb-1">الحالة</p>
                  <p className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 justify-end">
                    <MdUpdate size={14} className="text-blue-500" />
                    {property.action.type === "sold" ? "تم البيع" : property.action.type === "added" ? "جديد" : "محدّث"}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* مصغرات الصور */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? "border-blue-500" : "border-transparent opacity-60"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-4 sm:px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
          <button onClick={onEditClick}
            className="w-full py-3.5 sm:py-4 bg-blue-900 dark:bg-blue-700 text-white rounded-2xl font-bold text-base shadow-lg hover:bg-blue-800 transition-all active:scale-[0.98]">
            تعديل بيانات هذا العقار
          </button>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetailsModal