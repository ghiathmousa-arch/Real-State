import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardRoutes from "./dashboard/DashboardRoutes";
import Layout from "./website/Layout/Layout";
import HomePage from "./website/pages/HomePage";
import NavBar from "./website/components/NavBar/NavBar";
import BestEstate from "./website/components/BestEstate/BestEstate";
import PropertiesList from "./website/components/PropertiesList/PropertiesList";
import type { Property } from "./website/components/PropetyCards";
import Contact from "./website/components/contact/contact";
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

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const currentLang = i18n.language;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLang;
  }, [i18n.language]);
  const myPropertiesData: Property[] = Array.from({ length: 100 }, (_, i) => ({
    _id: String(i),

    // 🇸🇦 عربي
    title: `عقار رقم ${i + 1}`,
    description: "وصف بسيط للعقار",
    category: i % 2 ? "بيع" : "إيجار",
    city: "دمشق",
    features: ["مكيف", "موقف سيارة"],

    // 🇬🇧 إنجليزي
    titleEn: `Property ${i + 1}`,
    descriptionEn: "Simple description",
    categoryEn: i % 2 ? "Sale" : "Rent",
    cityEn: "Damascus",
    featuresEn: ["AC", "Parking"],

    // 📊 بيانات عامة
    price: 100000 + i * 5000,
    area: 120,
    rooms: 3,
    images: [],
  }));
  return (
    <Routes>
      {/* dashboard */}
      <Route path="/dashboard/*" element={<DashboardRoutes />} />

      {/* website */}
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <>
              <NavBar theme={theme} setTheme={setTheme} />

              <HomePage />

              <BestEstate properties={myPropertiesData} />

              <PropertiesList properties={data} />

              <Contact />
            </>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
// // 📦 React Router للتنقل بين الصفحات
// import { Routes, Route } from "react-router-dom";
// // 📦 صفحات الداشبورد
// import DashboardRoutes from "./dashboard/DashboardRoutes";

// // 📦 React hooks
// import { useEffect, useState } from "react";

// // 🧭 Navbar الرئيسي
// import NavBar from "./website/components/NavBar/NavBar";

// // 🌍 i18n (للترجمة)
// import { useTranslation } from "react-i18next";

// // 🏠 Components الموقع
// import BestEstate from "./website/components/BestEstate/BestEstate";
// import PropertiesList from "./website/components/PropertiesList/PropertiesList";
// import Contact from "./website/components/contact/contact";

// // 📦 نوع العقار
// import type { Property } from "./website/components/PropetyCards";

// // 🎨 نوع الثيم
// type Theme = "light" | "dark";

// // 🏡 بيانات تجريبية لعرض العقارات
// const data = [
//   {
//     _id: "1",
//     title: "مجمع البرج التجاري",
//     city: "دمشق - كفرسوسة",
//     price: 2500000000,
//     area: 600,
//     rooms: 5,
//     type: "sale",
//     image: "https://picsum.photos/400/300?1",
//   },
//   {
//     _id: "2",
//     title: "فيلا قرى الأسد",
//     city: "ريف دمشق",
//     price: 1200000000,
//     area: 450,
//     rooms: 4,
//     type: "sale",
//     image: "https://picsum.photos/400/300?2",
//   },
// ];

// function App() {
//   // 🎨 حالة الثيم (light/dark)
//   const [theme, setTheme] = useState<Theme>(
//     (localStorage.getItem("theme") as Theme) || "light"
//   );

//   // 🌍 i18n hook
//   const { i18n } = useTranslation();

//   // 🌙 تطبيق الثيم على كامل الموقع
//   useEffect(() => {
//     document.documentElement.className = theme;
//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   // 🌐 ضبط اتجاه الصفحة حسب اللغة
//   useEffect(() => {
//     const currentLang = i18n.language;
//     document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";
//     document.documentElement.lang = currentLang;
//   }, [i18n.language]);

//   // 🧠 بيانات العقارات (Mock data للـ BestEstate)
//   const myPropertiesData: Property[] = Array.from({ length: 100}, (_, i) => ({
//     _id: String(i),

//     // 🇸🇦 عربي
//     title: `عقار رقم ${i + 1}`,
//     description: "وصف بسيط للعقار",
//     category: i % 2 ? "بيع" : "إيجار",
//     city: "دمشق",
//     features: ["مكيف", "موقف سيارة"],

//     // 🇬🇧 إنجليزي
//     titleEn: `Property ${i + 1}`,
//     descriptionEn: "Simple description",
//     categoryEn: i % 2 ? "Sale" : "Rent",
//     cityEn: "Damascus",
//     featuresEn: ["AC", "Parking"],

//     // 📊 بيانات عامة
//     price: 100000 + i * 5000,
//     area: 120,
//     rooms: 3,
//     images: [],
//   }));

//   return (
//     <Routes>
//       {/* 🧭 dashboard routes */}
//       <Route path="/dashboard/*" element={<DashboardRoutes />} />

//       {/* 🏠 الصفحة الرئيسية */}
//       <Route
//         path="/"
//         element={
//           <div>
//             {/* 🔝 Navbar */}
//             <NavBar theme={theme} setTheme={setTheme} />

//             {/* 🏠 sections */}
//             <BestEstate properties={myPropertiesData} />
//             <PropertiesList properties={data} />
//             <Contact  />
//           </div>
//         }
//       />
//     </Routes>
//   );
// }

// export default App;