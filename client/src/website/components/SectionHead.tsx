import Search from "./Search";

interface props {
    title: string;
    subTitle: string;
    bgImg: string;
}

const SectionHead = ({ title, subTitle, bgImg }: props) => {
    return (
        <div className="w-full h-screen flex justify-center items-center">
            
            <div className="absolute w-screen h-screen">
                <img 
                    src={bgImg} 
                    alt="" 
                    className="w-full h-full object-cover" 
                />
            </div>

            <div className="absolute flex flex-col items-center gap-14 text-center">
                <div className="">
                    <h1 className="text-5xl text-white font-bold mb-3.5">
                        {title}
                    </h1>
                    <p className="text-white font-medium">
                        {subTitle}
                    </p>
                </div>
                <div>
                    <Search/>
                </div>
            </div>
        </div>
    );
};

export default SectionHead;