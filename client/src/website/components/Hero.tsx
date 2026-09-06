import { useTranslation } from "react-i18next";
import Search from "./Search";
import SectionHead from "./SectionHead";

const Hero = () => {
    const { t } = useTranslation();
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden" id="home">
            <img src="/img/bg-hero-state.webp" className="absolute w-full h-full object-cover" alt="bg" />
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div> {/* Overlay */}
            <div className="relative flex flex-col items-center text-center px-6 py-20 max-w-6xl w-full z-10">
                <SectionHead
                    title={t('hero.title')}
                    subTitle={t('hero.subTitle')}
                    variant="hero"
                />
                <div className="mt-10 w-full flex justify-center"><Search /></div>
            </div>
        </div>
    );
};
export default Hero;