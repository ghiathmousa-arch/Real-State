import Logo from "/img/real_state_logo-removebg-preview.png";
import React, { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { GrLanguage } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { GiHamburgerMenu } from "react-icons/gi";

//  نوع الثيم (فاتح / غامق)
type Theme = "light" | "dark";

//  أسماء السكاشن (لازم تطابق id بالصفحة)
type Section =
  | "home"
  | "featuredProperties"
  | "PropertiesList"
  | "ourServices"
  | "contact";

//  props القادمة من App
interface NavBarProps {
  theme: Theme; // الثيم الحالي
  setTheme: React.Dispatch<React.SetStateAction<Theme>>; // تغيير الثيم
}

//  نوع عنصر من عناصر النافبار
type NavItem = {
  translationKey: string; // مفتاح الترجمة
  to: `#${Section}`; // الرابط (#section)
};

// 📌 روابط النافبار
const navItems: NavItem[] = [
  { translationKey: "nav.home", to: "#home" },
  { translationKey: "nav.featured", to: "#featuredProperties" },
  { translationKey: "nav.list", to: "#PropertiesList" },
  { translationKey: "nav.services", to: "#ourServices" },
  { translationKey: "nav.contact", to: "#contact" },
];

const NavBar: React.FC<NavBarProps> = ({ theme, setTheme }) => {
  const { t, i18n } = useTranslation();

  //  العنصر النشط (يتغير مع السكرول)
  const [active, setActive] = useState<string>("home");

  //  حالة قائمة الموبايل (فتح/إغلاق)
  const [isOpen, setIsOpen] = useState<boolean>(false);

  //  مراقبة السكاشن (Scroll Spy)
  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id); // تحديث العنصر النشط
          }
        });
      },
      { threshold: 0.6 } // نسبة ظهور السكشن
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect(); // تنظيف
  }, []);

  return (
    <div
      //  تغيير اتجاه الصفحة حسب اللغة
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="fixed top-0 left-0 w-full flex justify-between z-50 items-center bg-white/95 backdrop-blur-md pt-2 px-4 dark:bg-gray-800 dark:text-white"
    >
      {/*  اللوجو */}
      <img src={Logo} alt="logo" className="max-h-12 cursor-pointer" />

      {/*  قائمة الديسكتوب */}
      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <a
            key={item.to}
            href={item.to}
            className={`text-sm hover:text-accent ${item.to === `#${active}` ? "text-sky-500" : ""
              }`}
          >
            {t(item.translationKey)}
          </a>
        ))}
      </div>

      {/*  أزرار الديسكتوب */}
      <div className="hidden md:flex gap-2 items-center">
        {/*  تغيير الثيم */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-2xl p-2"
        >
          {theme === "dark" ? <MdLightMode /> : <MdDarkMode />}
        </button>

        {/*  تغيير اللغة */}
        <button
          onClick={() => {
            const newLang = i18n.language === "ar" ? "en" : "ar";
            i18n.changeLanguage(newLang);
            localStorage.setItem("lang", newLang);
          }}
          className="text-2xl"
        >
          <GrLanguage />
        </button>
      </div>

      {/* 📱 زر الموبايل */}
      <button
        className="md:hidden text-2xl"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <GiHamburgerMenu />
      </button>

      {/*  قائمة الموبايل */}
      {isOpen && (
        <div
          className={`md:hidden fixed top-14 ${i18n.dir() === "rtl" ? "left-0" : "right-0"
            } w-[70%] bg-white dark:bg-gray-800 flex flex-col text-center gap-4 px-4 pb-4 pt-4 shadow-lg rounded-lg`}
        >
          {/*  الروابط */}
          {navItems.map((item) => (
            <a
              key={item.to}
              href={item.to}
              className={`text-sm ${item.to === `#${active}` ? "text-sky-500" : ""
                }`}
              onClick={() => setIsOpen(false)}
            >
              {t(item.translationKey)}
            </a>
          ))}

          {/* ➖ فاصل */}
          <div className="border-t pt-3 flex justify-center gap-6">

            {/* 🌙 زر الثيم (صار داخل القائمة) */}
            <button
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setIsOpen(false);
              }}
              className="text-2xl"
            >
              {theme === "dark" ? <MdLightMode /> : <MdDarkMode />}
            </button>

            {/*  زر اللغة (صار داخل القائمة) */}
            <button
              onClick={() => {
                const newLang = i18n.language === "ar" ? "en" : "ar";
                i18n.changeLanguage(newLang);
                localStorage.setItem("lang", newLang);
                setIsOpen(false);
              }}
              className="text-2xl"
            >
              <GrLanguage />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;