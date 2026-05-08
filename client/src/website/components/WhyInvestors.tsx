import { useTranslation } from "react-i18next";
import SectionHead from "./SectionHead";
import { LuDraftingCompass } from "react-icons/lu";
import { PiChartLineUp } from "react-icons/pi";
import { GoShieldCheck } from "react-icons/go";

const WhyInvestors = () => {
    const { t } = useTranslation();

    const features = [
        { key: 'arch', icon: <LuDraftingCompass /> },
        { key: 'study', icon: <PiChartLineUp /> },
        { key: 'legal', icon: <GoShieldCheck /> }
    ];

    return (
        <div className="flex flex-col lg:flex-row justify-between items-center p-10 gap-16 bg-white dark:bg-slate-900 transition-colors">
            <div className="flex flex-col gap-8 flex-1"> 
                <SectionHead title={t('why_us.title')} variant="section" />
                <div className="flex flex-col gap-8">
                    {features.map((item) => (
                        <div className="flex items-start gap-6" key={item.key}>
                            <div className="text-blue-900 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-3xl p-3 rounded-2xl">
                                {item.icon}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="font-bold text-xl dark:text-white">{t(`why_us.features.${item.key}.title`)}</h2>
                                <p className="text-gray-500 dark:text-gray-400">{t(`why_us.features.${item.key}.desc`)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative flex-1 flex justify-center">
                <img src="/img/investors.png" alt="Investors" className="rounded-[40px] shadow-2xl max-w-full h-auto" />
                <div className="absolute -bottom-6 -inline-end-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <h1 className="text-[#004E80] dark:text-blue-400 text-5xl font-bold">15+</h1>
                        <p className="text-gray-800 dark:text-gray-200 text-sm font-bold w-24">
                            {t('why_us.experience_text')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default WhyInvestors;