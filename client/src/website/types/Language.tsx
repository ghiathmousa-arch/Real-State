import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "../locales/ar.json"; // ✅ مصحح
import en from "../locales/en.json"; // ✅ مصحح

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar }, // ✅ مصحح
    en: { translation: en }, // ✅ مصحح
  },
  lng: localStorage.getItem("lang") || "ar", // ✅ عربي كـ default
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;