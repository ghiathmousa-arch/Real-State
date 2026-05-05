import React, { useState, useMemo } from 'react';
import { MdSearch, MdLocationOn, MdChevronLeft, MdChevronRight } from "react-icons/md";
import PropertyActions from '../PropertyActions/PropertyActions';

interface Property {
  _id: string; title: string; category: string; area: number;
  city: string; address: string; price: number; status: string; images: string[];
}

interface Props {
  data: Property[];
  loading: boolean;
  refreshData: () => void;
}

const PropertiesTable = ({ data, loading, refreshData }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("الكل");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const BACKEND_URL = "http://localhost:5000";

  const filteredData = useMemo(() => {
    return (data || []).filter(item => {
      const matchesSearch =
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = filterCity === "الكل" || item.city === filterCity;
      return matchesSearch && matchesCity;
    });
  }, [data, searchTerm, filterCity]);

  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  return (
    <div className="mt-10 animate-in fade-in duration-700" dir="rtl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-[#0f2d4a]">قائمة الأصول</h2>
          <p className="text-gray-400 text-sm">إدارة وتتبع المحفظة العقارية</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group w-full sm:w-64">
            <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors size-5" />
            <input
              type="text"
              placeholder="بحث عن عقار..."
              className="w-full pr-10 pl-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50 focus:border-blue-400 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="flex bg-gray-100/50 p-1 rounded-2xl border border-gray-100 overflow-x-auto w-full sm:w-auto scrollbar-hide">
            {["الكل", "دمشق", "حلب", "طرطوس", "اللاذقية", "حماة"].map((city) => (
              <button
                key={city}
                onClick={() => { setFilterCity(city); setCurrentPage(1); }}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterCity === city ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="text-gray-400 text-[13px] uppercase tracking-wider border-b border-gray-50">
                <th className="px-8 py-6 font-semibold">العقار</th>
                <th className="px-4 py-6 font-semibold text-center">الموقع</th>
                <th className="px-4 py-6 font-semibold text-center">السعر</th>
                <th className="px-4 py-6 font-semibold text-center">الحالة</th>
                <th className="px-8 py-6 font-semibold text-left">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-gray-300 animate-pulse font-bold">جاري جلب البيانات...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center text-gray-400">لا توجد نتائج تطابق بحثك</td></tr>
              ) : (
                currentData.map((p) => {
                  const firstImg = p.images?.find(img => img && !img.includes('undefined'));
                  return (
                    <tr key={p._id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={firstImg ? `${BACKEND_URL}${firstImg}` : 'https://placehold.co/150?text=No+Image'}
                            className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-500"
                            alt={p.title}
                          />
                          <div>
                            <h3 className="font-bold text-[#0f2d4a] text-sm">{p.title}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-[10px] mt-1">
                              <span className="bg-gray-100 px-2 py-0.5 rounded-md font-medium">{p.category}</span>
                              <span>•</span>
                              <span>{p.area} م²</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <div className="inline-flex items-center gap-1 text-[#0f2d4a] font-semibold text-sm">
                          <MdLocationOn className="text-red-400 size-4" />
                          {p.city}
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className="text-sm font-black text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/30">
                          {p.price?.toLocaleString()} <span className="text-[10px] mr-0.5 uppercase">ل.س</span>
                        </span>
                      </td>
                      <td className="px-4 py-5 text-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold ${p.status === 'active' ? 'bg-green-500 text-white shadow-sm shadow-green-100' : 'bg-gray-100 text-gray-400'}`}>
                          {p.status === 'active' ? 'نشط' : 'معلق'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <PropertyActions
                          propertyId={p._id}
                          propertyTitle={p.title}
                          propertyData={p}
                          onActionSuccess={refreshData}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-white border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 border border-gray-100 rounded-xl disabled:opacity-20 hover:bg-gray-50 text-gray-400 transition-all"
            >
              <MdChevronRight size={22} />
            </button>
            <span className="text-xs font-bold text-gray-500 mx-2">صفحة {currentPage} من {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 border border-gray-100 rounded-xl disabled:opacity-20 hover:bg-gray-50 text-gray-400 transition-all"
            >
              <MdChevronLeft size={22} />
            </button>
          </div>
          <div className="text-[11px] font-medium text-gray-400">إظهار {currentData.length} من {filteredData.length} عقار</div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesTable;