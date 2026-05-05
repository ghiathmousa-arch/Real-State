import { type ReactNode } from "react";
import Hero from "../components/Hero";
import { FaLocationDot, FaMoneyBills } from "react-icons/fa6";
import { BiBuildingHouse } from "react-icons/bi";
import WhyInvestors from "../components/WhyInvestors";


interface FilterSearch {
    label: string;
    icon: ReactNode;
    options: string[];
    name: string;
}

// تصدير بيانات البحث لاستخدامها في مكونات أخرى مثل الـ Hero
export const searchData: FilterSearch[] = [
    {
        name: 'location',
        label: 'الموقع',
        icon: <FaLocationDot className="text-[#004E80]" />,
        options: ['حدد الموقع', 'دمشق', 'حلب', 'حمص', 'اللاذقية']
    },
    {
        name: 'type',
        label: 'نوع العقار',
        icon: <BiBuildingHouse className="text-[#004E80]" />,
        options: ['حدد العقار المطلوب', 'شقق فاخرة', 'اراضي', 'منازل']
    },
    {
        name: 'price',
        label: 'نطاق السعر',
        icon: <FaMoneyBills className="text-[#004E80]" />,
        options: ['حدد السعر', '100M - 500M', '500M+']
    }
];

const HomePage = () => {


    return (
        <div className="flex flex-col gap-28">
            <div>
                <Hero />
            </div>
            
            <div>
                <WhyInvestors/>
            </div>
        </div>
    );
};

export default HomePage;