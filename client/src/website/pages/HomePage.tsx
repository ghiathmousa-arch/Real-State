import { createContext, useState, type Dispatch, type SetStateAction } from "react";
import Hero from "../components/Hero"
interface SearchContextType {
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
}
export const searchContext = createContext<SearchContextType>({search:'' , setSearch:() => {}});

const HomePage = () => {
    const [search , setSearch] = useState<string>('')

    return (
    <searchContext.Provider value={{search , setSearch}}>
        <div>
            <Hero/>
        </div>
    </searchContext.Provider>
    )
}

export default HomePage
