import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { LuBedSingle, LuArrowLeft, LuArrowRight } from "react-icons/lu";
import { CiRuler } from "react-icons/ci";
import { PiBathtub } from "react-icons/pi";
import PropertySlider from "../Propertyslider/Propertyslider";
import { cdn } from "../../../utils/format";
import { api, API_BASE } from "../../../utils/api";
import { localized } from "../../../utils/helper";
import PriceTag from "../PriceTag/PriceTag";
import ListingBadges from "../PriceTag/ListingBadges";
import { applyFilters, sortProperties, hasActiveFilters } from "../../../utils/propertyFilters";
import { useUrlFilters } from "../../hooks/useUrlFilters";
import FilterBar from "./FilterBar";
import SEO from "../SEO/SEO";

const PER_PAGE = 12;


// ── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({
  currentPage, totalPages, onPageChange, ar,
}: {
  currentPage: number; totalPages: number;
  onPageChange: (p: number) => void; ar: boolean;
}) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    const pages: (number | "…")[] = [];
    if (left > 1) { pages.push(1); if (left > 2) pages.push("…"); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push("…"); pages.push(totalPages); }
    return pages;
  };

  const Prev = ar ? LuArrowRight : LuArrowLeft;
  const Next = ar ? LuArrowLeft : LuArrowRight;

  return (
    <div className="flex items-center justify-center gap-2 mt-12 select-none">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
        <Prev size={15} /> {ar ? "السابق" : "Prev"}
      </button>
      <div className="flex items-center gap-1">
        {getPages().map((p, i) =>
          p === "…" ? (
            <span key={`d${i}`} className="w-8 text-center text-gray-400 text-sm">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p as number)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200
                ${p === currentPage ? "bg-sky-600 text-white shadow-md" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
              {p}
            </button>
          )
        )}
      </div>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
        {ar ? "التالي" : "Next"} <Next size={15} />
      </button>
    </div>
  );
};

// ── AllPropertiesPage ─────────────────────────────────────────────────────────
const AllPropertiesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const ar = i18n.language === "ar";
  const navigate = useNavigate();
  // كل الفلاتر من الـ URL (type, rentPeriod, furnished, city, category, minPrice, maxPrice, q, sort)
  const { filters, update, reset } = useUrlFilters();

  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);


  // ── جلب البيانات ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/properties");
        const data = Array.isArray(res.data) ? res.data : [];
        setAllProperties(data);
        setFeatured(data.filter((p: any) => p.isFeatured));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── فلترة محلية ── محسوبة أثناء الـ render (بدل useState+useEffect) بدل ما نعمل render إضافي بلا داعي
  // الترتيب قبل تقسيم الصفحات، حتى يكون ترتيب شامل مش داخل كل صفحة لحالها
  const filtered = useMemo(
    () => sortProperties(
      applyFilters(allProperties, filters),
      filters.sort,
      filters.type === "rent" ? filters.rentPeriod : ""
    ),
    [filters, allProperties]
  );

  // إعادة الصفحة للأولى عند تغيّر الفلتر — side-effect حقيقي، لازم يضل بـ useEffect منفصل
  useEffect(() => {
    setPage(1);
  }, [filters, allProperties]);

  // أعداد التبويبات (الكل / للبيع / للإيجار) حسب باقي الفلاتر
  const counts = useMemo(() => {
    const base = applyFilters(allProperties, filters, true);
    return {
      all: base.length,
      buy: base.filter(p => p.type === "buy").length,
      rent: base.filter(p => p.type === "rent").length,
    };
  }, [allProperties, filters]);

  // خيارات المدينة والفئة من العقارات الموجودة — القيمة بالعربي (متل الـ URL)، والعرض حسب اللغة
  const optionsFrom = (field: "city" | "category") => {
    const map = new Map<string, string>();
    allProperties.forEach(p => {
      if (p[field] && !map.has(p[field])) map.set(p[field], localized(p, field, ar));
    });
    return [...map].map(([value, label]) => ({ value, label }));
  };
  const cities = useMemo(() => optionsFrom("city"), [allProperties, ar]);
  const categories = useMemo(() => optionsFrom("category"), [allProperties, ar]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const currentItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen pt-16 pb-8 sm:px-8 bg-gray-50 dark:bg-gray-900 ${ar ? "text-right" : "text-left"}`}>
      {/* عنوان ووصف خاصين لكل تبويب — صفحة الإيجار بالذات بتستهدف "عقارات للإيجار في سوريا" */}
      <SEO
        title={filters.type === "rent" ? t("seo.rentTitle") : filters.type === "buy" ? t("seo.buyTitle") : t("seo.allTitle")}
        description={filters.type === "rent" ? t("seo.rentDescription") : filters.type === "buy" ? t("seo.buyDescription") : undefined}
      />

      {/* ── Hero ── */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-2">
            {filters.type === "rent" ? t("listing.rentTitle") : filters.type === "buy" ? t("listing.buyTitle") : t("properties.allEstates")}
            <span className="ms-3 text-base font-semibold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
              {filtered.length}
            </span>
          </h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {filters.type === "rent" ? t("listing.rentSubtitle") : t("listing.subtitle")}
          </p>
        </div>
      </div>

      {/* ── فلاتر (sticky تحت النافبار) ── */}
      <FilterBar filters={filters} update={update} reset={reset} counts={counts} cities={cities} categories={categories} />

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse h-72" />
            ))}
          </div>
        ) : currentItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {currentItems.map(property => {
                const title = localized(property, "title", ar);
                const city = localized(property, "city", ar);

                // ✅ التصحيح: نتحقق إذا كان الرابط Cloudinary (http) نأخذه مباشرة
                // وإذا كان رابط محلي (/uploads/...) ندمجه مع API_BASE (جذر السيرفر)
                const firstImg = property.images?.[0];
                const imgSrc = firstImg
                  ? cdn(firstImg.startsWith("http") ? firstImg : `${API_BASE}${firstImg}`)
                  : null;

                return (
                  <div key={property._id}
                    onClick={() => navigate(`/properties/${property._id}`)}
                    className="group bg-white dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-600 hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-xl hover:-translate-y-1 shadow-sm transition-all duration-300 cursor-pointer">
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-600">
                      {imgSrc && (
                        <img src={imgSrc} alt={title} loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <ListingBadges property={property} className={`absolute top-3 ${ar ? "left-3" : "right-3"} max-w-[85%]`} />
                    </div>
                    <div className={`p-4 ${ar ? "text-right" : "text-left"}`}>
                      <h3 className="font-bold text-gray-800 dark:text-white text-base leading-snug mb-1 line-clamp-1">{title}</h3>
                      <div className={`flex items-center gap-1 text-gray-400 text-xs mb-3 ${ar ? "flex-row-reverse justify-end" : ""}`}>
                        <IoLocationOutline className="shrink-0" /><span>{city}</span>
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-600 mb-3" />
                      <div className={`flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4 ${ar ? "flex-row-reverse" : ""}`}>
                        <span className="flex items-center gap-1"><CiRuler className="text-sm" />{property.area} {t("properties.squareMeter")}</span>
                        {(property.rooms ?? 0) > 0 && <span className="flex items-center gap-1"><LuBedSingle className="text-sm" />{property.rooms}</span>}
                        {(property.bathrooms ?? 0) > 0 && <span className="flex items-center gap-1"><PiBathtub className="text-sm" />{property.bathrooms}</span>}
                      </div>
                      <PriceTag property={property} size="md" />
                    </div>
                  </div>
                );
              })}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} ar={ar} />
          </>
        ) : (
          <div className="text-center py-24 text-gray-400 dark:text-gray-500">
            <p className="text-5xl mb-4">🏠</p>
            <p className="text-lg font-bold text-gray-500 dark:text-gray-400">
              {hasActiveFilters(filters) ? t("listing.emptyFiltered") : t("properties.noPropertiesFound")}
            </p>
            {hasActiveFilters(filters) && (
              <button onClick={reset}
                className="mt-6 px-6 py-3 rounded-2xl bg-[#004E80] hover:bg-sky-700 text-white font-bold transition">
                {t("listing.reset")}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── سلايدر العقارات المميزة ── */}
      {featured.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <PropertySlider
              properties={featured}
              title={ar ? "⭐ العقارات المميزة" : "⭐ Featured Properties"}
              perPage={3}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPropertiesPage;