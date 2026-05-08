import React from 'react';
import {
  MdClose, MdLocationOn, MdSquareFoot,
  MdAttachMoney, MdDescription, MdOutlineMeetingRoom,
  MdLayers, MdMeetingRoom, MdCheckCircle, MdInfoOutline
} from "react-icons/md";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onEditClick: () => void;
}

const PropertyDetailsModal = ({ isOpen, onClose, property, onEditClick }: Props) => {
  if (!isOpen || !property) return null;

  const BACKEND_URL = "http://localhost:5000";
  const formatPrice = (price: number) => price?.toLocaleString('en-US');

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />

      <div className="relative bg-[#fcfdfe] h-full w-full max-w-xl shadow-2xl animate-in slide-in-from-left duration-500 border-r border-white/20 shadow-blue-900/20 flex flex-col">

        {/* Header Image */}
        <div className="relative h-56 sm:h-80 w-full shrink-0">
          <img
            src={property.images?.[0] ? `${BACKEND_URL}${property.images[0]}` : 'https://via.placeholder.com/800x600'}
            className="w-full h-full object-cover"
            alt={property.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f2d4a] via-transparent to-transparent opacity-90" />

          <button onClick={onClose} className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl">
            <MdClose size={24} />
          </button>

          <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-8 text-white text-right">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="px-3 py-1 bg-blue-500 rounded-lg text-[10px] font-black uppercase tracking-wider">{property.category}</span>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${property.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}>
                {property.status === 'active' ? 'نشط' : 'معلق'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight">{property.title}</h2>
            <div className="flex items-center gap-1 text-blue-200 mt-1 sm:mt-2 font-medium">
              <MdLocationOn size={16} />
              <span className="text-xs sm:text-sm">{property.city} - {property.address}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 sm:space-y-8 text-right" dir="rtl">

          {/* السعر والمساحة */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-green-50 text-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <MdAttachMoney size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter">السعر</p>
                <p className="text-sm sm:text-lg font-black text-[#0f2d4a] truncate">{formatPrice(property.price)} <small className="text-[9px] sm:text-[10px]">ل.س</small></p>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
                <MdSquareFoot size={20} />
              </div>
              <div>
                <p className="text-gray-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter">المساحة</p>
                <p className="text-sm sm:text-lg font-black text-[#0f2d4a]">{property.area} <small className="text-[9px] sm:text-[10px]">م²</small></p>
              </div>
            </div>
          </div>

          {/* المواصفات */}
          <section className="space-y-3 sm:space-y-4">
            <h4 className="text-[#0f2d4a] font-black flex items-center gap-2 text-base sm:text-lg">
              <MdInfoOutline className="text-blue-600" /> المواصفات
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: "الغرف", value: property.rooms || "—", icon: <MdOutlineMeetingRoom /> },
                { label: "الطابق", value: property.floor || "الثالث", icon: <MdLayers /> },
                { label: "الفرش", value: property.isFurnished ? "مفروش" : "خالي", icon: <MdMeetingRoom /> },
                { label: "الملكية", value: property.ownership || "طابو", icon: <MdCheckCircle /> },
              ].map((item, idx) => (
                <div key={idx} className="p-3 sm:p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white transition-all group">
                  <div className="text-blue-500/50 group-hover:text-blue-600 mb-1 transition-colors text-base sm:text-lg">{item.icon}</div>
                  <p className="text-gray-400 text-[9px] font-bold">{item.label}</p>
                  <p className="text-[#0f2d4a] text-xs font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* الوصف */}
          <section className="space-y-3 sm:space-y-4">
            <h4 className="text-[#0f2d4a] font-black flex items-center gap-2 text-base sm:text-lg">
              <MdDescription className="text-blue-600" /> الوصف
            </h4>
            <p className="p-4 sm:p-6 bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 text-gray-500 text-sm leading-relaxed">
              {property.description || "لا يوجد وصف إضافي"}
            </p>
          </section>
        </div>

        {/* زر التعديل */}
        <div className="shrink-0 px-5 sm:px-8 py-4 sm:py-6 bg-[#fcfdfe] border-t border-gray-100">
          <button
            onClick={onEditClick}
            className="w-full py-4 sm:py-5 bg-[#0f2d4a] text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-base sm:text-lg shadow-2xl shadow-blue-900/40 hover:bg-blue-900 transition-all active:scale-[0.98]"
          >
            تعديل بيانات هذا العقار
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;