import { FaSearch } from "react-icons/fa";
import { useContext, useEffect, useState } from "react";
import { searchContext, searchData } from "../pages/HomePage";

const Search = () => {
    const { setSearch } = useContext(searchContext);

    const [localOptions, setLocalOptions] = useState({ 
        location: '', 
        type: '', 
        price: '' 
    });

    const [cities, setCities] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/cities")
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setCities(data); })
            .catch(err => console.error("Error fetching cities:", err));

        fetch("http://localhost:5000/api/categories")
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setCategories(data); })
            .catch(err => console.error("Error fetching categories:", err));
    }, []);

    const handleSearchClick = () => {
        setSearch(localOptions);
    };

    return (
        <div className="flex flex-col items-center gap-10 dark:bg-black">
            <div dir="rtl" 
                className="w-245 max-w-5xl p-5 bg-[#BABCC0]/80 backdrop-blur-md flex justify-between items-end gap-4 rounded-3xl shadow-2xl min-[768px]:max-[1000px]:w-175 min-[300px]:max-[768px]:flex-col min-[500px]:max-[768px]:w-113.5 min-[300px]:max-[768px]:items-center min-[300px]:max-[500px]:w-70">
                
                {searchData.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2 flex-1 min-[300px]:max-[768px]:w-full">
                        <label className="text-xs text-right font-bold text-gray-800 mr-2">
                            {item.label}
                        </label>
                        <div className="relative flex items-center gap-2 bg-white p-3 rounded-2xl hover:bg-[#cde5fc] transition-all duration-300 border border-transparent shadow-sm focus-within:border-blue-400">
                            <span className="text-xl">
                                {item.icon}
                            </span>
                            <select 
                                value={localOptions[item.name as keyof typeof localOptions]}
                                onChange={(e) => setLocalOptions(prev => ({ ...prev, [item.name]: e.target.value }))}
                                className="appearance-none bg-transparent text-sm text-gray-700 cursor-pointer border-none p-1 font-bold w-full outline-none min-[768px]:max-[1000px]:text-[11px]"
                            >
                                <option value="">{item.options[0]}</option> 

                                {item.name === 'location' && cities.map((city, i) => (
                                    <option key={i} value={city}>{city}</option>
                                ))}

                                {item.name === 'type' && categories.map((cat, i) => (
                                    <option key={i} value={cat}>{cat}</option>
                                ))}

                                {item.name === 'price' && item.options.slice(1).map((p, i) => (
                                    <option key={i} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}

                <button 
                    onClick={handleSearchClick}
                    className="cursor-pointer flex justify-center items-center gap-3 text-white px-8 py-4 rounded-2xl bg-[#004E80] hover:bg-[#005fa1] duration-200 active:scale-95 shadow-md font-bold text-sm active:bg-[#003d66]"
                >
                    <FaSearch className="text-lg" />
                    بحث متقدم
                </button>
            </div>
        </div>
    );
};

export default Search;