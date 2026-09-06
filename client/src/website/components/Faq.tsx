import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuChevronDown } from "react-icons/lu";

// الأسئلة كلها من ملفات الترجمة تحت المفتاح faq.items
// راجع الأجوبة وتأكد إنها تطابق سياستكم الفعلية — بتظهر بنتائج جوجل.
const Faq = () => {
    const { t } = useTranslation();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const items = t("faq.items", { returnObjects: true });
    const list = Array.isArray(items) ? items : [];

    // ملاحظة: الـ FAQPage structured data مبنية من نفس مفاتيح الترجمة هاي
    // ومحقونة ثابتة بالـ HTML وقت البناء (شوف client/vite.config.ts)، حتى تكون
    // موجودة قبل ما يشتغل JavaScript.
    if (list.length === 0) return null;

    return (
        <section
            id="faq"
            className="py-16 px-6 bg-gray-50 dark:bg-gray-900/50 transition-colors"
        >
            <div className="container mx-auto">
                {/* الرأس — بنفس نمط باقي أقسام الصفحة */}
                <div className="text-center mb-12">
                    <span className="text-sky-600 dark:text-sky-400 font-bold tracking-widest uppercase text-xs">
                        {t("faq.subtitle")}
                    </span>
                    <h2 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white mt-2 mb-4">
                        {t("faq.title")}
                    </h2>
                    <div className="w-20 h-1.5 bg-sky-600 mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                        {t("faq.description")}
                    </p>
                </div>

                <div className="mx-auto max-w-3xl flex flex-col gap-4">
                    {list.map((item: any, index: number) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={index}
                                className={`overflow-hidden rounded-2xl border bg-white dark:bg-gray-900/60 transition-all duration-300 ${
                                    isOpen
                                        ? "border-[#004E80]/30 dark:border-sky-400/30 shadow-lg shadow-[#004E80]/5"
                                        : "border-gray-200 dark:border-white/10 hover:border-[#004E80]/20 dark:hover:border-sky-400/20"
                                }`}
                            >
                                <h3>
                                    <button
                                        type="button"
                                        onClick={() => setOpenIndex(isOpen ? null : index)}
                                        aria-expanded={isOpen}
                                        aria-controls={`faq-answer-${index}`}
                                        id={`faq-question-${index}`}
                                        className="flex w-full items-center justify-between gap-4 p-5 text-start font-bold text-gray-800 dark:text-white transition-colors hover:text-[#004E80] dark:hover:text-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#004E80] dark:focus-visible:ring-sky-400"
                                    >
                                        <span className="flex-1">{item.question}</span>
                                        <LuChevronDown
                                            aria-hidden="true"
                                            className={`shrink-0 text-xl transition-transform duration-300 ${
                                                isOpen
                                                    ? "rotate-180 text-[#004E80] dark:text-sky-400"
                                                    : "text-gray-400"
                                            }`}
                                        />
                                    </button>
                                </h3>

                                {/* انتقال ناعم للارتفاع بدون ما نقيس الارتفاع بجافاسكربت */}
                                <div
                                    id={`faq-answer-${index}`}
                                    role="region"
                                    aria-labelledby={`faq-question-${index}`}
                                    className={`grid transition-all duration-300 ease-out ${
                                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                    }`}
                                >
                                    <div className="overflow-hidden">
                                        <p className="px-5 pb-5 leading-relaxed text-gray-600 dark:text-gray-300">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <p className="mt-10 text-center text-gray-500 dark:text-gray-400">
                    {t("faq.more")}{" "}
                    <a
                        href="#contact"
                        className="font-bold text-[#004E80] dark:text-sky-400 underline underline-offset-4 decoration-2 decoration-[#004E80]/30 dark:decoration-sky-400/30 transition-colors hover:decoration-[#004E80] dark:hover:decoration-sky-400"
                    >
                        {t("faq.more_link")}
                    </a>
                </p>
            </div>
        </section>
    );
};

export default Faq;
