import React, { useState } from "react";

// 🌍 i18n
import { useTranslation } from "react-i18next";

// 🏠 Property Card
import PropertyCard from "../PropetyCards";

// 📦 نوع العقار
import type { Property } from "../PropetyCards";
import Pagination from "../Pagination/Pagination";

/**
 * 📦 Props الخاصة بالمكون
 */
interface BestEstateProps {
    properties: Property[];
}

/**
 * 🏠 Best Estate Component
 */
const BestEstate: React.FC<BestEstateProps> = ({
    properties,
}) => {

    // 🌍 Hook الترجمة
    const { t } = useTranslation();

    // 📄 الصفحة الحالية
    const [page, setPage] = useState(1);

    // 📦 عدد العناصر بكل صفحة
    const perPage = 3;

    // 📍 بداية العناصر الحالية
    const start = (page - 1) * perPage;

    // 🏠 العقارات الحالية
    const currentItems = properties.slice(
        start,
        start + perPage
    );

    // 📄 عدد الصفحات الكامل
    const totalPages = Math.ceil(
        properties.length / perPage
    );
    /* ********************** */

    return (
        <section
            className="p-4 mt-12 dark:bg-gray-800 dark:text-white dark:border-gray-400"
            id="featuredProperties"
        >

            {/* 🔹 Title */}
            <h1 className="place-self-center text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-3 text-center text-sky-400">

                <b>{t("bestEstate.title")}</b>
            </h1>

            {/* 🔹 Description */}
            <p className="place-self-center text-sm sm:text-base md:text-lg lg:text-xl mb-6 text-center max-w-4xl mx-auto">

                {t("bestEstate.description")}
            </p>

            {/* 🔹 Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {currentItems.map((property) => (

                    <PropertyCard
                        key={property._id}
                        property={property}
                    />
                ))}
            </div>

            {/* 🔹 Pagination */}
            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage} />
        </section>
    );
};

export default BestEstate;