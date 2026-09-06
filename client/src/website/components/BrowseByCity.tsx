import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { LuArrowLeft, LuArrowRight } from "react-icons/lu";

const MAX_CITIES = 6;

const BrowseByCity = () => {
    const { t, i18n } = useTranslation();
    const ar = i18n.language === "ar";
    const navigate = useNavigate();

    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        let alive = true;
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/api/properties`);
                if (alive) setProperties(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error("Error fetching properties for cities:", err);
                if (alive) setProperties([]);
            } finally {
                if (alive) setLoading(false);
            }
        };
        fetchProperties();
        return () => { alive = false; };
    }, [API_URL]);

    // نبني قائمة المدن من العقارات الموجودة فعلاً، فما في مدينة بتفتح على نتيجة فاضية
    const cities = useMemo(() => {
        const map = new Map<string, { city: string; cityEn?: string; count: number }>();
        for (const p of properties) {
            const key = typeof p?.city === "string" ? p.city.trim() : "";
            if (!key) continue;
            const entry = map.get(key);
            if (entry) {
                entry.count += 1;
                if (!entry.cityEn && p.cityEn) entry.cityEn = p.cityEn;
            } else {
                map.set(key, { city: key, cityEn: p.cityEn, count: 1 });
            }
        }
        // الأكثر عقارات أولاً
        return [...map.values()].sort((a, b) => b.count - a.count).slice(0, MAX_CITIES);
    }, [properties]);

    // ما في مدن؟ ما منعرض القسم أصلاً بدل ما نترك فراغ بالصفحة
    if (!loading && cities.length === 0) return null;

    const Arrow = ar ? LuArrowLeft : LuArrowRight;

    return (
        <section
            id="browseCities"
            className="py-16 px-6 bg-white dark:bg-slate-900 transition-colors"
        >
            <div className="container mx-auto">
                {/* الرأس — بنفس نمط باقي أقسام الصفحة */}
                <div className="text-center mb-12">
                    <span className="text-sky-600 dark:text-sky-400 font-bold tracking-widest uppercase text-xs">
                        {t("browse_cities.subtitle")}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white mt-2 mb-4">
                        {t("browse_cities.title")}
                    </h2>
                    <div className="w-20 h-1.5 bg-sky-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        {t("browse_cities.description")}
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-28 rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cities.map((item) => {
                                const name = ar ? item.city : (item.cityEn || item.city);

                                return (
                                    <button
                                        key={item.city}
                                        type="button"
                                        onClick={() => navigate(`/properties?city=${encodeURIComponent(item.city)}`)}
                                        aria-label={`${name} — ${t("browse_cities.count", { count: item.count })}`}
                                        className="group relative flex items-center gap-5 overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 p-6 text-start transition-all duration-300 hover:-translate-y-1 hover:border-[#004E80]/30 dark:hover:border-sky-400/30 hover:shadow-xl hover:shadow-[#004E80]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#004E80] dark:focus-visible:ring-sky-400"
                                    >
                                        {/* أيقونة زخرفية باهتة بالخلفية */}
                                        <HiOutlineBuildingOffice2
                                            aria-hidden="true"
                                            className="absolute -bottom-5 end-2 text-8xl text-[#004E80]/5 dark:text-sky-400/5 transition-transform duration-500 group-hover:scale-110"
                                        />

                                        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-[#004E80] dark:bg-blue-900/30 dark:text-sky-400 text-2xl transition-transform duration-300 group-hover:scale-110">
                                            <HiOutlineBuildingOffice2 aria-hidden="true" />
                                        </span>

                                        <span className="relative min-w-0 flex-1">
                                            <span className="block truncate text-lg font-bold text-gray-800 dark:text-white">
                                                {name}
                                            </span>
                                            <span className="mt-1 inline-block rounded-full bg-sky-100 dark:bg-sky-900/40 px-2.5 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-400">
                                                {t("browse_cities.count", { count: item.count })}
                                            </span>
                                        </span>

                                        <Arrow
                                            aria-hidden="true"
                                            className="relative shrink-0 text-gray-300 dark:text-gray-600 transition-all duration-300 group-hover:text-[#004E80] dark:group-hover:text-sky-400 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                                        />
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-10 text-center">
                            <button
                                type="button"
                                onClick={() => navigate("/properties")}
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#004E80] px-7 py-3 font-bold text-white transition-all duration-300 hover:bg-[#003d6b] hover:shadow-lg hover:shadow-[#004E80]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#004E80] dark:focus-visible:ring-offset-slate-900"
                            >
                                {t("browse_cities.view_all")}
                                <Arrow aria-hidden="true" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default BrowseByCity;
