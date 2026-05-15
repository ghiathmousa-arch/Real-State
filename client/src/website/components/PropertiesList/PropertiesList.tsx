import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { LuBedSingle, LuArrowLeft, LuArrowRight, LuArrowUpRight } from "react-icons/lu";
import { CiRuler } from "react-icons/ci";
import { PiBathtub } from "react-icons/pi";

const PER_PAGE = 8;

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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 dark:hover:bg-sky-900/20 dark:hover:border-sky-700 dark:hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                <Prev size={15} /> {ar ? "السابق" : "Prev"}
            </button>
            <div className="flex items-center gap-1">
                {getPages().map((p, i) =>
                    p === "…" ? (
                        <span key={`dot-${i}`} className="w-8 text-center text-gray-400 text-sm">…</span>
                    ) : (
                        <button key={p} onClick={() => onPageChange(p as number)}
                            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all duration-200
                                ${p === currentPage ? "bg-sky-600 text-white shadow-md shadow-sky-200 dark:shadow-sky-900" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                            {p}
                        </button>
                    )
                )}
            </div>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 dark:hover:bg-sky-900/20 dark:hover:border-sky-700 dark:hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                {ar ? "التالي" : "Next"} <Next size={15} />
            </button>
        </div>
    );
};

// ── PropertiesList ────────────────────────────────────────────────────────────
const PropertiesList: React.FC = () => {
    const { t, i18n } = useTranslation();
    const ar = i18n.language === "ar";
    const navigate = useNavigate();

    // 💠 التعديل 1: تعريف رابط الـ API من متغيرات البيئة
    const API_URL = import.meta.env.VITE_API_URL;

    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                // 💠 التعديل 2: استخدام API_URL بدلاً من localhost
                const response = await axios.get(`${API_URL}/api/properties`);
                setProperties(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error fetching:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, [API_URL]); // إضافة API_URL كمُعتمد لـ useEffect

    useEffect(() => { setPage(1); }, [i18n.language]);

    const totalPages = Math.ceil(properties.length / PER_PAGE);
    const currentItems = properties.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    const handlePageChange = (p: number) => {
        setPage(p);
        document.getElementById("PropertiesList")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (loading) {
        return (
            <section className="py-14 px-6 dark:bg-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
                    {Array.from({ length: PER_PAGE }).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-700 animate-pulse h-72" />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section id="PropertiesList" className="py-14 px-6 dark:bg-gray-800">
            {/* ... الهيدر يبقى كما هو ... */}
            <div className={`flex items-end justify-between mb-10 gap-4 flex-wrap ${ar ? "flex-row-reverse" : ""}`}>
                <div className={ar ? "text-right" : "text-left"}>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-sky-600 dark:text-sky-400 uppercase mb-2">
                        <span className="w-5 h-px bg-sky-500 inline-block" />
                        {ar ? "استكشف" : "Explore"}
                        <span className="w-5 h-px bg-sky-500 inline-block" />
                    </span>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white leading-tight">
                        {t("properties.allEstates")}
                        <span className="ms-3 align-middle text-sm font-semibold px-2.5 py-1 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
                            {properties.length}
                        </span>
                    </h1>
                    <div className={`mt-3 h-1 w-16 rounded-full bg-sky-600 ${ar ? "ms-auto" : ""}`} />
                </div>

                <Link to="/properties"
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold border-2 border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white dark:border-sky-500 dark:text-sky-400 dark:hover:bg-sky-600 dark:hover:text-white transition-all duration-300">
                    {t("properties.showAllResults")}
                    <LuArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </Link>
            </div>

            {/* ── Grid ── */}
            {currentItems.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {currentItems.map((property) => {
                            const title = ar ? property.title : (property.titleEn || property.title);
                            const city = ar ? property.city : (property.cityEn || property.city);

                            // 💠 التعديل 3: استخدام API_URL لجلب الصور من السيرفر
                            const imgSrc = property.images?.length > 0
                                ? `${API_URL}${property.images[0]}`
                                : "https://placehold.co/400x280/e2e8f0/94a3b8?text=No+Image";

                            const isBuy = property.type === "buy";

                            return (
                                <div
                                    key={property._id}
                                    onClick={() => navigate(`/properties/${property._id}`)}
                                    className="group bg-white dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-600 hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-xl hover:-translate-y-1 shadow-sm transition-all duration-300 cursor-pointer"
                                >
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
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                    {t("properties.noPropertiesFound")}
                </div>
            )}
        </section>
    );
};

export default PropertiesList;