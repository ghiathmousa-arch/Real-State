import { createContext, useState, type Dispatch, type SetStateAction } from 'react';
import { Outlet } from 'react-router-dom'

interface SearchFilters {
  location: string;
  type: string;
  price: string;
}

interface SearchContextType {
  search: SearchFilters; // تغيير من string إلى object
  setSearch: Dispatch<SetStateAction<SearchFilters>>;
}

// القيمة الابتدائية
const initialValue: SearchFilters = { location: '', type: '', price: '' };

export const searchContext = createContext<SearchContextType>({
  search: initialValue,
  setSearch: () => {}
});
const Layout = () => {
    const [search , setSearch] = useState<SearchFilters>(initialValue)

    return (
        <searchContext.Provider value={{search , setSearch}}>
        <div>
            <Outlet/>
        </div>
    </searchContext.Provider>
    )
}

export default Layout
