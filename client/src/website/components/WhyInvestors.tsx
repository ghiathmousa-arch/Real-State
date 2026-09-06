import { useTranslation } from "react-i18next";
import SectionHead from "./SectionHead";
import { LuDraftingCompass } from "react-icons/lu";
import { PiChartLineUp } from "react-icons/pi";
import { GoShieldCheck } from "react-icons/go";

const WhyInvestors = () => {
    const { t } = useTranslation();

    const features = [
        { key: 'legal', icon: <GoShieldCheck /> },
        { key: 'study', icon: <PiChartLineUp /> },
        { key: 'arch', icon: <LuDraftingCompass /> }
    ];

    return (
        <div className="flex flex-col lg:flex-row justify-between items-center p-10 gap-16 bg-white dark:bg-slate-900 transition-colors overflow-hidden" id="ourServices">
            <div className="flex flex-col gap-8 flex-1 w-full">
                <SectionHead title={t('why_us.title')} variant="section" />
                <div className="flex flex-col gap-8">
                    {features.map((item) => (
                        <div className="flex items-start gap-6 group" key={item.key}>
                            <div className="text-blue-900 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-3xl p-3 rounded-2xl transition-transform group-hover:scale-110">
                                {item.icon}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="font-bold text-xl dark:text-white">
                                    {t(`why_us.features.${item.key}.title`)}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                    {t(`why_us.features.${item.key}.desc`)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative flex-1 flex justify-center w-full mt-10 lg:mt-0">
                <img
                    src="/img/investors.webp"
                    alt="Investors"
                    className="rounded-[40px] shadow-2xl max-w-full h-auto object-cover"
                />

                {/* Badge الخبرة */}
                <div className="absolute dark:text-sky-400 -bottom-6 ltr:-right-6 rtl:-left-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-gray-200 dark:border-white/10 p-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <h1 className="text-[#004E80] dark:text-sky-400 text-5xl font-extrabold">15+</h1>
                        <p className="text-gray-800 dark:text-gray-200 text-sm font-bold w-24 leading-tight">
                            {t('why_us.experience_text')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhyInvestors;