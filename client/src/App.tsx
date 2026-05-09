import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardRoutes from "./dashboard/DashboardRoutes";
import Layout from "./website/Layout/Layout";
import HomePage from "./website/pages/HomePage";
import NavBar from "./website/components/NavBar/NavBar";
import BestEstate from "./website/components/BestEstate/BestEstate";
import PropertiesList from "./website/components/PropertiesList/PropertiesList";
import Contact from "./website/components/contact/contact";
import Footer from "./website/components/Footer";
import State from "./website/components/State";
import WhyInvestors from "./website/components/WhyInvestors";
import AiChat from "./website/components/AiChat/AiChat";
import SEO from "./website/components/SEO/SEO";


type Theme = "light" | "dark";


function App() {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem("theme") as Theme) || "light"
  );

  const { i18n } = useTranslation();

  // 🌙 Theme
  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 🌍 Language
  useEffect(() => {
    const currentLang = i18n.language;

    document.documentElement.dir =
      currentLang === "ar" ? "rtl" : "ltr";

    document.documentElement.lang = currentLang;
  }, [i18n.language]);



  return (
    <Routes>
      {/* dashboard */}
      <Route
        path="/dashboard/*"
        element={<DashboardRoutes />}
      />

      {/* website */}
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <>
              <SEO />
              <NavBar
                theme={theme}
                setTheme={setTheme}
              />

              <HomePage />
              <AiChat />
              <BestEstate
              />
              <WhyInvestors />

              <PropertiesList />

              <State />
              <Contact />

              <Footer />
            </>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;