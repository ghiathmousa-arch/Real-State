interface props {
    title: string;
    subTitle?: string;
    variant?: 'hero' | 'section' | 'state'; 
}

const SectionHead = ({ title, subTitle, variant }: props) => {
    return (
        <div className={`relative w-full flex 
            ${
                variant == 'section' 
                ? 'justify-start items-start' 
                
                : variant == 'state' 
                ? 'justify-center items-center py-10 w-full' 
                : 'justify-center h-56 items-center w-full'
            }`}>
            
            <div className={`relative flex flex-col w-full max-w-6xl px-4
                ${
                    variant == 'section' ? 'items-start text-right' : 'items-center text-center'
                } 

                min-[300px]:max-[768px]:gap-4`
                }>
                
                <div className="space-y-4 flex flex-col gap-4 w-full">
                    <h1 className={`font-bold ${
                        variant == 'section' 
                            ? 'text-black text-4xl font-bold min-[300px]:max-[510px]:text-[23px]'
                            : variant == 'hero' 
                            ? 'm-0 text-white text-5xl lg:text-6xl min-[500px]:max-[768px]:text-[40px] min-[300px]:max-[500px]:text-[30px]' 
                            // تنسيق العنوان في حالة الـ state
                            : 'text-4xl text-white w-full'
                    }`}>
                        {title}
                    </h1>
                    
                    {subTitle && (
        <p className={`font-medium ${
            variant == 'section' 
                ? 'text-xl text-gray-700 max-w-2xl' :
            variant == 'hero' 
                ? 'text-xl text-white mx-auto max-w-2xl' :
                // في حالة الستيت: نزيد max-w ليمتد النص كما في الصورة تماماً
                'text-lg text-white mx-auto w-full max-w-4xl'
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