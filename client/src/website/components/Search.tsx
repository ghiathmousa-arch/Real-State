import { FaSearch } from "react-icons/fa";
import {searchData } from "../pages/HomePage";


const Search = () => {
    

    return (
        <div className="flex flex-col items-center gap-10">
            <div dir="rtl" 
            className="w-245
            max-w-5xl p-5 bg-[#BABCC0]/80 backdrop-blur-md
            flex justify-between items-end gap-4 rounded-3xl shadow-2xl

            // شاشات من 768 الى 1000
            min-[768px]:max-[1000px]:w-175

            // شاشات صغيرة
            min-[300px]:max-[768px]:flex-col 
            min-[500px]:max-[768px]:w-113.5 
            min-[300px]:max-[768px]:items-center
            min-[300px]:max-[500px]:w-70">
                
                {searchData.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2 flex-1

                    // شاشات صغيرة و وسط
                    min-[300px]:max-[768px]:w-full">
                        
                        <label className="text-xs text-right font-bold text-gray-800 mr-2">
                            {item.label}
                        </label>

                        <div className="relative flex items-center gap-2 bg-white p-3 rounded-2xl hover:bg-[#cde5fc] transition-all duration-300 border border-transparent hover:border-blue-100 shadow-sm  ">
                            <span className="text-xl">
                                {item.icon}
                            </span>

                            <select 
                                
                                className="appearance-none bg-transparent text-sm text-gray-700  cursor-pointer border-none p-1 font-bold w-full outline-none

                                // شاشات من 768 الى 1000
                                min-[768px]:max-[1000px]:text-[11px]"
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
                    className="cursor-pointer flex justify-center items-center gap-3 text-white px-8 py-4 rounded-2xl bg-[#004E80] hover:bg-[#005fa1] duration-200 shadow-md font-bold text-sm active:scale-95 hover:-translate-y-2 hover:shadow-lg hover:shadow-gray-700 backdrop-blur-md shadow-black/30 
                    
                    // شاشات وسط
                    min-[500px]:max-[768px]:w-62.5
                    
                    // شاشات صغيرة
                    min-[300px]:max-[500px]:w-full"

                >
                    <FaSearch className="text-lg" />
                    بحث متقدم
                </button>
            </div>

            
        </div>
    )
}

export default Search;