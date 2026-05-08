import { FaSearch } from "react-icons/fa";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchContext } from "../Layout/Layout";

const Search = () => {
    const { t } = useTranslation();
    const { setSearch } = useContext(searchContext);
    const [localOptions, setLocalOptions] = useState({ location: '', type: '', price: '' });
    const [cities, setCities] = useState<string[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/cities").then(res => res.json()).then(data => setCities(data));
        fetch("http://localhost:5000/api/categories").then(res => res.json()).then(data => setCategories(data));
    }, []);

    const searchFields = [
        { name: 'location', label: t('search.location_label'), icon: '📍', options: cities },
        { name: 'type', label: t('search.type_label'), icon: '🏠', options: categories },
        { name: 'price', label: t('search.price_label'), icon: '💰', options: [t('search.price_options.low'), t('search.price_options.high')] },
    ];

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
                            className="bg-transparent text-sm w-full outline-none dark:text-white"
                            onChange={(e) => setLocalOptions(prev => ({ ...prev, [field.name]: e.target.value }))}
                        >
                            <option value="">{t('search.placeholder')}</option>
                            {field.options.map((opt, i) => (
                                <option key={i} value={opt} className="dark:bg-slate-800">{opt}</option>
                            ))}
                        </select>
                    </div>
                </div>
            ))}
            <button 
                onClick={() => setSearch(localOptions)}
                className="w-full md:w-auto flex justify-center items-center gap-3 text-white px-10 py-4 rounded-2xl bg-[#004E80] hover:bg-blue-700 transition-all font-bold"
            >
                <FaSearch /> {t('search.button')}
            </button>
        </div>
    );
};
export default Search;