import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Contact: React.FC = () => {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";

    const API_URL = import.meta.env.VITE_API_URL;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [showModal, setShowModal] = useState(false);

    const contactInfo = [
        {
            icon: <FaPhoneAlt />,
            title: t("contact.callMe"),
            value: "+963962840702",
            href: "https://wa.me/963962840702"
        },
        {
            icon: <FaEnvelope />,
            title: t("contact.emailMe"),
            value: "syrianestate0@gmail.com",
            href: "https://mail.google.com/mail/?view=cm&to=syrianestate0@gmail.com"
        },
        {
            icon: <FaMapMarkerAlt />,
            title: t("contact.address"),
            value: "Damascus, Syria",
            href: null
        },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const response = await fetch(`${API_URL}/api/contact`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus("success");
                setShowModal(true);
                setFormData({ name: "", email: "", phone: "", message: "" });
            } else {
                setStatus("error");
                setShowModal(true);
            }
        } catch (error) {
            console.error("Contact Error:", error);
            setStatus("error");
            setShowModal(true);
        }
    };

    return (
        <section
            className="py-12 md:py-20 px-4 sm:px-6 md:px-16 bg-white dark:bg-gray-800 transition-colors duration-300 overflow-x-hidden"
            id="contact"
        >
            {/* النافذة المنبثقة */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center transform scale-100 transition-transform">
                        <div className="flex justify-center mb-4">
                            {status === "success" ? (
                                <FaCheckCircle className="text-emerald-500 text-5xl sm:text-6xl animate-bounce" />
                            ) : (
                                <FaTimesCircle className="text-red-500 text-5xl sm:text-6xl animate-pulse" />
                            )}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-800 dark:text-white mb-2">
                            {status === "success" ? (isAr ? "تم الإرسال!" : "Sent!") : (isAr ? "فشل الإرسال" : "Failed")}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6">
                            {status === "success"
                                ? (isAr ? "شكراً لتواصلك معنا، سنرد عليك قريباً." : "We received your message.")
                                : (isAr ? "حدث خطأ غير متوقع، حاول مرة أخرى." : "Something went wrong.")}
                        </p>
                        <button
                            onClick={() => setShowModal(false)}
                            className={`w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 ${status === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
                        >
                            {isAr ? "حسناً" : "OK"}
                        </button>
                    </div>
                </div>
            )}

            <div className="mb-8 md:mb-14">
                <p className="text-blue-500 font-bold uppercase tracking-widest text-xs sm:text-sm mb-2">
                    {t("contact.title")}
                </p>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-800 dark:text-white">
                    {t("contact.subtitle")}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* معلومات التواصل */}
                <div className="flex flex-col gap-4 md:gap-6">
                    {contactInfo.map((item, index) => (
                        <a
                            key={index}
                            href={item.href ?? undefined}
                            target={item.href ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className={`flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-transparent dark:border-gray-700 shadow-sm transition-all ${item.href ? "hover:shadow-md hover:border-blue-100 cursor-pointer" : "cursor-default"}`}
                        >
                            <div className="bg-blue-500 text-white p-3 sm:p-4 rounded-xl text-lg sm:text-xl shrink-0">
                                {item.icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 font-bold mb-1 uppercase">{item.title}</p>
                                <p className="font-bold text-gray-700 dark:text-white leading-none text-sm sm:text-base break-all">
                                    {item.value}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>

                {/* الفورم */}
                <form className="flex flex-col gap-4 md:gap-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder={t("contact.fullName")}
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 sm:p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white dark:border-gray-700 transition-all text-sm sm:text-base"
                        />
                        <input
                            type="email"
                            placeholder={t("contact.yourEmail")}
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-3 sm:p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white dark:border-gray-700 transition-all text-sm sm:text-base"
                        />
                    </div>

                    <input
                        type="text"
                        placeholder={t("contact.phoneNumber")}
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-3 sm:p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white dark:border-gray-700 transition-all text-sm sm:text-base"
                    />

                    <textarea
                        rows={4}
                        placeholder={t("contact.message")}
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full p-3 sm:p-4 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white dark:border-gray-700 transition-all resize-none text-sm sm:text-base"
                    />

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 rounded-xl w-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-none text-sm sm:text-base"
                    >
                        {status === "loading" ? (isAr ? "جاري الإرسال..." : "Sending...") : t("contact.sendBTN")}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Contact;