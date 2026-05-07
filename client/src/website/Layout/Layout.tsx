// src/Layout/Layout.tsx
import { createContext, useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Outlet } from 'react-router-dom';
import { getProperties } from '../api/properties';

interface SearchFilters { location: string; type: string; price: string; }

interface SearchContextType {
  search: SearchFilters;
  setSearch: Dispatch<SetStateAction<SearchFilters>>;
  filteredData: any[]; // النتائج المفلترة عالمياً
  loading: boolean;     // حالة التحميل عالمياً
  allProperties: any[]; // كل العقارات
}

export const searchContext = createContext<SearchContextType>({} as SearchContextType);

const Layout = () => {
    const [search, setSearch] = useState<SearchFilters>({ location: '', type: '', price: '' });
    const [allProperties, setAllProperties] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. جلب البيانات مرة واحدة للموقع كاملاً
    useEffect(() => {
        getProperties().then((data) => {
            setAllProperties(data);
            setFilteredData(data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    // 2. الفلترة المركزية (تعمل تلقائياً عند أي تغيير في البحث)
    useEffect(() => {
        const words = Object.values(search).filter(w => w !== "" && !w.includes("حدد"));
        const results = allProperties.filter(item => 
            words.every(word => `${item.location}${item.type}${item.price}`.includes(word))
        );
        setFilteredData(results);
    }, [search, allProperties]);

    return (
        <searchContext.Provider value={{ search, setSearch, filteredData, loading, allProperties }}>
            <div>
                <Outlet />
            </div>
        </searchContext.Provider>
    );
};

export default Layout;