import SectionHead from "./SectionHead"
import { LuDraftingCompass } from "react-icons/lu";
import { PiChartLineUp } from "react-icons/pi";
import { GoShieldCheck } from "react-icons/go";
import type { ReactNode } from "react";

// الواجهات البرمجية
interface PropertyInfo {
    title: string;
    description: string;
    icon: ReactNode;
}

interface ExperienceInfo {
    years: string;
    description: string;
}

const content: PropertyInfo[] = [
    {
        title: 'خبرة معمارية عميقة',
        description: 'نقيم الحالة الإنشائية والجمالية للعقارات بأعلى المعايير الهندسية الاحترافية.',
        icon: <LuDraftingCompass className="text-2xl" />
    },
    {
        title: 'دراسات جدوى دقيقة',
        description: 'نقدم تحليلات دقيقة للسوق العقاري السوري وتوقعات العائد الاستثماري لسنوات قادمة.',
        icon: <PiChartLineUp className="text-2xl" />
    },
    {
        title: 'أمان قانوني مطلق',
        description: 'فريق قانوني متخصص يراجع كافة المستندات والملكيات لضمان خلو العقار من أي التزامات.',
        icon: <GoShieldCheck className="text-2xl" />
    }
];

const EXPERIENCE_DATA: ExperienceInfo = {
    years: '15+',
    description: 'عاماً من الخبرة في السوق السوري'
};

const WhyInvestors = () => {
    return (
        <div 
            dir="rtl" 
            className="flex justify-between items-center p-10
            min-[300px]:max-[1000px]:flex-col gap-10
            "
        >
            
            {/* القسم الأيمن: النصوص */}
            <div className="flex flex-col gap-7 min-w-70"> 
                {/* أضفنا pt-2 (padding-top) بسيطة فقط لموازنة الخط الأساسي للنص مع حافة الصورة */}
                <SectionHead
                    title="لماذا يختارنا كبار المستثمرين؟"
                    variant="section"
                />

                <div className="flex flex-col gap-8">
                    {content.map((item, index) => (
                        <div className="flex items-center gap-7 " key={index}>
                            <div className="text-blue-900 bg-blue-100 text-2xl p-2 rounded-xl">
                                {item.icon}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <h2 className="font-bold">
                                    {item.title}
                                </h2>
                                <p className="text-gray-500">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* القسم الأيسر: الصورة والبطاقة */}
                <div className="relative">
    
    {/* الصورة الأساسية */}
    <img 
        src="/img/investors.png" 
        alt="Investors" 
        className="rounded-[40px] block shadow-lg" 
    />

    {/* بطاقة الخبرة العائمة */}
    {/* تم تثبيت الـ top والـ right لتكون خارج حدود الصورة كما في التصميم */}
    <div className="absolute -bottom-10 -right-12 bg-white/30 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl max-w-60
    min-[300px]:max-[1000px]:right-0
    ">
        <div className="flex p-5 gap-4 items-center mx-w-60
        
        ">
            {/* الرقم */}
            <h1 className="text-[#004E80] text-5xl font-bold leading-none">
                {EXPERIENCE_DATA.years}
            </h1>
            
            {/* النص */}
            <p className="text-gray-800 text-sm font-bold leading-tight">
                {EXPERIENCE_DATA.description}
            </p>
        </div>
    </div>

</div>
            </div>

    );
};

export default WhyInvestors;