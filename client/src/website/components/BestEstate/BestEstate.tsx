import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import PropertyCard from "../PropetyCards";
const BestEstate: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedProperties = async () => {
            try {
                setLoading(true);
                const response = await axios.get("http://localhost:5000/api/properties/featured");
                setProperties(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error fetching featured properties:", err);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedProperties();
    }, []);

    return (
        <section className="py-16 px-6 bg-gray-50 dark:bg-gray-900/50" id="featuredProperties">
            <div className="container mx-auto">
                {/* الرأس */}
                <div className="text-center mb-12">
                    <span className="text-sky-600 dark:text-sky-400 font-bold tracking-widest uppercase text-xs">
                        {t("bestEstate.subtitle") || "Premium Selection"}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white mt-2 mb-4">
                        {t("bestEstate.title")}
                    </h2>
                    <div className="w-20 h-1.5 bg-sky-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        {t("bestEstate.description")}
                    </p>
                </div>

                {/* الحالة: تحميل */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-[450px] bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl" />
                        ))}
                    </div>
                ) : (
                    <>
                        {/* عرض أول 3 عقارات فقط بدون ترقيم */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {properties.slice(0, 3).map((item: any) => (
                                <PropertyCard key={item._id} property={item} />
                            ))}
                        </div>

                        {/* رسالة في حال عدم وجود عقارات */}
                        {properties.length === 0 && (
                            <div className="text-center py-20 text-gray-400 font-bold">
                                {i18n.language === "ar" ? "لا توجد عقارات مميزة حالياً" : "No featured properties found"}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default BestEstate;