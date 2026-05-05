
import { useState } from "react";
import PropertyCard from "../PropetyCards";
import type { Property } from "../PropetyCards"; // استدعاء نوع العقار

// 🧠 نعرف الـ Props يلي بدنا إياها من الـ App
interface BestEstateProps {
    properties: Property[];
}

const BestEstate: React.FC<BestEstateProps> = ({ properties }) => {
    const [page, setPage] = useState(1);
    const perPage = 6;

    const start = (page - 1) * perPage;
    const currentItems = properties.slice(start, start + perPage);
    const totalPages = Math.ceil(properties.length / perPage);

    return (
        <section className="p-4 mt-12 dark:bg-gray-800 dark:text-white dark:border-gray-400 " id="featuredProperties">
            <h1 className="place-self-center text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-3 text-center">عقارات مختارة بعناية</h1>
            <p className="place-self-center text-sm sm:text-base md:text-lg lg:text-xl mb-3 text-center">نخبة من العقارات التي تم فحصها وتوثيقها من قبل فريقنا الهندسي لضمان أعلى جودة استثمارية.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
                {currentItems.map((property) => (
                    <PropertyCard key={property._id} property={property} />
                ))}
            </div>

            {/* Pagination يظهر بس إذا كان في أكثر من صفحة */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} className="px-3 py-1 bg-gray-700 rounded">Prev</button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? "bg-sky-600 text-white" : "bg-gray-400"}`}>
                            {i + 1}
                        </button>
                    ))}
                    <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} className="px-3 py-1 bg-gray-700 rounded">Next</button>
                </div>
            )}
        </section>
    );
};

export default BestEstate;