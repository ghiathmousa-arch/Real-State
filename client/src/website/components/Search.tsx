import { type ReactNode } from "react"
import { FaLocationDot, FaMoneyBills } from "react-icons/fa6";
import { BiBuildingHouse } from "react-icons/bi";
import { FaSearch } from "react-icons/fa";

interface FilterSearch {
    label: string
    icon: ReactNode
    options: string[]
}

// بيانات الفلاتر (حافظنا على هيكلية الكود الخاص بك)
const searchData: FilterSearch[] = [
    {
        label: 'الموقع',
        icon: <FaLocationDot className="text-[#004E80]" />,
        options: ['حدد الموقع', 'دمشق', 'حلب', 'حمص', 'اللاذقية']
    },
    {
        label: 'نوع العقار',
        icon: <BiBuildingHouse className="text-[#004E80]" />,
        options: ['حدد العقار المطلوب', 'شقق فاخرة', 'اراضي', 'منازل']
    },
    {
        label: 'نطاق السعر',
        icon: <FaMoneyBills className="text-[#004E80]" />,
        options: ['حدد السعر', '100M - 500M ل.س ', '+500M']
    },
];


const Search = () => {
    

    return (
        <div className="flex flex-col items-center gap-10">
            {/* حاوية البحث (الكود الخاص بك مع الربط الديناميكي) */}
            <div dir="rtl" className="w-250 max-w-5xl p-5 bg-[#BABCC0]/80 backdrop-blur-md flex justify-between items-end gap-4 rounded-3xl shadow-2xl">
                
                {searchData.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2 flex-1">
                        <label className="text-xs text-right font-bold text-gray-800 mr-2">
                            {item.label}
                        </label>

                        <div className="group relative flex items-center gap-2 bg-white p-3 rounded-2xl hover:bg-[#cde5fc] transition-all duration-300 border border-transparent hover:border-blue-100 shadow-sm">
                            <span className="text-xl">
                                {item.icon}
                            </span>

                            <select 
                                
                                className="appearance-none bg-transparent text-sm text-gray-700 outline-none cursor-pointer border-none p-1 font-bold w-full"
                            >
                                {item.options.map((opt, i) => (
                                    <option 
                                        key={i} 
                                        value={opt} 
                                        className="bg-[#F0F7FF] text-[#004E80] font-medium checked:bg-[#0466a3] checked:text-white"
                                    >
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}

                <button 
                    className="cursor-pointer flex justify-center items-center gap-3 text-white px-8 py-4 rounded-2xl bg-[#004E80] hover:bg-[#005fa1] duration-200 shadow-md font-bold text-sm active:scale-95 hover:-translate-y-2 hover:shadow-lg hover:shadow-gray-700 backdrop-blur-md shadow-black/30"
                >
                    <FaSearch className="text-lg" />
                    بحث متقدم
                </button>
            </div>

            
        </div>
    )
}

export default Search;