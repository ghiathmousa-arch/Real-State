import { FaSearch } from "react-icons/fa";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchContext } from "../Layout/Layout";
import { usePropertyOptions } from "../../constants/property";

const Search = () => {
    const { t } = useTranslation();
    const { setSearch } = useContext(searchContext);
    const [localOptions, setLocalOptions] = useState({ location: '', type: '', price: '' });
    const { cities, categories } = usePropertyOptions();

    const searchFields = [
        { name: 'location', label: t('search.location_label'), icon: '📍', options: cities },
        { name: 'type', label: t('search.type_label'), icon: '🏠', options: categories },
        { name: 'price', label: t('search.price_label'), icon: '💰', options: [t('search.price_options.low'), t('search.price_options.high')] },
    ];

    // ← تطبيق البحث + scroll للنتائج
    const handleSearch = () => {
        setSearch(localOptions);
        setTimeout(() => {
            document.getElementById("PropertiesList")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 400);
    };

    return (
        <div className="w-full max-w-5xl p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col md:flex-row items-end gap-4">
            {searchFields.map((field) => (
                <div key={field.name} className="flex flex-col gap-2 flex-1 w-full">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 px-2">
                        {field.label}
                    </label>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-700 p-3 rounded-2xl border dark:border-slate-600">
                        <span>{field.icon}</span>
                        <select
                            className="bg-transparent text-sm w-full outline-none dark:text-white cursor-pointer"
                            onChange={(e) => setLocalOptions(prev => ({ ...prev, [field.name]: e.target.value }))}
                        >
                            <option value="" className="dark:bg-slate-800">{t('search.placeholder')}</option>
                            {field.options.map((opt, i) => (
                                <option key={i} value={opt} className="dark:bg-slate-800">{opt}</option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}
            <button
                onClick={handleSearch}
                className="w-full md:w-auto flex justify-center items-center gap-3 text-white px-10 py-4 rounded-2xl bg-[#004E80] hover:bg-blue-700 active:scale-95 transition-all font-bold shadow-lg shadow-blue-900/20"
            >
                <FaSearch /> {t('search.button')}
            </button>
        </div>
    );
};

export default Search;