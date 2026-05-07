// src/components/Hero.tsx
import Search from "./Search";
import SectionHead from "./SectionHead";

const Hero = () => {

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center">
            <img src="/img/bg-hero-state.png" className="absolute w-full h-full object-cover" alt="bg" />
            <div className="relative flex flex-col items-center text-center px-6 py-20 lg:py-32 max-w-6xl w-full">
                <SectionHead title="استثمر في مستقبل العمارة السورية" subTitle="نقدم لك أرقى العقارات في سوريا، بضمانات قانونية وخيارات استثمارية عالمية تناسب تطلعاتك.
                " variant="hero" />
                <div className="mt-10"><Search /></div>
                
                
            </div>
        </div>
    );
};

export default Hero;