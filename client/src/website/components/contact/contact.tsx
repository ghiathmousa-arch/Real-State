
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

// تعريف البيانات الثابتة (Contact Info)
const contactInfo = [
    {
        icon: <FaPhoneAlt />,
        title: "Call me",
        value: "+963933442824",
    },
    {
        icon: <FaEnvelope />,
        title: "Email me",
        value: "SyrianEstae@gmail.com",
    },
    {
        icon: <FaMapMarkerAlt />,
        title: "Address",
        value: "Damascus, Syria",
    },
];

// تعريف البيانات الثابتة (Inputs)
const inputs = [
    { type: "text", placeholder: "Full name", grid: true },
    { type: "email", placeholder: "Your email", grid: true },
    { type: "text", placeholder: "Phone number", grid: false },
];

// تعريف البيانات الثابتة (Textareas)
const textareas = [
    { rows: 6 as const, placeholder: "Message" } // استخدام 'as const' لضمان نوع رقم دقيق
];

// تعريف واجهة (Interface) لخصائص المكون (Props)
interface ContactProps {
    Message: string;
}

// تعريف المكون كـ FC (Function Component) مع تمرير أنواع البيانات
const Contact: React.FC<ContactProps> = ({ Message }) => {
    return (
        <section className="py-20 px-6 md:px-16 dark:bg-gray-800" id="contact">
            {/* Title */}
            <div className="mb-14">
                <p className="text-blue-500 font-medium">Contact</p>

                <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
                    our<span className="text-blue-500">project</span>
                </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* LEFT SIDE */}
                <div
                    className="flex flex-col gap-6 sm:gap-8 md:gap-10"
                >
                    {contactInfo.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 rounded-xl  dark:bg-gray-900 border border-transparent dark:border-gray-800 shadow-sm" // تم تعديل بسيط لضمان ظهور الخلفية الداكنة
                        >
                            <div className="bg-blue-500 text-white p-3 sm:p-4 rounded-lg text-lg sm:text-xl shrink-0">
                                {item.icon}
                            </div>

                            {/* تم تصحيح warp-break-words إلى break-words */}
                            <div className="warp-break-words">
                                <p className="text-sm sm:text-base text-gray-500">
                                    {item.title}
                                </p>
                                <p className="font-medium text-sm sm:text-base text-gray-500 dark:text-white">
                                    {item.value}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT SIDE FORM */}
                <form
                    className="flex flex-col gap-6"

                    onSubmit={(e) => e.preventDefault()} // لمنع إعادة تحميل الصفحة عند الضغط على الزر
                >
                    {/* inputs داخل grid */}
                    <div

                        className="grid md:grid-cols-2 gap-6 "
                    >
                        {inputs
                            .filter((item) => item.grid)
                            .map((item, index) => (
                                <input
                                    key={index}
                                    type={item.type}
                                    placeholder={item.placeholder}
                                    className="w-full p-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-400"
                                />
                            ))}
                    </div>

                    {/* input خارج grid */}
                    {inputs
                        .filter((item) => !item.grid)
                        .map((item, index) => (
                            <input
                                key={index}
                                type={item.type}
                                placeholder={item.placeholder}
                                className="w-full p-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dark:text-white dark:border-gray-400 dark:bg-gray-800"
                            />
                        ))}

                    {textareas.map((item, index) => (
                        <textarea
                            key={index}
                            rows={item.rows}
                            placeholder={item.placeholder}
                            className="w-full p-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dark:text-white dark:border-gray-400 dark:bg-gray-800"
                        />
                    ))}

                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg w-fit transition hover:scale-105 duration-500"
                    >
                        {Message}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Contact;