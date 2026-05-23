import React, { useState, useMemo } from 'react';
import { MdSearch, MdChevronLeft, MdChevronRight, MdHomeWork } from "react-icons/md";
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

const API_URL = import.meta.env.VITE_API_URL || "";
const BASE_URL = API_URL.replace(/\/api\/?$/, "");
const CITIES = ["الكل", "دمشق", "حلب", "طرطوس", "اللاذقية", "حماة"];

const PropertiesTable = ({ data, loading, refreshData }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("الكل");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredData = useMemo(() => {
    return (data || []).filter(item => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = item.title?.toLowerCase().includes(term) || item.city?.toLowerCase().includes(term);
      const matchesCity = filterCity === "الكل" || item.city === filterCity;
      return matchesSearch && matchesCity;
    });
  }, [data, searchTerm, filterCity]);

  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const getImgSrc = (images: string[]) => {
    const firstImg = images?.find(img => img && !img.includes('undefined'));
    return firstImg
      ? (firstImg.startsWith('http') ? firstImg : `${BASE_URL}/${firstImg.replace(/^\//, '')}`)
      : null;
  };

  const formatPrice = (price: number) =>
    price > 1000000 ? (price / 1000000).toFixed(1) + 'M' : price?.toLocaleString();

  return (
    <div className="mt-6 sm:mt-10 w-full" dir="rtl">

      {/* البحث والفلاتر */}
      <div className="flex flex-col gap-4 mb-6 px-1">
        <div className="relative">
          <MdSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
          <input
            type="text"
            placeholder="بحث عن عقار..."
            className="w-full pr-11 pl-4 py-3 bg-white border border-gray-100 rounded-2xl text-[12px] focus:ring-2 focus:ring-blue-100 outline-none shadow-sm font-bold transition-all"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => { setFilterCity(city); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${filterCity === city
                  ? "bg-[#0f2d4a] text-white shadow-md shadow-blue-900/10"
                  : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"
                }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-[11px] font-bold text-gray-300 animate-pulse">جاري جلب البيانات...</div>
      ) : (
        <>
          {/* ── موبايل: كاردات ── */}
          <div className="flex flex-col gap-3 md:hidden">
            {currentData.map((p) => {
              const imgSrc = getImgSrc(p.images);
              return (
                <div key={p._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center gap-3">
                  {/* صورة */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                    {imgSrc
                      ? <img src={imgSrc} className="w-full h-full object-cover" alt={p.title} />
                      : <MdHomeWork size={20} className="text-gray-300" />}
                  </div>

                  {/* المعلومات */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-[#0f2d4a] text-[11px] truncate leading-tight">{p.title}</h3>
                    <p className="text-[9px] text-gray-400 font-bold truncate mt-0.5">{p.city} • {p.category}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[11px] font-black text-blue-600">{formatPrice(p.price)}</span>
                      <span className="text-[8px] text-gray-400 font-bold">ل.س</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                  </div>

                  {/* التحكم */}
                  <div className="shrink-0">
                    <PropertyActions
                      propertyId={p._id}
                      propertyTitle={p.title}
                      propertyData={p}
                      onActionSuccess={refreshData}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── ديسكتوب: جدول ── */}
          <div className="hidden md:block bg-white rounded-[1.5rem] shadow-sm border border-gray-50 overflow-hidden w-full">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="text-gray-400 text-[9px] font-black uppercase tracking-wider border-b border-gray-50 bg-gray-50/30">
                  <th className="px-4 py-4">العقار</th>
                  <th className="px-2 py-4 text-center w-28">الموقع</th>
                  <th className="px-2 py-4 text-center w-32">السعر</th>
                  <th className="px-2 py-4 text-center w-16">الحالة</th>
                  <th className="px-4 py-4 text-left w-32">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {currentData.map((p) => {
                  const imgSrc = getImgSrc(p.images);
                  return (
                    <tr key={p._id} className="hover:bg-blue-50/10 transition-colors group">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                            {imgSrc
                              ? <img src={imgSrc} className="w-full h-full object-cover" alt={p.title} />
                              : <MdHomeWork size={16} className="text-gray-300" />}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-black text-[#0f2d4a] text-[12px] truncate">{p.title}</h3>
                            <p className="text-[8px] text-gray-400 font-bold truncate">{p.city} • {p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className="text-[10px] font-bold text-gray-500">{p.city}</span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className="text-[11px] font-black text-blue-600">{formatPrice(p.price)}</span>
                        <span className="block text-[7px] text-gray-400 font-bold uppercase">ل.س</span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`w-1.5 h-1.5 inline-block rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </td>
                      <td className="px-4 py-4 text-left">
                        <PropertyActions
                          propertyId={p._id}
                          propertyTitle={p.title}
                          propertyData={p}
                          onActionSuccess={refreshData}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* الترقيم */}
      <div className="mt-5 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-xl disabled:opacity-20 text-gray-500 shadow-sm"
          >
            <MdChevronRight size={16} />
          </button>
          <span className="text-[10px] font-black text-[#0f2d4a]">{currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-xl disabled:opacity-20 text-gray-500 shadow-sm"
          >
            <MdChevronLeft size={16} />
          </button>
        </div>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">النتائج: {filteredData.length}</span>
      </div>
    </div>
  );
};

export default PropertiesTable;