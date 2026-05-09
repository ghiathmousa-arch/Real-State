import React, { useState, useEffect } from "react";
import axios from "axios";
import { LuArrowBigRightDash } from "react-icons/lu";

// 🌍 i18n
import { useTranslation } from "react-i18next";

// 🎨 Icons
import { IoLocationOutline } from "react-icons/io5";
import { LuBedSingle } from "react-icons/lu";
import { CiRuler } from "react-icons/ci";

/**
 * 📦 نوع بيانات العقار
 */
interface Property {
    _id: string;
    title: string;
    city: string;
    price: number;
    area: number;
    rooms: number;
    type: "sale" | "rent";
    image: string;
}

/**
 * 🏠 Component عرض العقارات الديناميكي
 */
const PropertiesList: React.FC = () => {
    // 🌍 Hook الترجمة
    const { t } = useTranslation();

    // 🏗️ State لتخزين البيانات
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // 🚀 جلب البيانات من الـ API
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:5000/api/properties");

                // التأكد من أن البيانات مصفوفة
                const data = Array.isArray(response.data) ? response.data : response.data.properties;
                setProperties(data || []);
            } catch (err) {
                console.error("Error fetching properties:", err);
                setError(t("common.errorLoading")); // تأكد من وجود مفتاح ترجمة للخطأ
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, [t]);

    // ⏳ حالة التحميل
    if (loading) {
        return (
            <div className="py-20 text-center text-sky-700 font-bold">
                {t("properties.loading")}...
            </div>
        );
    }

    // ❌ حالة الخطأ
    if (error) {
        return (
            <div className="py-20 text-center text-red-500 font-bold">
                {error}
            </div>
        );
    }

    return (
        <section
            id="PropertiesList"
            className="py-10 px-6 dark:bg-gray-800"
        >
            {/* 🔹 Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-sky-700 border-b-2 md:border-b-4 border-sky-700 pb-1 text-center sm:text-left">
                    {t("properties.allEstates")}
                </h1>

                <button className="flex items-center gap-1 text-sm sm:text-base md:text-lg text-sky-600 hover:underline border rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-100 transition">
                    {t("properties.showAllResults")} <LuArrowBigRightDash />
                </button>
            </div>

            {/* 🔹 Grid العقارات */}
            {properties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {properties.map((property) => (
                        <div
                            key={property._id}
                            className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                        >
                            {/* 🖼️ صورة العقار */}
                            <div className="relative">
                                <img
                                    src={property.image}
                                    alt={property.title}
                                    className="w-full h-48 object-cover"
                                />
                                <span className="absolute top-2 right-2 bg-sky-600 text-white text-xs px-2 py-1 rounded">
                                    {property.type === "sale"
                                        ? t("properties.sale")
                                        : t("properties.rent")}
                                </span>
                            </div>

                            {/* 📄 معلومات العقار */}
                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-white">
                                    {property.title}
                                </h3>

                                <div className="flex items-center text-gray-500 dark:text-gray-300 text-sm mb-3 gap-1">
                                    <IoLocationOutline />
                                    <span>{property.city}</span>
                                </div>

                                <hr className="mb-3 dark:border-gray-600" />

                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    <div className="flex items-center gap-1">
                                        <CiRuler />
                                        <span>
                                            {property.area} {t("properties.squareMeter")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <LuBedSingle />
                                        <span>{property.rooms}</span>
                                    </div>
                                </div>

                                <div className="text-sky-700 font-bold text-lg">
                                    {property.price.toLocaleString()} {t("properties.currency")}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    {t("properties.noPropertiesFound")}
                </div>
            )}
        </section>
    );
};

export default PropertiesList;