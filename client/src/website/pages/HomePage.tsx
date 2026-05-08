import { createContext, useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import Hero from "../components/Hero";
import WhyInvestors from "../components/WhyInvestors";
import State from "../components/State";
import Footer from "../components/Footer";
import { FaMapMarkerAlt } from "react-icons/fa";
import { BiBuildingHouse } from "react-icons/bi";
import { FaMoneyBills } from "react-icons/fa6";



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

export const searchData = [
    { 
        name: 'location',
        label: 'الموقع',
        icon: <FaMapMarkerAlt className="text-[#003d66]" />,
        options: ['حدد الموقع'] 
        },
    { 
        name: 'type',
        label: 'نوع العقار',
        icon: <BiBuildingHouse  className="text-[#003d66]" />,
        options: ['حدد النوع'] 
        },
    { 
        name: 'price', label: 'السعر',
        icon: <FaMoneyBills className="text-[#003d66]" />,
        options: ['حدد السعر' , '100M - 500M' , '500M+']
    },
];

const HomePage = () => {
    const [search, setSearch] = useState<SearchFilters>({ location: '', type: '', price: '' });
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFilteredProperties = async (filters: SearchFilters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.location && !filters.location.includes("حدد")) params.append('city', filters.location);
            if (filters.type && !filters.type.includes("حدد")) params.append('type', filters.type);
            if (filters.price && !filters.price.includes("حدد")) {
                if (filters.price === "100M - 500M") {
                    params.append('minPrice', '100000000');
                    params.append('maxPrice', '500000000');
                } else if (filters.price == "500M+") {
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
        console.log(filteredData)
    }, [search]);

    return (
        <searchContext.Provider value={{ search, setSearch, filteredData, loading }}>
            <div>
                <Hero />
                <WhyInvestors />
                <State />
                <Footer />
            </div>
        </searchContext.Provider>
    );
};

export default HomePage;