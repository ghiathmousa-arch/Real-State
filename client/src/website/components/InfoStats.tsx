import { useTranslation } from "react-i18next";

const InfoStats = () => {
    const { t } = useTranslation();
    
    // جلب البيانات مع التأكد أنها مصفوفة، وإذا لم توجد نضع مصفوفة فارغة []
    const stats = t('stats.items', { returnObjects: true });
    const statsArray = Array.isArray(stats) ? stats : [];

    return (
        <div className="flex justify-center divide-x-2 rtl:divide-x-reverse divide-white/30 min-[300px]:max-[550px]:flex-col gap-6">
            {statsArray.map((item: any, index: number) => (
                <div key={index} className="text-white px-12 text-center">
                    <h1 className="font-bold text-4xl mb-2">{item.title}</h1>
                    <p className="text-sm opacity-90">{item.subTitle}</p>
                </div>
            ))}
        </div>
    );
};
export default InfoStats;