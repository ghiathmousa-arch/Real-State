import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import {
  LuArrowLeft, LuArrowRight,
  LuChevronLeft, LuChevronRight,
  LuMapPin, LuBedSingle,
  LuShare2, LuHeart,
  LuPlay, LuExternalLink,
} from "react-icons/lu";
import { CiRuler } from "react-icons/ci";
import { PiBathtub } from "react-icons/pi";
import { TbCheck } from "react-icons/tb";
import PropertySlider from "../components/Propertyslider/Propertyslider";
import FloatingWhatsApp from "../components/FloatingWhatsApp/FloatingWhatsApp";

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const ar = i18n.language === "ar";

  const [property, setProperty] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = API_URL?.replace("/api", "");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);

        const res = await axios.get(`${API_URL}/api/properties/${id}`);
        const prop = res.data;
        setProperty(prop);
        setActiveImg(0);

        const allRes = await axios.get(`${API_URL}/api/properties`);
        const all: any[] = Array.isArray(allRes.data) ? allRes.data : [];

        const filtered = all
          .filter(p =>
            p._id !== prop._id &&
            (p.category === prop.category || p.city === prop.city)
          )
          .slice(0, 6);

        setSimilar(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="h-8 w-32 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-6xl mb-4">🏚️</p>
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
            {ar ? "العقار غير موجود" : "Property not found"}
          </p>
          <button onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-xl bg-sky-600 text-white text-sm hover:bg-sky-700 transition">
            {ar ? "العودة" : "Go Back"}
          </button>
        </div>
      </div>
    );
  }

  const title = ar ? property.title : (property.titleEn || property.title);
  const description = ar ? property.description : (property.descriptionEn || property.description);
  const city = ar ? property.city : (property.cityEn || property.city);
  const address = ar ? property.address : (property.addressEn || property.address);
  const category = ar ? property.category : (property.categoryEn || property.category);
  const features = (ar || !property.featuresEn?.length)
    ? property.features
    : property.featuresEn;
  const isBuy = property.type === "buy";
  const hasPrice = property.price != null && property.price > 0;

  const images: string[] = property.images?.length
    ? property.images.map((img: string) => img.startsWith("http") ? img : `${BASE_URL}${img}`)
    : [];

  const BackIcon = ar ? LuArrowRight : LuArrowLeft;
  const PrevIcon = ar ? LuChevronRight : LuChevronLeft;
  const NextIcon = ar ? LuChevronLeft : LuChevronRight;

  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg(i => (i + 1) % images.length);

  return (
    <div
      dir={ar ? "rtl" : "ltr"}
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 ${ar ? "text-right" : "text-left"}`}
    >
      <FloatingWhatsApp
        message={
          ar
            ? `مرحباً، أنا مهتم بهذا العقار: ${title}\nرابط العقار: ${window.location.href}`
            : `Hello, I'm interested in this property: ${title}\nLink: ${window.location.href}`
        }
        position={ar ? "left" : "right"}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">

        {/* ── زر الرجوع ── */}
        <button onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400
                      hover:text-sky-600 dark:hover:text-sky-400 transition-colors group
                      ${ar ? "flex-row-reverse" : ""}`}>
          <BackIcon size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          {ar ? "العودة للقائمة" : "Back to listings"}
        </button>

        {/* ════════════════════════════════
            معرض الصور
        ════════════════════════════════ */}
        <div className="relative rounded-2xl overflow-hidden mb-3 bg-gray-200 dark:bg-gray-800"
          style={{ height: "420px" }}>
          {images.length > 0 && (
            <img src={images[activeImg]} alt={title}
              className="w-full h-full object-cover transition-opacity duration-300" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {images.length > 1 && (
            <>
              <button onClick={prevImg}
                className={`absolute top-1/2 -translate-y-1/2 ${ar ? "left-3" : "left-3"} w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white flex items-center justify-center shadow-lg transition-all`}>
                <PrevIcon size={18} className="text-gray-700 dark:text-gray-200" />
              </button>
              <button onClick={nextImg}
                className={`absolute top-1/2 -translate-y-1/2 ${ar ? "right-3" : "right-3"} w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white flex items-center justify-center shadow-lg transition-all`}>
                <NextIcon size={18} className="text-gray-700 dark:text-gray-200" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`h-1.5 rounded-full transition-all duration-300
                            ${i === activeImg ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>

          <div className={`absolute top-4 flex gap-2 ${ar ? "left-4" : "right-4"}`}>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full text-white shadow
                            ${isBuy ? "bg-sky-600" : "bg-amber-500"}`}>
              {isBuy ? t("properties.sale") : t("properties.rent")}
            </span>
            {property.isFeatured && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500 text-white shadow">
                ★ {ar ? "مميز" : "Featured"}
              </span>
            )}
          </div>

          <div className={`absolute bottom-4 flex gap-2 ${ar ? "left-4" : "right-4"}`}>
            <button onClick={() => setLiked(l => !l)}
              className={`w-9 h-9 rounded-full flex items-center justify-center shadow transition-all
                          ${liked ? "bg-red-500 text-white" : "bg-white/80 text-gray-600 hover:bg-white"}`}>
              <LuHeart size={16} className={liked ? "fill-white" : ""} />
            </button>
            <button onClick={() => navigator.share?.({ title, url: window.location.href })}
              className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-gray-600 flex items-center justify-center shadow transition-all">
              <LuShare2 size={16} />
            </button>
          </div>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className={`flex gap-2 mb-6 overflow-x-auto pb-1 ${ar ? "flex-row-reverse" : "flex-row"}`}>
            {images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all
                            ${i === activeImg ? "border-sky-500 opacity-100" : "border-transparent opacity-55 hover:opacity-100"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}


        {/* ════════════════════════════════
    العنوان والسعر
════════════════════════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
          <div className={`flex flex-col sm:flex-row items-start sm:justify-between gap-4 sm:gap-6 ${ar ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
            {/* العنوان */}
            <div className={`${hasPrice ? "flex-1" : "w-full"} w-full ${ar ? "text-right" : "text-left"}`}>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{category}</p>
              <h1 className={`font-extrabold text-gray-800 dark:text-white leading-tight mb-3 ${hasPrice ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"}`}>
                {title}
              </h1>
              {(address || city) && (
                <div className={`flex items-center gap-1.5 text-gray-400 text-sm ${ar ? "flex-row-reverse justify-end" : "flex-row justify-start"}`}>
                  <LuMapPin size={14} className="text-sky-500 shrink-0" />
                  <span>{[address, city].filter(Boolean).join(ar ? "، " : ", ")}</span>
                </div>
              )}
            </div>
            {/* السعر */}
            {hasPrice && (
              <div className={`shrink-0 w-full sm:w-auto ${ar ? "text-left sm:text-left" : "text-right sm:text-right"}`}>
                <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 leading-none">
                  {property.price?.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t("properties.currency")}
                  {!isBuy && <> / {t("properties.month")}</>}
                </p>
              </div>
            )}
          </div>
        </div>
        {/* ════════════════════════════════
            إحصائيات
        ════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { icon: <CiRuler size={22} />, label: ar ? "المساحة" : "Area", value: `${property.area} ${ar ? "م²" : "m²"}` },
            { icon: <LuBedSingle size={20} />, label: ar ? "الغرف" : "Rooms", value: property.rooms, hide: !property.rooms },
            { icon: <PiBathtub size={20} />, label: ar ? "الحمامات" : "Bathrooms", value: property.bathrooms, hide: !property.bathrooms },
            { icon: <LuMapPin size={20} />, label: ar ? "المدينة" : "City", value: city },
          ].filter((s: any) => !s.hide).map(stat => (
            <div key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
              <div className="flex justify-center mb-2 text-sky-500">{stat.icon}</div>
              <p className="text-xs text-gray-400 mb-0.5">{stat.label}</p>
              <p className="font-bold text-gray-800 dark:text-white text-sm">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ════════════════════════════════
            الوصف
        ════════════════════════════════ */}
        {description && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
            <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-3">
              {ar ? "الوصف" : "Description"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
              {description}
            </p>
          </div>
        )}

        {/* ════════════════════════════════
            المميزات
        ════════════════════════════════ */}
        {features?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
            <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-4">
              {ar ? "المميزات" : "Features"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((f: string, i: number) => (
                <div key={i} className={`flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 ${ar ? "flex-row-reverse" : "flex-row"}`}>
                  <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center flex-shrink-0">
                    <TbCheck size={13} className="text-sky-600 dark:text-sky-400" />
                  </span>
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            معلومات سريعة
        ════════════════════════════════ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">
            {ar ? "معلومات سريعة" : "Quick Info"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 text-sm">
            {[
              { label: ar ? "الحالة" : "Status", value: property.status === "active" ? (ar ? "متاح" : "Available") : property.status },
              { label: ar ? "النوع" : "Type", value: isBuy ? (ar ? "للبيع" : "For Sale") : (ar ? "للإيجار" : "For Rent") },
              { label: ar ? "الفئة" : "Category", value: category },
              { label: ar ? "تاريخ الإضافة" : "Added", value: new Date(property.createdAt).toLocaleDateString(ar ? "ar-SY" : "en-US") },
            ].map(row => (
              <div key={row.label} className={ar ? "text-right" : "text-left"}>
                <p className="text-gray-400 dark:text-gray-500 text-xs mb-0.5">{row.label}</p>
                <p className="font-semibold text-gray-700 dark:text-gray-300">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════
            الفيديو - مصلح
        ════════════════════════════════ */}
        {property.videoUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-3">
              {ar ? "فيديو العقار" : "Property Video"}
            </h3>

            <a
              href={property.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-4 bg-red-50 dark:bg-red-900/20 rounded-xl p-4 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all ${ar ? "flex-row-reverse" : "flex-row"}`}
            >
              <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <LuPlay size={24} className="text-white ml-0.5" />
              </div>
              <div className={`flex-1 min-w-0 ${ar ? "text-right" : "text-left"}`}>
                <p className="font-bold text-gray-800 dark:text-white text-sm">
                  {ar ? "شاهد جولة الفيديو" : "Watch Video Tour"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {property.videoUrl}
                </p>
              </div>
              <LuExternalLink size={18} className="text-gray-300 group-hover:text-red-500 transition-colors shrink-0" />
            </a>
          </div>
        )}

        {/* ── عقارات مشابهة ── */}
        {similar.length > 0 && (
          <div className="mb-6">
            <PropertySlider
              properties={similar}
              title={ar ? "عقارات مشابهة" : "Similar Properties"}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default PropertyDetailPage;