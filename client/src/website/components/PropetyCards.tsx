import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { LuBedSingle, LuBath, LuArrowUpLeft, LuArrowUpRight } from "react-icons/lu";
import { CiRuler } from "react-icons/ci";
import { cdn } from "../../utils/format";

// 💠 التعديل 1: استخدام رابط الـ API من متغيرات البيئة بدلاً من localhost الثابت
const API_BASE_URL = import.meta.env.VITE_API_URL;

const PropertyCard: React.FC<{ property: any }> = ({ property }) => {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const isAr = i18n.language === "ar";

    // جلب البيانات بناءً على اللغة المفعلة
    const title = isAr ? property.title : property.titleEn;
    const description = isAr ? property.description : property.descriptionEn;
    const city = isAr ? property.city : property.cityEn;
    const category = isAr ? property.category : property.categoryEn;

    // نصوص ثابتة بسيطة
    const labels = {
        rooms: isAr ? "غرف" : (property.rooms === 1 ? "Room" : "Rooms"),
        baths: isAr ? "حمام" : (property.bathrooms === 1 ? "Bath" : "Baths"),
        area: isAr ? "م٢" : "m²",
        price: isAr ? "السعر" : "Price",
        currency: isAr ? "ل.س" : "SYP",
        sale: isAr ? "للبيع" : "For Sale",
        rent: isAr ? "للإيجار" : "For Rent"
    };

    const isSale = property.type === "sale" || property.type === "buy";

    // 💠 التعديل 2: معالجة رابط الصورة بشكل ديناميكي
    const imageSrc = property.images?.[0]
        ? cdn(property.images[0].startsWith("http") ? property.images[0] : `${API_BASE_URL}${property.images[0]}`)
        : null;

    return (
        <div
            onClick={() => navigate(`/properties/${property._id}`)}
            className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col h-full cursor-pointer"
        >
            <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                )}

                <div className={`absolute top-4 ${isAr ? 'right-4' : 'left-4'} flex flex-col gap-2`}>
                    <span className={`text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg ${isSale ? "bg-sky-600" : "bg-amber-500"}`}>
                        {isSale ? labels.sale : labels.rent}
                    </span>
                    {property.isFeatured && (
                        <div className="bg-emerald-500 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg border-2 border-white animate-pulse text-xl">
                            ★
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className={`flex items-center gap-2 text-sky-600 text-xs font-bold mb-2 ${isAr ? "flex-row-reverse" : ""}`}>
                    <IoLocationOutline /> <span>{city}</span>
                    <span className="text-gray-300">|</span>
                    <span>{category}</span>
                </div>

                <h2 className={`text-xl font-black text-gray-800 dark:text-white mb-2 ${isAr ? "text-right" : "text-left"}`}>
                    {title}
                </h2>

                <p className={`text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4 ${isAr ? "text-right" : "text-left"}`}>
                    {description}
                </p>

                <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-50 dark:border-gray-700 mb-6">
                    <div className="flex flex-col items-center border-e border-gray-100 dark:border-gray-700">
                        <CiRuler className="text-sky-600 mb-1" size={20} />
                        <span className="text-xs font-bold">{property.area} {labels.area}</span>
                    </div>
                    <div className="flex flex-col items-center border-e border-gray-100 dark:border-gray-700">
                        <LuBedSingle className="text-sky-600 mb-1" size={20} />
                        <span className="text-xs font-bold">{property.rooms} {labels.rooms}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <LuBath className="text-sky-600 mb-1" size={20} />
                        <span className="text-xs font-bold">{property.bathrooms} {labels.baths}</span>
                    </div>
                </div>

                <div className={`flex items-center justify-between mt-auto ${isAr ? "flex-row-reverse" : ""}`}>
                    <div>
                        <span className="text-[10px] text-gray-400 font-black block uppercase">{labels.price}</span>
                        <div className="text-xl font-black text-sky-700 dark:text-sky-400">
                            {property.price
                                ? <>{property.price.toLocaleString()} <span className="text-xs">{labels.currency}</span></>
                                : <span className="text-sm">{isAr ? "السعر عند الطلب" : "Price on request"}</span>}
                        </div>
                    </div>
                    <div className="bg-sky-50 dark:bg-gray-700 text-sky-600 p-3 rounded-2xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                        {isAr ? <LuArrowUpLeft size={20} /> : <LuArrowUpRight size={20} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;