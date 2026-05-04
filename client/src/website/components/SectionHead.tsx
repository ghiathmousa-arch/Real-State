import Search from "./Search";

interface props {
    title: string;
    subTitle: string;
    bgImg: string;
}

const SectionHead = ({ title, subTitle, bgImg }: props) => {
    return (
        <div className="relative w-full h-screen flex justify-center items-center">
            
            <div className="absolute inset-0">
                <img 
                    src={bgImg} 
                    alt="background" 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute"></div>
            </div>

            <div className="relative flex flex-col items-center gap-25
                text-center px-4 w-full max-w-6xl
                
                //  شاشات وسط و الصغيرة
                min-[300px]:max-[768px]:gap-4
                ">
                <div className="space-y-4">
                    <h1 className="text-5xl lg:text-6xl text-white font-bold leading-tight

                    // شاشات وسط
                    min-[500px]:max-[768px]:text-[40px]
                    min-[500px]:max-[768px]:mt-2

                    // شاشات صغيرة
                    min-[300px]:max-[500px]:text-[30px]
                    min-[300px]:max-[500px]:mt-3
                    ">
                        {title}
                    </h1>
                    <p className="text-sm min-[500px]:max-[768px]:text-[14px] text-white font-medium max-w-2xl mx-auto">
                        {subTitle}
                    </p>
                </div>
                
                <Search/>
            </div>
        </div>
    );
};

export default SectionHead;