import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardRoutes from "./dashboard/DashboardRoutes";
import Layout from "./website/Layout/Layout";
import NavBar from "./website/components/NavBar/NavBar";
import BestEstate from "./website/components/BestEstate/BestEstate";
import PropertiesList from "./website/components/PropertiesList/PropertiesList";
import Contact from "./website/components/contact/contact";
import Footer from "./website/components/Footer";
import State from "./website/components/State";
import WhyInvestors from "./website/components/WhyInvestors";
import AiChat from "./website/components/AiChat/AiChat";
import SEO from "./website/components/SEO/SEO";
import HomePage from "./website/pages/HomePage";

import PropertyDetailPage from "./website/pages/PropertyDetailPage"; // ✅ جديد
import AllPropertiesPage from "./website/components/Allpropertiespage/Allpropertiespage";

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
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Routes>
      <Route path="/dashboard/*" element={<DashboardRoutes />} />

      <Route path="/" element={<Layout />}>

        {/* ── الرئيسية ── */}
        <Route index element={
          <>
            <SEO />
            <NavBar theme={theme} setTheme={setTheme} />
            <HomePage />
            <AiChat />
            <BestEstate />
            <WhyInvestors />
            <PropertiesList />
            <State />
            <Contact />
            <Footer />
          </>
        } />

        {/* ── كل العقارات ── */}
        <Route path="properties" element={
          <>
            <NavBar theme={theme} setTheme={setTheme} />
            <AllPropertiesPage />
            <Footer />
          </>
        } />

        {/* ── تفاصيل عقار ── */}
        <Route path="properties/:id" element={
          <>
            <NavBar theme={theme} setTheme={setTheme} />
            <PropertyDetailPage />
            <Footer />
          </>
        } />

      </Route>
    </Routes>
  );
}

export default App;