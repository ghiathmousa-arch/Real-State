import React, { useState, useMemo } from 'react';
import { MdSearch, MdLocationOn, MdChevronLeft, MdChevronRight, MdHomeWork } from "react-icons/md";
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

const CITIES = ["الكل", "دمشق", "حلب", "طرطوس", "اللاذقية", "حماة"]

const PropertiesTable = ({ data, loading, refreshData }: Props) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCity, setFilterCity] = useState("الكل")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const BACKEND_URL = "http://localhost:5000"

  const filteredData = useMemo(() => {
    return (data || []).filter(item => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = item.title?.toLowerCase().includes(term) || item.city?.toLowerCase().includes(term)
      const matchesCity = filterCity === "الكل" || item.city === filterCity
      return matchesSearch && matchesCity
    })
  }, [data, searchTerm, filterCity])

  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1

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
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => { setFilterCity(city); setCurrentPage(1) }}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all ${filterCity === city ? "bg-[#0f2d4a] text-white shadow-md shadow-blue-900/10" : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50"
                }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* الجدول الذكي - بدون سكرول وبدون تداخل */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-50 overflow-hidden w-full">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="text-gray-400 text-[9px] font-black uppercase tracking-wider border-b border-gray-50 bg-gray-50/30">
              <th className="px-4 py-4">العقار</th>
              <th className="px-2 py-4 text-center hidden md:table-cell w-28">الموقع</th>
              <th className="px-2 py-4 text-center w-20 sm:w-32">السعر</th>
              <th className="px-2 py-4 text-center hidden sm:table-cell w-16">الحالة</th>
              <th className="px-4 py-4 text-left w-24 sm:w-32">التحكم</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center text-[10px] font-bold text-gray-300 animate-pulse">جاري جلب البيانات...</td></tr>
            ) : (
              currentData.map((p) => {
                const firstImg = p.images?.find(img => img && !img.includes('undefined'))
                return (
                  <tr key={p._id} className="hover:bg-blue-50/10 transition-colors group">
                    {/* عمود العقار: مرن (يتصغر عند الحاجة) */}
                    <td className="px-4 py-4 overflow-hidden">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                          {firstImg ? (
                            <img src={`${BACKEND_URL}${firstImg}`} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <MdHomeWork size={16} className="text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-[#0f2d4a] text-[11px] sm:text-[12px] truncate leading-tight">
                            {p.title}
                          </h3>
                          <p className="text-[8px] text-gray-400 font-bold truncate">
                            {p.city} • {p.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* الموقع: يظهر فقط في الشاشات الكبيرة */}
                    <td className="px-2 py-4 text-center hidden md:table-cell">
                      <span className="text-[10px] font-bold text-gray-500">{p.city}</span>
                    </td>

                    {/* السعر: يأخذ مساحة محددة لمنع الانهيار */}
                    <td className="px-2 py-4 text-center shrink-0">
                      <div className="flex flex-col items-center justify-center whitespace-nowrap">
                        <span className="text-[10px] sm:text-[11px] font-black text-blue-600">
                          {p.price > 1000000 ? (p.price / 1000000).toFixed(1) + 'M' : p.price?.toLocaleString()}
                        </span>
                        <span className="text-[7px] text-gray-400 font-bold uppercase">ل.س</span>
                      </div>
                    </td>

                    {/* الحالة */}
                    <td className="px-2 py-4 text-center hidden sm:table-cell">
                      <span className={`w-1.5 h-1.5 inline-block rounded-full ${p.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    </td>

                    {/* التحكم: محمي بـ min-w-fit لضمان ظهور الأزرار دائماً */}
                    <td className="px-4 py-4 text-left">
                      <div className="flex justify-end items-center">
                        <div className="min-w-fit">
                          <PropertyActions
                            propertyId={p._id}
                            propertyTitle={p.title}
                            propertyData={p}
                            onActionSuccess={refreshData}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

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
  )
}

export default PropertiesTable;