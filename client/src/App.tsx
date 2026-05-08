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
import type { Property } from "./website/components/PropetyCards";
import Footer from "./website/components/Footer";
import State from "./website/components/State";
import WhyInvestors from "./website/components/WhyInvestors";

type Theme = "light" | "dark";

const data = [
  {
    _id: "1",
    title: "مجمع البرج التجاري",
    city: "دمشق - كفرسوسة",
    price: 2500000000,
    area: 600,
    rooms: 5,
    type: "sale",
    image: "https://picsum.photos/400/300?1",
  },
  {
    _id: "2",
    title: "فيلا قرى الأسد",
    city: "ريف دمشق",
    price: 1200000000,
    area: 450,
    rooms: 4,
    type: "sale",
    image: "https://picsum.photos/400/300?2",
  },
];

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

  // 🏠 Dummy properties
  const myPropertiesData: Property[] = Array.from(
    { length: 100 },
    (_, i) => ({
      _id: String(i),

      // 🇸🇦 عربي
      title: `عقار رقم ${i + 1}`,
      description: "وصف بسيط للعقار",
      category: i % 2 ? "بيع" : "إيجار",
      city: "دمشق",
      features: ["مكيف", "موقف سيارة"],

      // 🇬🇧 English
      titleEn: `Property ${i + 1}`,
      descriptionEn: "Simple description",
      categoryEn: i % 2 ? "Sale" : "Rent",
      cityEn: "Damascus",
      featuresEn: ["AC", "Parking"],

      // 📊 General
      price: 100000 + i * 5000,
      area: 120,
      rooms: 3,
      images: [],
    })
  );

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
              <NavBar
                theme={theme}
                setTheme={setTheme}
              />

              <HomePage />

              <BestEstate
                properties={myPropertiesData}
              />

              <PropertiesList
                properties={data}
              />
              <WhyInvestors />

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