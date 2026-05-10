import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Property } from "../types/property";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const PropetyCards: React.FC<{ property: Property }> = ({ property }) => {
    const { i18n } = useTranslation();
    const isEn = i18n.language === "en";

    const displayTitle = isEn ? property.titleEn : property.title;
    const displayDesc = isEn ? property.descriptionEn : property.description;
    const displayCity = isEn ? property.cityEn : property.city;
    const displayCategory = isEn ? property.categoryEn : property.category;

    // 🔥 حماية features
    const rawFeatures = isEn ? property.featuresEn : property.features;

    const displayFeatures = Array.isArray(rawFeatures) ? rawFeatures : [];

    // 🖼️ الصور
    const images =
        property.images?.length > 0
            ? property.images.map((img) =>
                img.startsWith("http") ? img : `${API_BASE_URL}${img}`
            )
            : ["https://via.placeholder.com/400x300?text=No+Image"];

    const [current, setCurrent] = useState(0);

    return (
        <div className="border rounded-xl overflow-hidden shadow-md bg-white dark:bg-brightness-125 dark:border-gray-600 transition duration-300 hover:shadow-lg">

            {/* 📸 Images */}
            <div className="relative w-full h-48 overflow-hidden bg-gray-200">
                <img
                    src={images[current]}
                    className="w-full h-48 object-cover"
                    alt={displayTitle}
                />

                {images.length > 1 && (
                    <div className="absolute inset-0 flex justify-between items-center px-2">
                        <button
                            onClick={() =>
                                setCurrent((prev) =>
                                    (prev - 1 + images.length) % images.length
                                )
                            }
                            className="bg-black/40 text-white w-8 h-8 rounded-full hover:bg-black/70"
                        >
                            ‹
                        </button>

                        <button
                            onClick={() =>
                                setCurrent((prev) => (prev + 1) % images.length)
                            }
                            className="bg-black/40 text-white w-8 h-8 rounded-full hover:bg-black/70"
                        >
                            ›
                        </button>
                    </div>
                )}
            </div>

            {/* 📝 Details */}
            <div className="p-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1 dark:text-gray-300">
                    <span className="font-medium">{displayCategory}</span>
                    <span>{displayCity}</span>
                </div>

                <h2 className="text-lg font-bold mb-2 truncate">
                    {displayTitle}
                </h2>

                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3 h-10">
                    {displayDesc}
                </p>

                {/* Features */}
                <ul className="flex flex-wrap gap-2 mb-4 h-14 overflow-hidden">
                    {displayFeatures.slice(0, 3).map((f, i) => (
                        <li
                            key={i}
                            className="bg-sky-50 dark:bg-gray-800 text-sky-700 dark:text-sky-300 text-[10px] px-2 py-1 rounded-md border"
                        >
                            {f}
                        </li>
                    ))}
                </ul>

                {/* Price */}
                <div className="flex items-center justify-between border-t pt-3 dark:border-gray-600">
                    <span className="text-xl font-bold text-sky-600">
                        {property.price.toLocaleString()} $
                    </span>
                    <span className="text-xs text-gray-400 italic">
                        {property.area} m²
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PropetyCards;