import React from "react";
import { IoLocationOutline } from "react-icons/io5";
import { LuBedSingle } from "react-icons/lu";
import { CiRuler } from "react-icons/ci";

interface Property {
    _id: string;
    title: string;
    city: string;
    price: number;
    area: number;
    rooms: number;
    type: string;
    image: string;
}

interface Props {
    properties: Property[];
}

const PropertiesList: React.FC<Props> = ({ properties }) => {
    return (
        <section id="PropertiesList" className="py-10 px-6  dark:bg-gray-800">

            {/* 🔹 Header */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-sky-700 border-b-2 md:border-b-4 border-sky-700 pb-1 text-center sm:text-left">
                    كافة العقارات
                </h1>

                <button className="text-sm sm:text-base md:text-lg text-sky-600 hover:underline border rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-100 transition">
                    عرض كل النتائج →
                </button>
            </div>

            {/* 🔹 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {properties.map((property) => (
                    <div
                        key={property._id}
                        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                    >
                        {/* 🖼️ Image */}
                        <div className="relative">
                            <img
                                src={property.image}
                                alt={property.title}
                                className="w-full h-48 object-cover"
                            />

                            {/* 🔖 Tag */}
                            <span className="absolute top-2 right-2 bg-sky-600 text-white text-xs px-2 py-1 rounded">
                                {property.type === "sale" ? "بيع" : "للإيجار"}
                            </span>
                        </div>

                        {/* 📄 Info */}
                        <div className="p-4">

                            {/* Title */}
                            <h3 className="font-bold text-lg mb-1">
                                {property.title}
                            </h3>

                            {/* Location */}
                            <div className="flex items-center text-gray-500 text-sm mb-3 gap-1">
                                <IoLocationOutline />
                                <span>{property.city}</span>
                            </div>

                            <hr className="mb-3" />

                            {/* Details */}
                            <div className="flex justify-between text-sm text-gray-600 mb-3">

                                <div className="flex items-center gap-1">
                                    <CiRuler />
                                    <span>{property.area} م²</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <LuBedSingle />
                                    <span>{property.rooms}</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="text-sky-700 font-bold text-lg">
                                {property.price.toLocaleString()} ل.س
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PropertiesList;