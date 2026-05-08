import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardRoutes from "./dashboard/DashboardRoutes";
import Layout from "./website/Layout/Layout";
import HomePage from "./website/pages/HomePage";
import NavBar from "./website/components/NavBar/NavBar";

type Theme = "light" | "dark";

function App() {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "light"
  );
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const currentLang = i18n.language;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  return (
    <Routes>
      {/* 1️⃣ مسارات الداشبورد */}
      <Route path="/dashboard/*" element={<DashboardRoutes />} />

      {/* 2️⃣ مسارات الموقع */}
      <Route path="/" element={<Layout />}>
        {/* الصفحة الرئيسية */}
        <Route
          index
          element={
            <>
              <NavBar theme={theme} setTheme={setTheme} />
              <HomePage />
            </>
          }
        />

        {/* إذا أردت صفحة أخرى بـ NavBar مختلف أو بدون NavBar */}
        {/* <Route path="about" element={<AboutPage />} /> */}
      </Route>
    </Routes>
  );
}

export default App;