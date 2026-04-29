import {type Property } from "../types/property";

const BASE_URL = "http://localhost:5000";

interface Props {
  property: Property;
  lang: "ar" | "en";
}

export default function PropertyCard({ property, lang }: Props) {
  const ar = lang === "ar";

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:-translate-y-1 transition-transform duration-300 border border-blue-50">
      {/* الصورة */}
      <div className="h-52 bg-blue-100 overflow-hidden">
        {property.images.length > 0 ? (
          <img
            src={`${BASE_URL}${property.images[0]}`}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-blue-300 text-5xl">
            🏠
          </div>
        )}
      </div>

      {/* المحتوى */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1">
          {ar ? property.title : property.titleEn || property.title}
        </h3>

        <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
          📍 {ar ? property.city : property.cityEn || property.city}
          {property.address && ` - ${ar ? property.address : property.addressEn || property.address}`}
        </p>

        {/* التفاصيل */}
        <div className="flex gap-4 text-sm text-gray-500 border-t border-b border-gray-100 py-3 mb-3">
          {property.rooms && <span>🛏 {property.rooms} {ar ? "غرف" : "Beds"}</span>}
          {property.bathrooms && <span>🚿 {property.bathrooms} {ar ? "حمام" : "Bath"}</span>}
          {property.area && <span>📐 {property.area} {ar ? "م²" : "m²"}</span>}
        </div>

        {/* السعر والزر */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-blue-600 font-black text-xl">
              {property.price?.toLocaleString()}
            </span>
            <span className="text-gray-400 text-xs mr-1">
              {ar ? "ل.س" : "SYP"}
            </span>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            {ar ? "التفاصيل" : "Details"}
          </button>
        </div>
      </div>
    </div>
  );
}