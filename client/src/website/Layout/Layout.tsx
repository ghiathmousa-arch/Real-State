import { createContext, useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface SearchFilters {
    location: string;
    type: string;
    price: string;
}

interface SearchContextType {
    search: SearchFilters;
    setSearch: Dispatch<SetStateAction<SearchFilters>>;
    filteredData: any[];
    loading: boolean;
}

export const searchContext = createContext<SearchContextType>({} as SearchContextType);

const Layout = () => {
    const { i18n } = useTranslation();
    const [search, setSearch] = useState<SearchFilters>({ location: '', type: '', price: '' });
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFilteredProperties = async (filters: SearchFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
  const API_URL = import.meta.env.VITE_API_URL;
            // التحقق من الفلترة (تجاهل القيم الفارغة أو الافتراضية)
            if (filters.location && filters.location !== "") params.append('city', filters.location);
            if (filters.type && filters.type !== "") params.append('type', filters.type);

            if (filters.price) {
                if (filters.price.includes("500M+")) {
                    params.append('minPrice', '500000000');
                } else if (filters.price.includes("-")) {
                    params.append('minPrice', '100000000');
                    params.append('maxPrice', '500000000');
                }
            }

            const response = await fetch(`${API_URL}/api/properties?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch");
            const data = await response.json();
            setFilteredData(data);
        } catch (error) {
            console.error(error);
            setFilteredData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilteredProperties(search);
    }, [search]);

    return (
        <searchContext.Provider value={{ search, setSearch, filteredData, loading }}>
            <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
                <Outlet />
            </div>
        </searchContext.Provider>
    );
};

export default Layout;