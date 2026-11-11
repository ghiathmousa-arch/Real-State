// شارات الكرت: نوع العملية (للبيع أزرق / للإيجار برتقالي) + "مفروش" + نجمة المميز.
// مشتركة بين كل الكروت عشان الإيجار يضل بنفس لونه بكل مكان.

import { useTranslation } from "react-i18next";

interface Props {
    property: any;
    showFeatured?: boolean;
    className?: string;
}

const base = "text-xs font-bold px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap";

const ListingBadges = ({ property, showFeatured = true, className = "" }: Props) => {
    const { t } = useTranslation();
    const isBuy = property?.type === "buy";

    return (
        <div className={`flex flex-wrap gap-1.5 ${className}`}>
            <span className={`${base} text-white ${isBuy ? "bg-sky-600" : "bg-amber-500"}`}>
                {isBuy ? t("properties.sale") : t("properties.rent")}
            </span>
            {property?.furnished === "furnished" && (
                <span className={`${base} bg-white/90 text-amber-700 dark:bg-gray-900/80 dark:text-amber-300`}>
                    {t("properties.furnished")}
                </span>
            )}
            {showFeatured && property?.isFeatured && (
                <span className={`${base} text-white bg-emerald-500`}>★</span>
            )}
        </div>
    );
};

export default ListingBadges;
