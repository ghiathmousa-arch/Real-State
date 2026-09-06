import { Fragment } from "react";
import { useTranslation } from "react-i18next";

const InfoStats = () => {
    const { t } = useTranslation();

    // جلب البيانات مع التأكد أنها مصفوفة، وإذا لم توجد نضع مصفوفة فارغة []
    const stats = t('stats.items', { returnObjects: true });
    const statsArray = Array.isArray(stats) ? stats : [];

    return (
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-y-10">
            {statsArray.map((item: any, index: number) => (
                <Fragment key={index}>
                    {/* الفاصل يُرسم بين العناصر فقط (لا يظهر فاصل زائد في الطرف) */}
                    {index > 0 && (
                        <span
                            aria-hidden="true"
                            className="hidden sm:block w-px h-10 shrink-0 bg-white/25"
                        />
                    )}
                    <div className="text-white text-center px-8 lg:px-14">
                        <span className="block font-bold text-3xl lg:text-4xl leading-none">
                            {item.title}
                        </span>
                        <span className="mt-2 block text-sm opacity-80">
                            {item.subTitle}
                        </span>
                    </div>
                </Fragment>
            ))}
        </div>
    );
};
export default InfoStats;
