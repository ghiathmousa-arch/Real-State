// PropertySlider.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { IoLocationOutline } from "react-icons/io5";
import { LuBedSingle } from "react-icons/lu";
import { CiRuler } from "react-icons/ci";
import { PiBathtub } from "react-icons/pi";

interface Property {
  _id: string;
  title?: string; titleEn?: string;
  city?: string; cityEn?: string;
  price?: number; area?: number;
  rooms?: number; bathrooms?: number;
  type?: string; images?: string[];
  isFeatured?: boolean;
}

interface Props {
  properties: Property[];
  title?: string;
  perPage?: number;
}

const PropertySlider: React.FC<Props> = ({
  properties,
  title,
  perPage: initialPerPage = 3,
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const ar = i18n.language === "ar";

  const API_URL = import.meta.env.VITE_API_URL;

  const [rawIndex, setIndex] = useState(0);
  const [perPage, setPerPage] = useState(initialPerPage);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setPerPage(1);
      } else if (w < 1024) {
        setPerPage(Math.min(2, initialPerPage));
      } else {
        setPerPage(initialPerPage);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initialPerPage]);

  if (!properties?.length) return null;

  const maxIndex = Math.max(0, properties.length - perPage);
  const index = Math.min(rawIndex, maxIndex);
  const canPrev = index > 0;
  const canNext = index < maxIndex;

  const prev = () => setIndex(Math.max(0, index - 1));
  const next = () => setIndex(Math.min(maxIndex, index + 1));

  const onLeft = ar ? next : prev;
  const onRight = ar ? prev : next;
  const disableLeft = ar ? !canNext : !canPrev;
  const disableRight = ar ? !canPrev : !canNext;

  const GAP = 16;
  const cardWidth = `calc(${100 / perPage}% - ${((perPage - 1) * GAP) / perPage}px)`;

  // مسافة التحريك = (عرض الكرت + الفجوة) × رقم الخطوة.
  // عرض الكرت بينقّص حصته من الفجوة، فلازم نرجّع نضيفها بالتحريك —
  // بدونها كل خطوة بتنقص GAP/perPage والفرق بيتراكم لحد ما آخر كرت يطلع مقصوص.
  const shiftPct = (index * 100) / perPage;
  const shiftPx = (index * GAP) / perPage;
  const translateX = ar
    ? `calc(${shiftPct}% + ${shiftPx}px)`
    : `calc(-${shiftPct}% - ${shiftPx}px)`;

  return (
    <div>
      {/* ── Header ── */}
      <div className={`flex items-center justify-between mb-5 ${ar ? "flex-row-reverse" : ""}`}>
        {title ? (
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h2>
        ) : (
          <span />
        )}

        <div className="flex gap-2">
          <button
            onClick={onLeft}
            disabled={disableLeft}
            aria-label="previous"
            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-sky-600 hover:border-sky-300 dark:hover:text-sky-400 dark:hover:border-sky-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
          >
            <LuChevronLeft size={17} />
          </button>
          <button
            onClick={onRight}
            disabled={disableRight}
            aria-label="next"
            className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:text-sky-600 hover:border-sky-300 dark:hover:text-sky-400 dark:hover:border-sky-700 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-200"
          >
            <LuChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* ── Track ── */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(${translateX})`, gap: `${GAP}px` }}
        >
          {properties.map((property) => {
            const name = ar ? property.title : (property.titleEn || property.title);
            const city = ar ? property.city : (property.cityEn || property.city);

            const imgSrc = property.images?.[0]
              ? property.images[0].startsWith("http")
                ? property.images[0]
                : `${API_URL}${property.images[0]}`
              : null;

            const isBuy = property.type === "buy";

            return (
              <div
                key={property._id}
                onClick={() => navigate(`/properties/${property._id}`)}
                style={{
                  minWidth: cardWidth,
                  maxWidth: cardWidth,
                }}
                className="group bg-white dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-600 hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-lg hover:-translate-y-1 shadow-sm transition-all duration-300 cursor-pointer flex-shrink-0"
              >
                <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-gray-600">
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                  <div className={`absolute top-2.5 flex gap-1.5 ${ar ? "left-2.5" : "right-2.5"}`}>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm ${isBuy ? "bg-sky-600" : "bg-amber-500"
                        }`}
                    >
                      {isBuy ? t("properties.sale") : t("properties.rent")}
                    </span>
                    {property.isFeatured && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500 text-white">
                        ★
                      </span>
                    )}
                  </div>
                </div>

                <div className={`p-4 ${ar ? "text-right" : "text-left"}`}>
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm leading-snug mb-1 line-clamp-1">
                    {name}
                  </h3>
                  <div
                    className={`flex items-center gap-1 text-gray-400 text-xs mb-3 ${ar ? "flex-row-reverse justify-end" : ""
                      }`}
                  >
                    <IoLocationOutline className="shrink-0" />
                    <span>{city}</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-600 mb-3" />
                  <div
                    className={`flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3 ${ar ? "flex-row-reverse" : ""
                      }`}
                  >
                    <span className="flex items-center gap-1">
                      <CiRuler className="text-sm" />
                      {property.area} {t("properties.squareMeter")}
                    </span>
                    {(property.rooms ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <LuBedSingle className="text-sm" />
                        {property.rooms}
                      </span>
                    )}
                    {(property.bathrooms ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <PiBathtub className="text-sm" />
                        {property.bathrooms}
                      </span>
                    )}
                  </div>
                  <p className="text-sky-700 dark:text-sky-400 font-bold text-base leading-none">
                    {property.price?.toLocaleString() ?? "0"}
                    <span className="text-xs font-normal text-gray-400 ms-1">
                      {t("properties.currency")}
                      {!isBuy && <> / {t("properties.month")}</>}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Dots ── */}
      {properties.length > perPage && (
        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === index
                ? "w-6 bg-sky-600"
                : "w-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-sky-300"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertySlider;