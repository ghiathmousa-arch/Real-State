import { useTranslation } from "react-i18next";
import { FaStar, FaQuoteRight } from "react-icons/fa6";

// النصوص كلها تأتي من ملفات الترجمة (locales) تحت المفتاح testimonials.items
// استبدلها بشهادات عملاء حقيقية قبل النشر.
const Testimonials = () => {
    const { t } = useTranslation();

    const items = t("testimonials.items", { returnObjects: true });
    const list = Array.isArray(items) ? items : [];

    // لا نعرض القسم أصلاً إذا ما في شهادات
    if (list.length === 0) return null;

    return (
        <section
            id="testimonials"
            className="py-16 px-6 bg-white dark:bg-slate-900 transition-colors"
        >
            <div className="container mx-auto">
                {/* الرأس — بنفس نمط قسم العقارات المميزة */}
                <div className="text-center mb-12">
                    <span className="text-sky-600 dark:text-sky-400 font-bold tracking-widest uppercase text-xs">
                        {t("testimonials.subtitle")}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white mt-2 mb-4">
                        {t("testimonials.title")}
                    </h2>
                    <div className="w-20 h-1.5 bg-sky-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        {t("testimonials.description")}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {list.map((item: any, index: number) => {
                        const rating = Math.max(0, Math.min(5, Number(item.rating) || 5));
                        const initial = String(item.name || "").trim().charAt(0);

                        return (
                            <figure
                                key={index}
                                className="group relative flex flex-col h-full rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900/50 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#004E80]/30 dark:hover:border-sky-400/30 hover:shadow-xl hover:shadow-[#004E80]/10"
                            >
                                {/* علامة اقتباس زخرفية */}
                                <FaQuoteRight
                                    aria-hidden="true"
                                    className="absolute top-7 end-7 text-4xl text-[#004E80]/10 dark:text-sky-400/10 transition-colors group-hover:text-[#004E80]/20 dark:group-hover:text-sky-400/20"
                                />

                                <div
                                    className="flex gap-1 mb-5 text-lg"
                                    role="img"
                                    aria-label={t("testimonials.rating_label", { rating })}
                                >
                                    {Array.from({ length: 5 }).map((_, star) => (
                                        <FaStar
                                            key={star}
                                            aria-hidden="true"
                                            className={
                                                star < rating
                                                    ? "text-amber-400"
                                                    : "text-gray-300 dark:text-gray-600"
                                            }
                                        />
                                    ))}
                                </div>

                                <blockquote className="grow text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {item.quote}
                                </blockquote>

                                <figcaption className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10 flex items-center gap-4">
                                    <div
                                        aria-hidden="true"
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#004E80] dark:bg-sky-500 text-white text-lg font-bold"
                                    >
                                        {initial}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-800 dark:text-white truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {item.role}
                                        </p>
                                    </div>
                                </figcaption>
                            </figure>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
