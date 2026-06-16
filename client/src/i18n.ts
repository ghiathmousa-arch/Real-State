// 📦 استيراد مكتبة i18n الأساسية
import i18n from "i18next";

// 🔗 ربط i18n مع React
import { initReactI18next } from "react-i18next";

// 🌍 ملفات الترجمة
import en from "./website/locales/en.json";
import ar from "./website/locales/ar.json";

/**
 * 🚀 إعداد i18n
 * - resources: اللغات المتوفرة
 * - lng: اللغة الحالية من localStorage
 * - fallbackLng: اللغة الافتراضية إذا ما لقى ترجمة
 */
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },

  // 🌐 اللغة الحالية (محفوظة أو افتراضية)
  lng: localStorage.getItem("lang") || "ar",

  // 🔁 fallback إذا النص غير موجود
  fallbackLng: "ar",

  // 🧹 منع مشاكل escape في النصوص
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;