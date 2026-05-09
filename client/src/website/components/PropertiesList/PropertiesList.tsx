import { LuArrowBigRightDash } from "react-icons/lu";

// 🌍 i18n
import { useTranslation } from "react-i18next";

// 🎨 Icons
import { IoLocationOutline } from "react-icons/io5";
import { LuBedSingle } from "react-icons/lu";
import { CiRuler } from "react-icons/ci";

/**
 * 📦 نوع بيانات العقار
 */
interface Property {
    _id: string;
    title: string;
    city: string;
    price: number;
    area: number;
    rooms: number;

    // 🏷️ نوع العقار
    type: "sale" | "rent";

    image: string;
}

/**
 * 📦 Props الخاصة بالـ component
 */
interface Props {
    properties: Property[];
}

/**
 * 🏠 Component عرض العقارات
 */
const PropertiesList: React.FC<Props> = ({ properties }) => {

    // 🌍 Hook الترجمة
    const { t } = useTranslation();

    return (
        <section
            id="PropertiesList"
            className="py-10 px-6 dark:bg-gray-800"
        >

            {/* 🔹 Header */}
            <div className="flex justify-between items-center mb-8">

                {/* 🏷️ عنوان القسم */}
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-sky-700 border-b-2 md:border-b-4 border-sky-700 pb-1 text-center sm:text-left">

                    {/* 🌍 ترجمة العنوان */}
                    {t("properties.allEstates")}
                </h1>

                {/* 🔘 زر عرض النتائج */}
                <button className="flex items-center gap-1 text-sm sm:text-base md:text-lg text-sky-600 hover:underline border rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 bg-amber-100 transition">

                    {/* 🌍 ترجمة الزر */}
                    {t("properties.showAllResults")} <LuArrowBigRightDash />
                </button>
            </div>

            {/* 🔹 Grid العقارات */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* 🔁 Loop على العقارات */}
                {properties.map((property) => (

                    <div
                        key={property._id}
                        className="bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow hover:shadow-lg transition"
                    >

                        {/* 🖼️ صورة العقار */}
                        <div className="relative">

                            <img
                                src={property.image}
                                alt={property.title}
                                className="w-full h-48 object-cover"
                            />

                            {/* 🏷️ نوع العقار */}
                            <span className="absolute top-2 right-2 bg-sky-600 text-white text-xs px-2 py-1 rounded">

                                {
                                    property.type === "sale"
                                        ? t("properties.sale")
                                        : t("properties.rent")
                                }

                            </span>
                        </div>

                        {/* 📄 معلومات العقار */}
                        <div className="p-4">

                            {/* 🏠 عنوان العقار */}
                            <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-white">
                                {property.title}
                            </h3>

                            {/* 📍 المدينة */}
                            <div className="flex items-center text-gray-500 dark:text-gray-300 text-sm mb-3 gap-1">

                                <IoLocationOutline />

                                <span>
                                    {property.city}
                                </span>
                            </div>

                            <hr className="mb-3 dark:border-gray-600" />

                            {/* 📊 تفاصيل العقار */}
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">

                                {/* 📐 المساحة */}
                                <div className="flex items-center gap-1">

                                    <CiRuler />

                                    <span>
                                        {property.area}{" "}
                                        {t("properties.squareMeter")}
                                    </span>
                                </div>

                                {/* 🛏️ عدد الغرف */}
                                <div className="flex items-center gap-1">

                                    <LuBedSingle />

                                    <span>
                                        {property.rooms}
                                    </span>
                                </div>
                            </div>

                            {/* 💰 السعر */}
                            <div className="text-sky-700 font-bold text-lg">

                                {property.price.toLocaleString()}{" "}

                                {t("properties.currency")}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default PropertiesList;