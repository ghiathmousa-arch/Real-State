interface props {
    title: string;
    subTitle?: string;
    variant?: 'hero' | 'section' ; // شرط اختلاف التنسيقات بين الهيرو و السيكشن

}

const SectionHead = ({ title, subTitle, variant }: props) => {
    return (
        <div className={`relative w-full flex 

            ${
            variant == 'section' ? 'justify-start items-start' : 'justify-center h-56 items-center'
        }`}>
            
            <div className={`relative flex flex-col w-full max-w-6xl px-4
            // 
            ${
                variant == 'section' ? 'items-start text-right' : 'items-center text-center'
            } min-[300px]:max-[768px]:gap-4`}>
                
                <div className="space-y-4 flex flex-col gap-4">
                    <h1 className={`font-bold${
                        variant == 'section' 
                            ? 'text-black text-4xl font-bold  min-[300px]:max-[510px]:text-[23px]'
                            : 'm-0 text-white text-5xl lg:text-6xl min-[500px]:max-[768px]:text-[40px] min-[300px]:max-[500px]:text-[30px]'
                    }`}>
                        {title}
                    </h1>
                    
                    {subTitle && (
                        <p className={`text-xl font-medium max-w-2xl ${
                            variant == 'section' ? 'text-gray-700' : 'text-white mx-auto'
                        }`}>
                            {subTitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SectionHead;