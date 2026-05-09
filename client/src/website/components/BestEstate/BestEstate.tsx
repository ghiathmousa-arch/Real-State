import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

import PropertyCard from "../PropetyCards";
import type { Property } from "../../types/property";
import Pagination from "../Pagination/Pagination";

const BestEstate: React.FC = () => {
    const { t } = useTranslation();

    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const [page, setPage] = useState(1);
    const perPage = 3;

    // 🌐 Fetch data
    useEffect(() => {
        const fetchFeaturedProperties = async () => {
            try {
                setLoading(true);

                const response = await axios.get(
                    "http://localhost:5000/api/properties/featured"
                );

                // 🔥 حماية من شكل API مختلف
                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || [];

                setProperties(data);
            } catch (err) {
                console.error("Error fetching properties:", err);
                setProperties([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProperties();
    }, []);

    // 🔄 reset page لما تتغير البيانات
    useEffect(() => {
        setPage(1);
    }, [properties]);

    const totalPages = Math.ceil(properties.length / perPage);

    const currentItems = properties.slice(
        (page - 1) * perPage,
        page * perPage
    );

    // 📌 حماية من page out of range
    useEffect(() => {
        if (page > totalPages && totalPages > 0) {
            setPage(1);
        }
    }, [totalPages]);

    return (
        <section className="p-4 mt-12 dark:bg-gray-800" id="featuredProperties">

            <h1 className="text-center text-sky-400 text-2xl md:text-4xl mb-3 font-bold">
                {t("bestEstate.title")}
            </h1>

            <p className="text-center max-w-4xl mx-auto mb-8 dark:text-gray-300">
                {t("bestEstate.description")}
            </p>

            {loading ? (
                <div className="text-center py-20 text-xl">
                    {t("loading...")}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <PropertyCard key={item._id} property={item} />
                            ))
                        ) : (
                            <p className="col-span-3 text-center py-10 italic">
                                لا توجد عقارات مميزة حالياً
                            </p>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
        </section>
    );
};

export default BestEstate;