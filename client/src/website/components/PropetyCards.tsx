import React, { useState } from "react";

// 🧠 نوع البيانات الخاص بالعقار (نضع هنا لاستخدامه في الملفات الأخرى)
export interface Property {
    _id: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    category: string;
    categoryEn: string;
    city: string;
    cityEn: string;
    price: number;
    area: number;
    rooms: number;
    features: string[];
    featuresEn: string[];
    images: string[];
}

const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
    const images = property.images?.length ? property.images : ["/fallback.jpg"];
    const [current, setCurrent] = useState(0);


    const prevImage = () => setCurrent((prev) => (prev - 1 + images.length) % images.length);
    const nextImage = () => setCurrent((prev) => (prev + 1) % images.length);

    return (
        <div className="border rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-700 dark:border-gray-400">
            <div className="relative w-full h-48 overflow-hidden">
                <img src={images[current]} className="w-full h-48 object-cover transition-all duration-500" alt="property" />
                
                {/* أسهم التنقل */}
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded hover:bg-black/80 transition">‹</button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded hover:bg-black/80 transition">›</button>
                
                {/* نقاط الدليل (Dots) مع تلوين النقطة النشطة */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                        <div 
                            key={i} 
                            onClick={() => setCurrent(i)} 
                            className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                                i === current ? "bg-white scale-110" : "bg-white/50 hover:bg-white/75 "
                            }`} 
                        />
                    ))}
                </div>
            </div>
            
            <div className="p-4">
                <div className="flex justify-between text-sm text-gray-500 mb-1 dark:text-white">
                    <span>{property.category}</span>
                    <span>{property.city}</span>
                </div>
                <h2 className="text-lg font-bold mb-2 ">{property.title}</h2>
                <p className="text-gray-600 dark:text-white text-sm line-clamp-2 mb-3">{property.description}</p>
                <ul className="flex flex-wrap gap-2 mb-3">
                    {property.features.map((f, i) => (
                        <li key={i} className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded">{f}</li>
                    ))}
                </ul>
                <div className="text-xl font-bold text-sky-600">{property.price.toLocaleString()} $</div>
            </div>
        </div>
    );
};

export default PropertyCard;