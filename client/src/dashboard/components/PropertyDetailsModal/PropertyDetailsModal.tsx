import React from 'react';
import {
  MdClose, MdLocationOn, MdSquareFoot, MdCategory,
  MdAttachMoney, MdDescription, MdOutlineMeetingRoom,
  MdLayers, MdMeetingRoom, MdCheckCircle, MdInfoOutline
} from "react-icons/md";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  onEditClick: () => void; // تم إضافة الخاصية هنا
}

const PropertyDetailsModal = ({ isOpen, onClose, property, onEditClick }: Props) => {
  if (!isOpen || !property) return null;

  const BACKEND_URL = "http://localhost:5000";
  const formatPrice = (price: number) => price?.toLocaleString('en-US');

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose}></div>

      <div className="relative bg-[#fcfdfe] h-full w-full max-w-xl shadow-2xl animate-in slide-in-from-left duration-500 overflow-y-auto border-r border-white/20 shadow-blue-900/20">

        {/* Header Image Section */}
        <div className="relative h-80 w-full group">
          <img
            src={property.images?.[0] ? `${BACKEND_URL}${property.images[0]}` : 'https://via.placeholder.com/800x600'}
            className="w-full h-full object-cover"
            alt={property.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f2d4a] via-transparent to-transparent opacity-90"></div>

          <button onClick={onClose} className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl">
            <MdClose size={28} />
          </button>

          <div className="absolute bottom-8 right-8 left-8 text-white text-right">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-500 rounded-lg text-[10px] font-black uppercase tracking-wider">{property.category}</span>
              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${property.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}`}>{property.status === 'active' ? 'نشط' : 'معلق'}</span>
            </div>
            <h2 className="text-3xl font-black leading-tight">{property.title}</h2>
            <div className="flex items-center gap-1 text-blue-200 mt-2 font-medium">
              <MdLocationOn size={18} />
              <span className="text-sm">{property.city} - {property.address}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-10 text-right" dir="rtl">
          {/* المالية والمساحة */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0"><MdAttachMoney size={22} /></div>
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">السعر</p>
                <p className="text-lg font-black text-[#0f2d4a]">{formatPrice(property.price)} <small className="text-[10px]">ل.س</small></p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0"><MdSquareFoot size={22} /></div>
              <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">المساحة</p>
                <p className="text-lg font-black text-[#0f2d4a]">{property.area} <small className="text-[10px]">م²</small></p>
              </div>
            </div>
          </div>

          {/* المواصفات الفنية */}
          <section className="space-y-4">
            <h4 className="text-[#0f2d4a] font-black flex items-center gap-2 text-lg"><MdInfoOutline className="text-blue-600" /> المواصفات</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "الغرف", value: property.rooms || "2+1", icon: <MdOutlineMeetingRoom /> },
                { label: "الطابق", value: property.floor || "الثالث", icon: <MdLayers /> },
                { label: "الفرش", value: property.isFurnished ? "مفروش" : "خالي", icon: <MdMeetingRoom /> },
                { label: "الملكية", value: property.ownership || "طابو", icon: <MdCheckCircle /> },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 hover:bg-white transition-all group">
                  <div className="text-blue-500/50 group-hover:text-blue-600 mb-1 transition-colors">{item.icon}</div>
                  <p className="text-gray-400 text-[9px] font-bold">{item.label}</p>
                  <p className="text-[#0f2d4a] text-xs font-bold">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* الوصف والزر السفلي */}
          <section className="space-y-4 pb-24">
            <h4 className="text-[#0f2d4a] font-black flex items-center gap-2 text-lg"><MdDescription className="text-blue-600" /> الوصف</h4>
            <p className="p-6 bg-white rounded-[2rem] border border-gray-100 text-gray-500 text-sm leading-relaxed">{property.description || "لا يوجد وصف إضافي"}</p>
          </section>

          {/* زر التعديل العائم في الأسفل */}
          <div className="absolute bottom-6 inset-x-8">
            <button
              onClick={onEditClick}
              className="w-full py-5 bg-[#0f2d4a] text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-900/40 hover:bg-blue-900 transition-all active:scale-[0.98]"
            >
              تعديل بيانات هذا العقار
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailsModal;