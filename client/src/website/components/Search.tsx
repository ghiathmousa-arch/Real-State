import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePropertyOptions } from "../../constants/property";
import { PRICE_RANGES, rangeKey, rangeLabel, parseRangeKey } from "../../constants/priceRanges";
import { RENT_PERIODS, type RentPeriod } from "../../utils/format";
import { filtersToParams } from "../../utils/propertyFilters";

// البحث بالرئيسية: [شراء | إيجار] + المدينة + الفئة + (مدة الإيجار) + نطاق السعر بالدولار.
// زر البحث بيودّي على /properties?... — الفلترة نفسها بصفحة كل العقارات (من الـ URL).
const Search = () => {
    const { t, i18n } = useTranslation();
    const ar = i18n.language === "ar";
    const navigate = useNavigate();
    const { cities, citiesEn, categories, categoriesEn } = usePropertyOptions();

    const [type, setType] = useState<"buy" | "rent">("buy");
    const [city, setCity] = useState("");
    const [category, setCategory] = useState("");
    const [rentPeriod, setRentPeriod] = useState<"" | RentPeriod>("");
    const [range, setRange] = useState("");

    // نطاقات السعر بتتغيّر حسب البيع أو مدة الإيجار — إيجار بدون مدة = السعر معطّل
    const priceMode = type === "buy" ? "buy" : rentPeriod;
    const ranges = priceMode ? PRICE_RANGES[priceMode] : [];

    const switchType = (next: "buy" | "rent") => {
        setType(next);
        setRentPeriod("");
        setRange("");
    };

    const handleSearch = () => {
        const params = filtersToParams({
            type, city, category,
            rentPeriod: type === "rent" ? rentPeriod : "",
            ...(range ? parseRangeKey(range) : {}),
        });
        navigate(`/properties?${params.toString()}`);
    };

    const selectBox = "flex items-center gap-2 bg-white dark:bg-slate-700 p-3 rounded-2xl border dark:border-slate-600";
    const selectClass = "bg-transparent text-sm w-full outline-none dark:text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50";
    const labelClass = "text-xs font-bold text-gray-700 dark:text-gray-300 px-2";

    return (
        <div className="w-full max-w-5xl p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col gap-4">

            {/* ── شراء / إيجار ── */}
            <div role="tablist" className="self-center sm:self-start inline-flex p-1 rounded-2xl bg-gray-100 dark:bg-slate-700 w-full sm:w-auto">
                {(["buy", "rent"] as const).map(opt => (
                    <button
                        key={opt}
                        role="tab"
                        aria-selected={type === opt}
                        onClick={() => switchType(opt)}
                        className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl text-base font-bold transition-all
                            ${type === opt
                                ? opt === "rent"
                                    ? "bg-amber-500 text-white shadow"
                                    : "bg-[#004E80] text-white shadow"
                                : "text-gray-600 dark:text-gray-300 hover:text-[#004E80] dark:hover:text-white"}`}
                    >
                        {t(`search.${opt}`)}
                    </button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-4">
                {/* المدينة */}
                <div className="flex flex-col gap-2 flex-1 w-full">
                    <label className={labelClass}>{t("search.location_label")}</label>
                    <div className={selectBox}>
                        <span>📍</span>
                        <select value={city} onChange={e => setCity(e.target.value)} className={selectClass}>
                            <option value="" className="dark:bg-slate-800">{t("search.placeholder")}</option>
                            {cities.map((c, i) => (
                                <option key={c} value={c} className="dark:bg-slate-800">{ar ? c : citiesEn[i] || c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* الفئة */}
                <div className="flex flex-col gap-2 flex-1 w-full">
                    <label className={labelClass}>{t("search.category_label")}</label>
                    <div className={selectBox}>
                        <span>🏠</span>
                        <select value={category} onChange={e => setCategory(e.target.value)} className={selectClass}>
                            <option value="" className="dark:bg-slate-800">{t("search.placeholder")}</option>
                            {categories.map((c, i) => (
                                <option key={c} value={c} className="dark:bg-slate-800">{ar ? c : categoriesEn[i] || c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* مدة الإيجار — بس للإيجار */}
                {type === "rent" && (
                    <div className="flex flex-col gap-2 flex-1 w-full">
                        <label className={labelClass}>{t("search.period_label")}</label>
                        <div className={selectBox}>
                            <span>📅</span>
                            <select
                                value={rentPeriod}
                                onChange={e => { setRentPeriod(e.target.value as "" | RentPeriod); setRange(""); }}
                                className={selectClass}
                            >
                                <option value="" className="dark:bg-slate-800">{t("search.placeholder")}</option>
                                {RENT_PERIODS.map(p => (
                                    <option key={p} value={p} className="dark:bg-slate-800">{t(`rentPeriods.${p}`)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* نطاق السعر */}
                <div className="flex flex-col gap-2 flex-1 w-full">
                    <label className={labelClass}>{t("search.price_label")}</label>
                    <div className={selectBox} title={!priceMode ? t("search.choose_period_first") : undefined}>
                        <span>💰</span>
                        <select
                            value={range}
                            onChange={e => setRange(e.target.value)}
                            disabled={!priceMode}
                            className={selectClass}
                        >
                            <option value="" className="dark:bg-slate-800">
                                {priceMode ? t("search.placeholder") : t("search.choose_period_first")}
                            </option>
                            {ranges.map(r => (
                                <option key={rangeKey(r)} value={rangeKey(r)} className="dark:bg-slate-800">
                                    {rangeLabel(r, t)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleSearch}
                    className="w-full md:w-auto flex justify-center items-center gap-3 text-white px-10 py-4 rounded-2xl bg-[#004E80] hover:bg-blue-700 active:scale-95 transition-all font-bold shadow-lg shadow-blue-900/20"
                >
                    <FaSearch /> {t("search.button")}
                </button>
            </div>
        </div>
    );
};

export default Search;
