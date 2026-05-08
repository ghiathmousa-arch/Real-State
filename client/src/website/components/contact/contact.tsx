
import React, { useState } from "react"; // 1️⃣ استدعاء useState

// 🌍 i18n
import { useTranslation } from "react-i18next";

// 🎨 Icons
import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
} from "react-icons/fa";

/**
 * 📦 نوع بيانات معلومات التواصل
 */
interface ContactInfo {
    icon: React.ReactNode;
    title: string;
    value: string;
}

/**
 * 📦 نوع بيانات الـ inputs
 */
interface InputField {
    type: string;
    placeholder: string;
    grid: boolean;
}

/**
 * 📦 نوع بيانات الـ textarea
 */
interface TextAreaField {
    rows: number;
    placeholder: string;
}




const Contact: React.FC = () => {

    // 2️⃣ تعريف الـ State لتخزين البيانات (الاسم، الإيميل، الخ...)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        message: ""
    });

    // حالة للتعامل مع حالة الإرسال (جاري الإرسال، تم النجاح، خطأ)
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    // 🌍 Hook الترجمة
    const { t } = useTranslation();

    /**
     * 📞 بيانات التواصل
     */
    const contactInfo: ContactInfo[] = [
        {
            icon: <FaPhoneAlt />,
            title: t("contact.callMe"),
            value: "+963962840702",
        },
        {
            icon: <FaEnvelope />,
            title: t("contact.emailMe"),
            value: "Syrianestate0.com",
        },
        {
            icon: <FaMapMarkerAlt />,
            title: t("contact.address"),
            value: "Damascus, Syria",
        },
    ];

    /**
     * 📝 بيانات الـ inputs
     */
    const inputs: InputField[] = [
        {
            type: "text",
            placeholder: t("contact.fullName"),
            grid: true,
        },
        {
            type: "email",
            placeholder: t("contact.yourEmail"),
            grid: true,
        },
        {
            type: "text",
            placeholder: t("contact.phoneNumber"),
            grid: false,
        },
    ];

    /**
     * 📝 بيانات الـ textarea
     */
    const textareas: TextAreaField[] = [
        {
            rows: 6,
            placeholder: t("contact.message"),
        },
    ];

    // 3️⃣ دالة لتحديث البيانات عند الكتابة في أي حقل
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 4️⃣ دالة الإرسال للباك اند
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // منع تحديث الصفحة
        setStatus("loading"); // تفعيل حالة التحميل

        try {
            // استبدل هذا الرابط برابط الـ API الخاص بك
            //الApi هاد وهمي
            const response = await fetch("https://your-backend-api.com/send-email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData), // تحويل البيانات إلى JSON
            });

            if (response.ok) {
                setStatus("success");
                setFormData({ fullName: "", email: "", phoneNumber: "", message: "" }); // تفريغ الحقول
                alert("تم إرسال الرسالة بنجاح!"); // أو يمكنك استخدام toast بدلاً من alert
            } else {
                setStatus("error");
                alert("حدث خطأ أثناء الإرسال");
            }
        } catch (error) {
            setStatus("error");
            console.error("Error:", error);
            alert("حدث خطأ في الاتصال");
        }
    };

    return (
        <section
            className="py-20 px-6 md:px-16 dark:bg-gray-800"
            id="contact"
        >
            {/* 🔹 Title */}
            <div className="mb-14">
                <p className="text-blue-500 font-medium">
                    {t("contact.title")}
                </p>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
                    {t("contact.subtitle")}
                </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* 🔹 LEFT SIDE */}
                <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
                    {contactInfo.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 rounded-xl dark:bg-gray-900 border border-transparent dark:border-gray-800 shadow-sm"
                        >
                            <div className="bg-blue-500 text-white p-3 sm:p-4 rounded-lg text-lg sm:text-xl shrink-0">
                                {item.icon}
                            </div>
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

                {/* 🔹 RIGHT SIDE FORM */}
                <form
                    className="flex flex-col gap-6"
                    onSubmit={handleSubmit} // 5️⃣ ربط دالة الإرسال هنا
                >
                    {/* 📝 Inputs داخل Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {inputs
                            .filter((item) => item.grid)
                            .map((item, index) => (
                                <input
                                    key={index}
                                    type={item.type}
                                    placeholder={item.placeholder}
                                    // 6️⃣ الربط مع البيانات (Two-way binding)
                                    // لاحظ أننا نستخدم name="fullName" للعنصر الأول وهكذا...
                                    name={index === 0 ? "fullName" : "email"}
                                    value={index === 0 ? formData.fullName : formData.email}
                                    onChange={handleChange}
                                    className="w-full p-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-400"
                                />
                            ))}
                    </div>

                    {/* 📝 Inputs خارج Grid */}
                    {inputs
                        .filter((item) => !item.grid)
                        .map((item, index) => (
                            <input
                                key={index}
                                type={item.type}
                                placeholder={item.placeholder}
                                name="phoneNumber" // تحديد الاسم
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full p-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dark:text-white dark:border-gray-400 dark:bg-gray-800"
                            />
                        ))}

                    {/* 📝 Textarea */}
                    {textareas.map((item, index) => (
                        <textarea
                            key={index}
                            rows={item.rows}
                            placeholder={item.placeholder}
                            name="message" // تحديد الاسم
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full p-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dark:text-white dark:border-gray-400"
                        />
                    ))}

                    {/* 🔘 Submit Button */}
                    <button
                        type="submit"
                        disabled={status === "loading"} // تعطيل الزر أثناء التحميل
                        className={`bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg w-fit transition hover:scale-105 duration-500 ${status === "loading" ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                        {status === "loading" ? "جاري الإرسال..." : t("contact.sendBTN")}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Contact;