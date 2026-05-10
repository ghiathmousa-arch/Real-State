import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // ✅
import { IoLocationOutline } from "react-icons/io5";
import { LuBedSingle, LuArrowLeft, LuArrowRight, LuSearch } from "react-icons/lu";
import { CiRuler } from "react-icons/ci";
import { PiBathtub } from "react-icons/pi";
import PropertySlider from "../Propertyslider/Propertyslider";


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
  const navigate = useNavigate(); // ✅

  const [allProperties, setAllProperties] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]); // ✅ للسلايدر
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [typeFilter, setType] = useState("");
  const [cityFilter, setCity] = useState("");

  // ── جلب البيانات ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/properties");
        const data = Array.isArray(res.data) ? res.data : [];
        setAllProperties(data);
        setFiltered(data);

        // ✅ مميزة للسلايدر في الأسفل
        setFeatured(data.filter((p: any) => p.isFeatured));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── فلترة محلية ──
  useEffect(() => {
    let result = [...allProperties];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.titleEn?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.cityEn?.toLowerCase().includes(q)
      );
    }
    if (typeFilter) result = result.filter(p => p.type === typeFilter);
    if (cityFilter) result = result.filter(p => p.city === cityFilter || p.cityEn === cityFilter);
    setFiltered(result);
    setPage(1);
  }, [search, typeFilter, cityFilter, allProperties]);

  const cities = [...new Set(allProperties.map(p => p.city).filter(Boolean))];

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const currentItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${ar ? "text-right" : "text-left"}`}>

      {/* ── Hero ── */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-2">
            {t("properties.allEstates")}
            <span className="ms-3 text-base font-semibold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
              {filtered.length}
            </span>
          </h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            {ar ? "تصفح جميع العقارات المتاحة وابحث عن ما يناسبك" : "Browse all available properties and find what suits you"}
          </p>
        </div>
      </div>

      {/* ── فلاتر sticky ── */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 sticky top-0 z-10">
        <div className={`max-w-7xl mx-auto flex flex-wrap gap-3 items-center ${ar ? "flex-row-reverse" : ""}`}>
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <LuSearch className={`absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm ${ar ? "right-3" : "left-3"}`} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={ar ? "ابحث عن عقار..." : "Search properties..."}
              className={`w-full py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-sky-400 ${ar ? "pr-8 pl-3" : "pl-8 pr-3"}`} />
          </div>
          <select value={typeFilter} onChange={e => setType(e.target.value)}
            className="py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-sky-400 min-w-[120px]">
            <option value="">{ar ? "الكل" : "All Types"}</option>
            <option value="buy">{ar ? "للبيع" : "For Sale"}</option>
            <option value="rent">{ar ? "للإيجار" : "For Rent"}</option>
          </select>
          <select value={cityFilter} onChange={e => setCity(e.target.value)}
            className="py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-sky-400 min-w-[120px]">
            <option value="">{ar ? "كل المدن" : "All Cities"}</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(search || typeFilter || cityFilter) && (
            <button onClick={() => { setSearch(""); setType(""); setCity(""); }}
              className="px-4 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              {ar ? "إعادة تعيين" : "Reset"}
            </button>
          )}
        </div>
      </div>

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
                const title = ar ? property.title : (property.titleEn || property.title);
                const city = ar ? property.city : (property.cityEn || property.city);
                const imgSrc = property.images?.length > 0
                  ? `http://localhost:5000${property.images[0]}`
                  : "https://placehold.co/400x280/e2e8f0/94a3b8?text=No+Image";
                const isBuy = property.type === "buy";

                return (
                  <div key={property._id}
                    onClick={() => navigate(`/properties/${property._id}`)} // ✅
                    className="group bg-white dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-600 hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-xl hover:-translate-y-1 shadow-sm transition-all duration-300 cursor-pointer">
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-600">
                      <img src={imgSrc} alt={title} loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <div className={`absolute top-3 flex gap-1.5 ${ar ? "left-3" : "right-3"}`}>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white shadow-sm ${isBuy ? "bg-sky-600" : "bg-amber-500"}`}>
                          {isBuy ? t("properties.sale") : t("properties.rent")}
                        </span>
                        {property.isFeatured && (
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500 text-white shadow-sm">★</span>
                        )}
                      </div>
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
                      <p className="text-sky-700 dark:text-sky-400 font-bold text-lg leading-none">
                        {property.price?.toLocaleString() ?? "0"}
                        <span className="text-xs font-normal text-gray-400 ms-1">
                          {t("properties.currency")}{!isBuy && <> / {t("properties.month")}</>}
                        </span>
                      </p>
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
            <p className="text-lg">{t("properties.noPropertiesFound")}</p>
          </div>
        )}
      </div>

      {/* ════════════════════════════════
                سلايدر العقارات المميزة ✅
            ════════════════════════════════ */}
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