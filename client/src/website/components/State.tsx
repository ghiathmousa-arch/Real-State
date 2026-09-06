import InfoStats from "./InfoStats";
import SectionHead from "./SectionHead";
import { useTranslation } from "react-i18next";

const State = () => {
    const { t } = useTranslation();

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center">
            <img 
                src="/img/bg-stateSection.webp" 
                alt="Background" 
                className="absolute w-full h-full object-cover" 
            />

            <div className="relative flex flex-col items-center text-center px-6 py-20 lg:py-32 max-w-6xl w-full z-10">
                <SectionHead
                    // استخدم مفاتيح (Keys) بدلاً من النصوص الكاملة
                    title={t("stats.title")}
                    subTitle={t("stats.subTitle")}
                    variant="state"
                />

                <div className="mt-10 lg:mt-14 w-full">
                    <InfoStats />
                </div>
            </div>
        </div>
    );
};

export default State;
/*                 <SectionHead
                    title={t("رؤيتنا: إعادة تعريف الفخامة العقارية في سوريا")}
                    subTitle={t("نطمح لأن نكون الجسر الأكثر ثقة وموثوقية للمستثمرين في الداخل والخارج.")}
                    variant="state"
                /> */
