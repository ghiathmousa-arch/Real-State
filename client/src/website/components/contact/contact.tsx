import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Contact: React.FC = () => {
    const { t } = useTranslation();

    // 1️⃣ تعديل الأسماء لتطابق الباك إند (name و phone)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const contactInfo = [
        { icon: <FaPhoneAlt />, title: t("contact.callMe"), value: "+963962840702" },
        { icon: <FaEnvelope />, title: t("contact.emailMe"), value: "Syrianestate0.com" },
        { icon: <FaMapMarkerAlt />, title: t("contact.address"), value: "Damascus, Syria" },
    ];

    // 2️⃣ دالة التحديث
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // 3️⃣ دالة الإرسال
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            const response = await fetch("http://localhost:5000/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", phone: "", message: "" });
                alert("تم إرسال الرسالة بنجاح!");
            } else {
                setStatus("error");
                alert("حدث خطأ أثناء الإرسال");
            }
        } catch (error) {
            setStatus("error");
            alert("حدث خطأ في الاتصال بالسيرفر");
        }
    };

    return (
        <section className="py-20 px-6 md:px-16 dark:bg-gray-800" id="contact">
            <div className="mb-14">
                <p className="text-blue-500 font-medium">{t("contact.title")}</p>
                <h2 className="text-4xl font-bold text-gray-800 dark:text-white">{t("contact.subtitle")}</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* 🔹 LEFT SIDE */}
                <div className="flex flex-col gap-6 sm:gap-8">
                    {contactInfo.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-5 rounded-xl dark:bg-gray-900 border border-transparent dark:border-gray-800 shadow-sm">
                            <div className="bg-blue-500 text-white p-4 rounded-lg text-xl shrink-0">{item.icon}</div>
                            <div>
                                <p className="text-sm text-gray-500">{item.title}</p>
                                <p className="font-medium text-gray-500 dark:text-white">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 🔹 RIGHT SIDE FORM */}
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <input
                            type="text"
                            placeholder={t("contact.fullName")}
                            name="name" // 🔥 طابقنا الاسم مع الباك
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                        />
                        <input
                            type="email"
                            placeholder={t("contact.yourEmail")}
                            name="email" // 🔥 طابقنا الاسم مع الباك
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full p-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    <input
                        type="text"
                        placeholder={t("contact.phoneNumber")}
                        name="phone" // 🔥 طابقنا الاسم مع الباك
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />

                    <textarea
                        rows={6}
                        placeholder={t("contact.message")}
                        name="message" // 🔥 طابقنا الاسم مع الباك
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full p-4 rounded-lg border border-gray-300 outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                    />

                    <button
                        type="submit"
                        disabled={status === "loading"}
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