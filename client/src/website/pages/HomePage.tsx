// src/pages/HomePage.tsx
import Hero from "../components/Hero";
import { FaLocationDot, FaMoneyBills } from "react-icons/fa6";
import { BiBuildingHouse } from "react-icons/bi";
import WhyInvestors from "../components/WhyInvestors";
import State from "../components/State";
import Footer from "../components/Footer";
import type { ReactNode } from "react";

// تعريف واجهة بيانات البحث
interface FilterSearch {
    label: string;
    icon: ReactNode;
    options: string[];
    name: string;
}

// مصفوفة البيانات الثابتة لشريط البحث (العناوين والأيقونات)
// ملاحظة: الخيارات (options) للموقع والنوع سيتم جلبها ديناميكياً من الباك آند داخل مكون Search
export const searchData: FilterSearch[] = [
    {
        name: 'location',
        label: 'الموقع',
        icon: <FaLocationDot className="text-[#004E80]" />,
        options: ['حدد الموقع'] 
    },
    {
        name: 'type',
        label: 'نوع العقار',
        icon: <BiBuildingHouse className="text-[#004E80]" />,
        options: ['حدد العقار المطلوب']
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
            {/* مكون الـ Hero: يعرض العقارات المفلترة عبر سحبها من الـ Context داخلياً */}
            
                <Hero />

            {/* مكون المميزات */}
            
                <WhyInvestors />

            {/* مكون الرؤية والعقارات الإضافية: ينسجم تلقائياً مع الفلترة عبر الـ Context */}
            
                <State />

            {/* تذييل الصفحة */}
            <Footer />
        </div>
    );
};

export default HomePage;