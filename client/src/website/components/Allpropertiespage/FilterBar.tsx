// شريط فلاتر صفحة كل العقارات: تبويبات (الكل / للبيع / للإيجار) بأعدادها، مدة الإيجار ومفروش
// (للإيجار بس)، المدينة، الفئة، نطاق السعر، الترتيب، وإعادة التعيين.
// كل تغيير بيروح للـ URL عن طريق update — هون ما في state للفلاتر نفسها.
// على الموبايل: البحث والتبويبات ظاهرين، وباقي الفلاتر منطوية تحت زر "فلاتر".

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuSearch, LuSlidersHorizontal } from "react-icons/lu";
import { RENT_PERIODS, type RentPeriod } from "../../../utils/format";
import { PRICE_RANGES, rangeKey, rangeLabel, parseRangeKey } from "../../../constants/priceRanges";
import { hasActiveFilters, type PropertyFilters, type ListingType, type SortOrder } from "../../../utils/propertyFilters";

interface Option { value: string; label: string }

interface Props {
  filters: PropertyFilters;
  update: (patch: Partial<PropertyFilters>) => void;
  reset: () => void;
  counts: { all: number; buy: number; rent: number };
  cities: Option[];
  categories: Option[];
}

const selectClass =
  "py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-sky-400 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto md:min-w-[140px]";

const chipClass = (active: boolean) =>
  `px-4 py-2 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${active
    ? "bg-amber-500 border-amber-500 text-white shadow"
    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-amber-400 hover:text-amber-600"}`;

const FilterBar = ({ filters, update, reset, counts, cities, categories }: Props) => {
  const { t, i18n } = useTranslation();
  const ar = i18n.language === "ar";
  const [showMore, setShowMore] = useState(false);

  const isRent = filters.type === "rent";
  // نطاقات السعر: بيع = نطاقات البيع، إيجار = نطاقات المدة المختارة، "الكل" = ما في نطاق موحّد
  const priceMode = filters.type === "buy" ? "buy" : isRent && filters.rentPeriod ? filters.rentPeriod : null;
  const ranges = priceMode ? PRICE_RANGES[priceMode] : [];
  const currentRange = filters.minPrice || filters.maxPrice ? `${filters.minPrice}-${filters.maxPrice}` : "";
  const isCustomRange = currentRange !== "" && !ranges.some(r => rangeKey(r) === currentRange);

  // تغيير التبويب أو المدة بيغيّر معنى السعر — منصفّر النطاق معهم
  const setType = (type: ListingType) =>
    update({ type, rentPeriod: "", furnished: "", minPrice: "", maxPrice: "" });
  const setPeriod = (rentPeriod: "" | RentPeriod) =>
    update({ rentPeriod, minPrice: "", maxPrice: "" });

  const tabs: { value: ListingType; label: string; count: number }[] = [
    { value: "", label: t("listing.tabs.all"), count: counts.all },
    { value: "buy", label: t("listing.tabs.buy"), count: counts.buy },
    { value: "rent", label: t("listing.tabs.rent"), count: counts.rent },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 sm:px-6 py-4 sticky top-14 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">

        {/* ── التبويبات ── */}
        <div role="tablist" className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
          {tabs.map(tab => {
            const active = filters.type === tab.value;
            const activeColor = tab.value === "rent" ? "bg-amber-500 border-amber-500" : "bg-[#004E80] border-[#004E80]";
            return (
              <button key={tab.value || "all"} role="tab" aria-selected={active} onClick={() => setType(tab.value)}
                className={`px-3 sm:px-6 py-3 rounded-2xl border-2 text-sm sm:text-base font-bold transition-all
                  ${active ? `${activeColor} text-white shadow` : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-sky-300"}`}>
                {tab.label} <span className={`text-xs sm:text-sm ${active ? "text-white/80" : "text-gray-400"}`}>({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* ── مدة الإيجار + مفروش (للإيجار بس) ── */}
        {isRent && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button onClick={() => setPeriod("")} className={chipClass(!filters.rentPeriod)}>{t("rentSection.all")}</button>
              {RENT_PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={chipClass(filters.rentPeriod === p)}>
                  {t(`rentPeriods.${p}`)}
                </button>
              ))}
            </div>
            <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-gray-700 self-start md:self-auto">
              {([["", t("listing.furnishedAll")], ["furnished", t("properties.furnished")], ["unfurnished", t("properties.unfurnished")]] as const).map(([value, label]) => (
                <button key={value || "all"} onClick={() => update({ furnished: value })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                    ${filters.furnished === value ? "bg-white dark:bg-gray-900 text-amber-600 dark:text-amber-400 shadow" : "text-gray-500 dark:text-gray-400"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── البحث + زر الفلاتر (موبايل) ── */}
        <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:items-center">
          <div className="flex gap-2 md:flex-1 md:min-w-[200px] md:max-w-xs">
            <div className="relative flex-1">
              <LuSearch className={`absolute top-1/2 -translate-y-1/2 text-gray-400 text-sm ${ar ? "right-3" : "left-3"}`} />
              <input type="text" value={filters.q} onChange={e => update({ q: e.target.value })}
                placeholder={t("listing.searchPlaceholder")}
                className={`w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-sky-400 ${ar ? "pr-8 pl-3" : "pl-8 pr-3"}`} />
            </div>
            <button onClick={() => setShowMore(s => !s)} aria-expanded={showMore}
              className="md:hidden inline-flex items-center gap-1.5 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-bold text-gray-600 dark:text-gray-300">
              <LuSlidersHorizontal size={16} /> {t("listing.filters")}
            </button>
          </div>

          {/* باقي الفلاتر — منطوية على الموبايل */}
          <div className={`${showMore ? "grid" : "hidden"} grid-cols-1 sm:grid-cols-2 gap-3 md:flex md:flex-wrap md:items-center`}>
            <select value={filters.city} onChange={e => update({ city: e.target.value })} className={selectClass} aria-label={t("listing.city")}>
              <option value="">{t("listing.allCities")}</option>
              {cities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <select value={filters.category} onChange={e => update({ category: e.target.value })} className={selectClass} aria-label={t("listing.category")}>
              <option value="">{t("listing.allCategories")}</option>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            {filters.type !== "" && (
              <select
                value={currentRange}
                onChange={e => update(e.target.value ? parseRangeKey(e.target.value) : { minPrice: "", maxPrice: "" })}
                disabled={!priceMode}
                className={selectClass}
                aria-label={t("search.price_label")}
                title={!priceMode ? t("search.choose_period_first") : undefined}
              >
                <option value="">{priceMode ? t("listing.anyPrice") : t("search.choose_period_first")}</option>
                {isCustomRange && <option value={currentRange}>{`$${filters.minPrice || 0} – ${filters.maxPrice ? `$${filters.maxPrice}` : "∞"}`}</option>}
                {ranges.map(r => <option key={rangeKey(r)} value={rangeKey(r)}>{rangeLabel(r, t)}</option>)}
              </select>
            )}

            <select value={filters.sort} onChange={e => update({ sort: e.target.value as SortOrder })} className={selectClass} aria-label={t("listing.sort")}>
              <option value="newest">{t("listing.sortNewest")}</option>
              <option value="price_asc">{t("listing.sortPriceAsc")}</option>
              <option value="price_desc">{t("listing.sortPriceDesc")}</option>
            </select>

            {hasActiveFilters(filters) && (
              <button onClick={reset}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                {t("listing.reset")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
