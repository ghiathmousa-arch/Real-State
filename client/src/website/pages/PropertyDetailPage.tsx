import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import SEO from "../components/SEO/SEO";
import { cdn, formatPrice, formatRentPrices, type RentPeriod } from "../../utils/format";
import { WHATSAPP_NUMBER } from "../../constants/contact";
import { api, API_BASE } from "../../utils/api";
import { localized, localizedList } from "../../utils/helper";

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
  // مدة الإيجار المختارة بمربع السعر — "" = أول مدة متوفرة
  const [selectedPeriod, setSelectedPeriod] = useState<"" | RentPeriod>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        window.scrollTo(0, 0);

        const res = await api.get(`/properties/${id}`);
        const prop = res.data;
        setProperty(prop);
        setActiveImg(0);

        // عقارات مشابهة: لازم تكون من نفس النوع (إيجار مع إيجار، بيع مع بيع).
        // الأولوية لنفس المدينة، وإذا ما كفّوا منكمّل من نفس النوع بأي مدينة.
        const allRes = await api.get("/properties", { params: { type: prop.type } });
        const sameType: any[] = (Array.isArray(allRes.data) ? allRes.data : [])
          .filter(p => p._id !== prop._id && p.type === prop.type);

        const sameCity = sameType.filter(p => p.city === prop.city);
        const otherCities = sameType.filter(p => p.city !== prop.city);

        setSimilar([...sameCity, ...otherCities].slice(0, 6));
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

  const title = localized(property, "title", ar);
  const description = localized(property, "description", ar);
  const city = localized(property, "city", ar);
  const address = localized(property, "address", ar);
  const category = localized(property, "category", ar);
  const features = localizedList(property, "features", ar);
  const isBuy = property.type === "buy";
  // الإيجار: كل المدد المعبّاة سطر سطر. البيع: السعر الواحد
  const rentItems = isBuy ? [] : formatRentPrices(property.rentPrices, ar);
  const hasPrice = isBuy ? property.price != null && property.price > 0 : rentItems.length > 0;
  const selectedRent = rentItems.find(i => i.period === selectedPeriod) ?? rentItems[0];

  // رسالة واتساب جاهزة: العنوان + (مدة الإيجار المختارة) + السعر + رابط الصفحة
  const pageUrl = window.location.href;
  const priceText = isBuy ? (hasPrice ? formatPrice(property.price) : "") : selectedRent?.price ?? "";
  const periodText = !isBuy && selectedRent ? t(`rentPeriods.${selectedRent.period}`) : "";
  const whatsappMessage = ar
    ? `مرحباً، مهتم بـ "${title}"${periodText ? ` — إيجار ${periodText}` : ""}${priceText ? ` بسعر ${priceText}` : ""}. الرابط: ${pageUrl}`
    : `Hello, I'm interested in "${title}"${periodText ? ` — ${periodText} rent` : ""}${priceText ? ` at ${priceText}` : ""}. Link: ${pageUrl}`;
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

  // حالة العقار: المباع والمعلّق ما بيظهروا بالقوائم العامة، بس صفحتهم بتفتح من الروابط القديمة
  const isActive = !property.status || property.status === "active";
  const statusBadge =
    property.status === "sold"
      ? { label: ar ? "مباع" : "Sold", note: ar ? "هذا العقار لم يعد متاحاً" : "This property is no longer available", color: "bg-red-600" }
      : property.status === "pending"
        ? { label: ar ? "معلّق" : "Pending", note: ar ? "هذا العقار محجوز حالياً وقيد المراجعة" : "This property is currently on hold", color: "bg-amber-500" }
        : null;

  const images: string[] = property.images?.length
    ? property.images.map((img: string) => cdn(img.startsWith("http") ? img : `${API_BASE}${img}`))
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
      {/* العنوان بيذكر بيع/إيجار والسعر (للإيجار: أقصر مدة) */}
      <SEO
        title={[
          title,
          isBuy ? t("seo.forSale") : t("seo.forRent"),
          isBuy ? (hasPrice ? formatPrice(property.price) : "") : rentItems[0]?.text ?? "",
        ].filter(Boolean).join(" — ")}
        description={description ? description.slice(0, 155) : undefined}
      />
      <FloatingWhatsApp
        message={whatsappMessage}
        position={ar ? "left" : "right"}
        // ≤ 800px الزر العائم كان يقعد فوق مربع السعر/المدد — وفي زر واتساب كبير بالمربع أصلاً
        className="max-[800px]:hidden"
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

        {/* تنبيه العقار غير المتاح (مباع / معلّق) — الصفحة بتضل تفتح عشان الروابط القديمة */}
        {statusBadge && (
          <div className={`mb-3 rounded-2xl px-4 py-3 text-sm font-bold text-white ${statusBadge.color}`}>
            {statusBadge.label} — {statusBadge.note}
          </div>
        )}

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
            {property.isFeatured && isActive && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500 text-white shadow">
                ★ {ar ? "مميز" : "Featured"}
              </span>
            )}
            {statusBadge && (
              <span className={`text-xs font-black px-3 py-1.5 rounded-full text-white shadow ${statusBadge.color}`}>
                {statusBadge.label}
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
            <div className={`flex-1 w-full ${ar ? "text-right" : "text-left"}`}>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{category}</p>
              <h1 className="font-extrabold text-gray-800 dark:text-white leading-tight mb-3 text-2xl md:text-3xl">
                {title}
              </h1>
              {(address || city) && (
                <div className={`flex items-center gap-1.5 text-gray-400 text-sm ${ar ? "flex-row-reverse justify-end" : "flex-row justify-start"}`}>
                  <LuMapPin size={14} className="text-sky-500 shrink-0" />
                  <span>{[address, city].filter(Boolean).join(ar ? "، " : ", ")}</span>
                </div>
              )}
            </div>
            {/* السعر + واتساب */}
            <div className="shrink-0 w-full sm:w-72 flex flex-col gap-3">
              {isBuy ? (
                hasPrice ? (
                  <div className={ar ? "text-right" : "text-left"}>
                    <p dir="ltr" className={`text-3xl font-extrabold text-sky-600 dark:text-sky-400 leading-none ${ar ? "text-right" : "text-left"}`}>
                      {formatPrice(property.price)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{t("properties.currency")}</p>
                  </div>
                ) : (
                  <p className="text-lg font-bold text-sky-600 dark:text-sky-400">{t("properties.priceOnRequest")}</p>
                )
              ) : rentItems.length > 0 ? (
                // مدد الإيجار — كل مدة سطر قابل للاختيار (radio): المدة بأول السطر والسعر بآخره
                <div role="radiogroup" aria-label={t("detail.rentPeriods")} className="flex flex-col gap-2">
                  {rentItems.map(item => {
                    const checked = item.period === selectedRent?.period;
                    return (
                      <button key={item.period} role="radio" aria-checked={checked}
                        onClick={() => setSelectedPeriod(item.period)}
                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-all text-start
                          ${checked
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                            : "border-gray-100 dark:border-gray-700 hover:border-amber-300"}`}>
                        <span className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-200">
                          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${checked ? "border-amber-500" : "border-gray-300 dark:border-gray-500"}`}>
                            {checked && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                          </span>
                          {t(`rentPeriods.${item.period}`)}
                        </span>
                        <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400">
                          <span dir="ltr">{item.price}</span>
                          <span className="text-xs font-bold text-gray-400 ms-1">/ {item.label}</span>
                        </span>
                      </button>
                    );
                  })}
                  <p className="text-xs text-gray-400">{t("properties.currency")}</p>
                </div>
              ) : (
                <p className="text-lg font-bold text-sky-600 dark:text-sky-400">{t("properties.priceOnRequest")}</p>
              )}

              {/* واتساب برسالة جاهزة — بس للعقار المتاح */}
              {isActive && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-base shadow-lg transition-all">
                  <img src="/img/whatsapp.svg" width={22} height={22} alt="" />
                  {isBuy ? t("detail.whatsappBuy") : t("detail.whatsappRent")}
                </a>
              )}
            </div>
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
              ...(!isBuy && rentItems.length > 0
                ? [{ label: t("detail.rentPeriods"), value: rentItems.map(i => t(`rentPeriods.${i.period}`)).join(ar ? "، " : ", ") }]
                : []),
              ...(property.furnished
                ? [{ label: t("detail.furnished"), value: t(`properties.${property.furnished}`) }]
                : []),
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