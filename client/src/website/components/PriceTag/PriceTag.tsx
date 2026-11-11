// عرض سعر العقار بكل الكروت — مكون واحد بدل التكرار.
// بيع: السعر. إيجار: أقصر مدة متوفرة كبيرة ("$40 / يوم") وتحتها سطر صغير بباقي المدد
// ("+ شهري، سنوي"). ولا شي = "السعر عند الطلب".

import { useTranslation } from "react-i18next";
import { formatPrice, formatRentPrices } from "../../../utils/format";

interface Props {
    property: any;
    size?: "sm" | "md" | "lg";
    className?: string;
}

const SIZES = {
    sm: { main: "text-base", suffix: "text-xs", extra: "text-[11px]" },
    md: { main: "text-lg", suffix: "text-xs", extra: "text-xs" },
    lg: { main: "text-xl", suffix: "text-xs", extra: "text-xs" },
};

const PriceTag = ({ property, size = "md", className = "" }: Props) => {
    const { t, i18n } = useTranslation();
    const ar = i18n.language === "ar";
    const s = SIZES[size];

    const onRequest = (
        <p className={`text-sky-700 dark:text-sky-400 font-bold text-sm leading-none ${className}`}>
            {t("properties.priceOnRequest")}
        </p>
    );

    if (property?.type === "rent") {
        const items = formatRentPrices(property.rentPrices, ar);
        if (!items.length) return onRequest;
        const [first, ...rest] = items;
        return (
            <div className={className}>
                <p className={`text-sky-700 dark:text-sky-400 font-bold ${s.main} leading-none`}>
                    <span dir="ltr">{first.price}</span>
                    <span className={`${s.suffix} font-normal text-gray-400 ms-1`}>/ {first.label}</span>
                </p>
                {rest.length > 0 && (
                    <p className={`${s.extra} text-gray-400 mt-1`}>
                        + {rest.map(r => t(`rentPeriods.${r.period}`)).join(ar ? "، " : ", ")}
                    </p>
                )}
            </div>
        );
    }

    if (property?.price == null) return onRequest;
    return (
        <p className={`text-sky-700 dark:text-sky-400 font-bold ${s.main} leading-none ${className}`}>
            <span dir="ltr">{formatPrice(property.price)}</span>
        </p>
    );
};

export default PriceTag;
