import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { LuBedSingle, LuArrowUpRight } from "react-icons/lu";
import { CiRuler } from "react-icons/ci";
import { PiBathtub } from "react-icons/pi";
import { cdn } from "../../../utils/format";
import { api, API_BASE } from "../../../utils/api";
import { localized } from "../../../utils/helper";
import PriceTag from "../PriceTag/PriceTag";
import ListingBadges from "../PriceTag/ListingBadges";
import { sortProperties } from "../../../utils/propertyFilters";


// "أحدث العقارات" بالرئيسية — آخر 8 عقارات نشطة، والباقي بصفحة /properties
const LATEST_COUNT = 8;

// ── PropertiesList ────────────────────────────────────────────────────────────
const PropertiesList: React.FC = () => {
    const { t, i18n } = useTranslation();
    const ar = i18n.language === "ar";
    const navigate = useNavigate();

    const [allProperties, setAllProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // الأحدث أول (يلي معها صور قبل يلي بلا صور)، وبس أول LATEST_COUNT
    const properties = useMemo(
        () => sortProperties(allProperties, "newest").slice(0, LATEST_COUNT),
        [allProperties]
    );

    // جلب كل العقارات مرة واحدة عند أول تحميل
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                setLoading(true);
                const response = await api.get("/properties");
                setAllProperties(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error("Error fetching:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);


    if (loading) {
        return (
            <section className="py-14 px-6 dark:bg-gray-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
                    {Array.from({ length: LATEST_COUNT }).map((_, i) => (
                        <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-700 animate-pulse h-72" />
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section id="PropertiesList" className="py-14 px-6 dark:bg-gray-800">
            <div className={`flex items-end justify-between mb-10 gap-4 flex-wrap ${ar ? "flex-row-reverse" : ""}`}>
                <div className={ar ? "text-right" : "text-left"}>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-sky-600 dark:text-sky-400 uppercase mb-2">
                        <span className="w-5 h-px bg-sky-500 inline-block" />
                        {t("properties.explore")}
                        <span className="w-5 h-px bg-sky-500 inline-block" />
                    </span>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-gray-800 dark:text-white leading-tight">
                        {t("properties.latest")}
                    </h1>
                    <div className={`mt-3 h-1 w-16 rounded-full bg-sky-600 ${ar ? "ms-auto" : ""}`} />
                </div>

                <Link to="/properties"
                    className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold border-2 border-sky-600 text-sky-600 hover:bg-sky-600 hover:text-white dark:border-sky-500 dark:text-sky-400 dark:hover:bg-sky-600 dark:hover:text-white transition-all duration-300">
                    {t("properties.showAllResults")}
                    <LuArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </Link>
            </div>

            {/* ── Grid ── */}
            {properties.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {properties.map((property) => {
                            const title = localized(property, "title", ar);
                            const city = localized(property, "city", ar);

                            let imgSrc: string | null = null;
                            if (property.images && property.images.length > 0) {
                                const firstImg = property.images[0];
                                imgSrc = cdn(firstImg.startsWith("http") ? firstImg : `${API_BASE}${firstImg}`);
                            }

                            return (
                                <div
                                    key={property._id}
                                    onClick={() => navigate(`/properties/${property._id}`)}
                                    className="group bg-white dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-600 hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-xl hover:-translate-y-1 shadow-sm transition-all duration-300 cursor-pointer"
                                >
                                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-600">
                                        {imgSrc && (
                                            <img src={imgSrc} alt={title} loading="lazy"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                        <ListingBadges property={property} className={`absolute top-3 ${ar ? "left-3" : "right-3"} max-w-[85%]`} />
                                    </div>

                                    <div className={`p-4 ${ar ? "text-right" : "text-left"}`}>
                                        <h3 className="font-bold text-gray-800 dark:text-white text-base leading-snug mb-1 line-clamp-1">{title}</h3>
                                        <div className={`flex items-center gap-1 text-gray-400 text-xs mb-3 ${ar ? "flex-row-reverse justify-end" : ""}`}>
                                            <IoLocationOutline className="shrink-0" /><span>{city}</span>
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-gray-600 mb-3" />
                                        <div className={`flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4 ${ar ? "flex-row-reverse" : ""}`}>
                                            <span className="flex items-center gap-1"><CiRuler className="text-sm" />{property.area} {t("properties.squareMeter")}</span>
                                            {(property.rooms ?? 0) > 0 && <span className="flex items-center gap-1"><LuBedSingle className="text-sm" />{property.rooms}</span>}
                                            {(property.bathrooms ?? 0) > 0 && <span className="flex items-center gap-1"><PiBathtub className="text-sm" />{property.bathrooms}</span>}
                                        </div>
                                        <PriceTag property={property} size="md" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                    {t("properties.noPropertiesFound")}
                </div>
            )}
        </section>
    );
};

export default PropertiesList;