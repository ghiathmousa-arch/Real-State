import InfoStats from "./InfoStats";
import SectionHead from "./SectionHead";

const State = () => {

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center">
            {/* الصورة الخلفية للقسم */}
            <img 
                src="/img/bg-stateSection.png" 
                alt="Background" 
                className="absolute w-full h-full object-cover" 
            />

            <div className="relative flex flex-col items-center text-center px-6 py-20 lg:py-32 max-w-6xl w-full">
                {/* رأس القسم */}
                <SectionHead
                    title="رؤيتنا: إعادة تعريف الفخامة العقارية في سوريا"
                    subTitle="نطمح لأن نكون الجسر الأكثر ثقة وموثوقية للمستثمرين في الداخل والخارج، عبر تقديم حلول عقارية تجمع بين الأصالة السورية والمعايير العالمية."
                    variant="state"
                />
                <InfoStats />
            </div>
        </div>
    );
};

export default State;