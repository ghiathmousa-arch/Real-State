// قسم "عقارات للإيجار" بالرئيسية — بعد "عقارات مختارة بعناية".
// chips للمدة (الكل · يومي · أسبوعي · شهري · سنوي) بتفلتر محلياً، وسلايدر لآخر 10 عقارات إيجار
// (يلي إلها صور أول). إذا ما في ولا عقار إيجار نشط، القسم ما بينعرض أبداً.

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LuArrowUpRight } from "react-icons/lu";
import SectionHead from "../SectionHead";
import PropertySlider from "../Propertyslider/Propertyslider";
import { api } from "../../../utils/api";
import { RENT_PERIODS, withImagesFirst, type RentPeriod } from "../../../utils/format";

const MAX_ITEMS = 10;

const RentSection = () => {
    const { t } = useTranslation();
    const [rentals, setRentals] = useState<any[]>([]);
    const [period, setPeriod] = useState<"" | RentPeriod>("");

    useEffect(() => {
        // القائمة العامة بترجّع النشط بس
        api.get("/properties", { params: { type: "rent" } })
            .then(res => setRentals(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Error fetching rentals:", err));
    }, []);

    // المدد اللي إلها عقارات بس — الـ chip الفاضي ما بيطلع
    const availablePeriods = useMemo(
        () => RENT_PERIODS.filter(p => rentals.some(r => r.rentPrices?.[p] != null)),
        [rentals]
    );

    const shown = useMemo(() => {
        const list = period ? rentals.filter(r => r.rentPrices?.[period] != null) : rentals;
        return withImagesFirst(list).slice(0, MAX_ITEMS);
    }, [rentals, period]);

    if (rentals.length === 0) return null;

    const allLink = `/properties?type=rent${period ? `&rentPeriod=${period}` : ""}`;

    const chip = (value: "" | RentPeriod, label: string) => (
        <button
            key={value || "all"}
            onClick={() => setPeriod(value)}
            aria-pressed={period === value}
            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all
                ${period === value
                    ? "bg-amber-500 border-amber-500 text-white shadow"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-amber-400 hover:text-amber-600"}`}
        >
            {label}
        </button>
    );

    return (
        <section id="rentProperties" className="py-16 px-6 bg-white dark:bg-gray-900">
            <div className="container mx-auto">
                <SectionHead title={t("rentSection.title")} subTitle={t("rentSection.subtitle")} variant="section" />

                <div className="flex flex-wrap items-center justify-between gap-4 mt-8 mb-6">
                    <div className="flex flex-wrap gap-2">
                        {chip("", t("rentSection.all"))}
                        {availablePeriods.map(p => chip(p, t(`rentPeriods.${p}`)))}
                    </div>

                    <Link to={allLink}
                        className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white dark:text-amber-400 dark:hover:text-white transition-all duration-300">
                        {t("rentSection.viewAll")}
                        <LuArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                    </Link>
                </div>

                <PropertySlider properties={shown} perPage={3} />
            </div>
        </section>
    );
};

export default RentSection;
