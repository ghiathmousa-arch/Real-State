import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import Layout from "./website/Layout/Layout";
import NavBar from "./website/components/NavBar/NavBar";
import Footer from "./website/components/Footer";
import HomePage from "./website/pages/HomePage";
import PropertyDetailPage from "./website/pages/PropertyDetailPage";
import AllPropertiesPage from "./website/components/Allpropertiespage/Allpropertiespage";

import SEO from "./website/components/SEO/SEO";
import AiChat from "./website/components/AiChat/AiChat";
import BestEstate from "./website/components/BestEstate/BestEstate";
import PropertiesList from "./website/components/PropertiesList/PropertiesList";
import State from "./website/components/State";
import WhyInvestors from "./website/components/WhyInvestors";
import BrowseByCity from "./website/components/BrowseByCity";
import Testimonials from "./website/components/Testimonials";
import Faq from "./website/components/Faq";
import Contact from "./website/components/contact/contact";

// كل لوحة التحكم (تسجيل دخول، عقارات، رسائل، recharts...) بحزمة منفصلة تُحمَّل بس لما حد يزور /dashboard
// بدل ما تنشحن مع كل زيارة عادية للموقع العام
const DashboardRoutes = lazy(() => import("./dashboard/DashboardRoutes"));

type Theme = "light" | "dark";

function App() {
  const [theme, setTheme] = useState < Theme > (
    (localStorage.getItem("theme") as Theme) || "light"
  );
  const { i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // ✅ جديد: scroll لما نجي من صفحة تانية عبر Navbar
  useEffect(() => {
    if (location.state?.scrollTo) {
      const timer = setTimeout(() => {
        const element = document.querySelector(location.state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
        // ننظّف الـ state عشان ما يتكرر
        window.history.replaceState({}, document.title);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // ✅ جديد: نتحقق إذا كنا بصفحة الموقع (مش Dashboard)
  const isWebsite = !location.pathname.startsWith("/dashboard");

  return (
    <>
      {/* Navbar تظهر بكل صفحات الموقع */}
      {isWebsite && <NavBar theme={theme} setTheme={setTheme} />}

      <Routes>
        <Route
          path="/dashboard/*"
          element={
            <Suspense fallback={<div className="flex items-center justify-center h-screen text-[#004e80] font-bold">جاري التحميل...</div>}>
              <DashboardRoutes />
            </Suspense>
          }
        />

        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <>
                <SEO />
                <HomePage />
                <AiChat />
                <BestEstate />
                <BrowseByCity />
                <PropertiesList />
                <State />
                {/* كل مكوّن حامل الـ id تبعه داخلياً، فما في wrapper بيكرّره */}
                <WhyInvestors />
                <Testimonials />
                <Faq />
                <Contact />
              </>
            }
          />
          <Route path="properties" element={<AllPropertiesPage />} />
          <Route path="properties/:id" element={<PropertyDetailPage />} />
        </Route>
      </Routes>

      {/* Footer تظهر بكل صفحات الموقع */}
      {isWebsite && <Footer />}
    </>
  );
}

export default App;