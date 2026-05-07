import { createContext, useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Outlet } from 'react-router-dom';

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
    const [search, setSearch] = useState<SearchFilters>({ location: '', type: '', price: '' });
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFilteredProperties = async (filters: SearchFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            
            if (filters.location && !filters.location.includes("حدد")) {
                params.append('city', filters.location);
            }
            if (filters.type && !filters.type.includes("حدد")) {
                params.append('type', filters.type);
            }
            if (filters.price && !filters.price.includes("حدد")) {
                if (filters.price === "100M - 500M") {
                    params.append('minPrice', '100000000');
                    params.append('maxPrice', '500000000');
                } else if (filters.price === "500M+") {
                    params.append('minPrice', '500000000');
                }
            }

            const response = await fetch(`http://localhost:5000/api/properties?${params.toString()}`);
            
            if (!response.ok) throw new Error("Failed to fetch data");
            
            const data = await response.json();
            setFilteredData(data);
        } catch (error) {
            console.error("Error fetching properties:", error);
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
            <div>
                <Outlet />
            </div>
        </searchContext.Provider>
    );
};

export default Layout;