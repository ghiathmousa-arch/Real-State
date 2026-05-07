import InfoStats from "./InfoStats";
import SectionHead from "./SectionHead";

const State = () => {

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center">

            <img 
                src="/img/bg-stateSection.png" 
                alt="Background" 
                className="absolute w-full h-full object-cover" 
            />

            <div className="relative flex flex-col items-center text-center px-6 py-20 lg:py-32 max-w-6xl w-full z-10">
                <SectionHead
                    title="رؤيتنا: إعادة تعريف الفخامة العقارية في سوريا"
                    subTitle="نطمح لأن نكون الجسر الأكثر ثقة وموثوقية للمستثمرين في الداخل والخارج."
                    variant="state"
                />

                <div className="mt-20 w-full">
                    <InfoStats />
                </div>
            </div>
        </div>
    );
};

export default State;