import React from "react";

// 🌍 i18n
import { useTranslation } from "react-i18next";

/**
 * 📦 Props الخاصة بالـ Pagination
 */
interface PaginationProps {

    // 📄 الصفحة الحالية
    currentPage: number;

    // 📚 عدد الصفحات الكامل
    totalPages: number;

    // 🔄 تغيير الصفحة
    onPageChange: (page: number) => void;
}

/**
 * 🔢 Pagination Component
 */
const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {

    // 🌍 Hook الترجمة
    const { t } = useTranslation();

    /**
     * 🔢 إنشاء أرقام الصفحات
     */
    const generatePagination = () => {

        const pages: (number | string)[] = [];

        // 📌 أول صفحة تبدأ من الحالية
        const startPage = currentPage;

        // 📌 آخر 3 صفحات
        const endPage = Math.min(
            currentPage + 1,
            totalPages
        );

        // 🔢 إضافة الصفحات
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // 📌 إضافة ...
        if (endPage < totalPages - 1) {
            pages.push("...");
        }

        // 📌 إضافة آخر صفحة
        if (endPage < totalPages) {
            pages.push(totalPages);
        }

        return pages;
    };

    // 🚫 إذا صفحة وحدة لا تعرض pagination
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div dir="ltr"
            className="flex justify-center items-center gap-2 mt-6 flex-wrap">

            {/* ⬅️ Prev */}
            <button
                onClick={() =>
                    onPageChange(
                        Math.max(currentPage - 1, 1)
                    )
                }

                disabled={currentPage === 1}

                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t("bestEstate.prev")}
            </button>

            {/* 🔢 Page Numbers */}
            {generatePagination().map((item, index) => (

                item === "..." ? (

                    <span
                        key={index}
                        className="px-2 text-gray-500"
                    >
                        ...
                    </span>

                ) : (

                    <button
                        key={index}

                        onClick={() =>
                            onPageChange(item as number)
                        }

                        className={`px-3 py-1 rounded transition ${currentPage === item
                            ? "bg-sky-600 text-white"
                            : "bg-gray-400 text-black"
                            }`}
                    >
                        {item}
                    </button>
                )
            ))}

            {/* ➡️ Next */}
            <button
                onClick={() =>
                    onPageChange(
                        Math.min(
                            currentPage + 1,
                            totalPages
                        )
                    )
                }

                disabled={currentPage === totalPages}

                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {t("bestEstate.next")}
            </button>
        </div>
    );
};

export default Pagination;