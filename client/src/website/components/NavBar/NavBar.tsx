import Logo from "/img/real_state_logo-removebg-preview.png";
import React, { useEffect, useState } from "react";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { GrLanguage } from "react-icons/gr";
import { useTranslation } from "react-i18next";
import { GiHamburgerMenu } from "react-icons/gi";
import { useNavigate, useLocation } from "react-router-dom";

type Theme = "light" | "dark";

type Section =
  | "home"
  | "featuredProperties"
  | "PropertiesList"
  | "ourServices"
  | "contact";

interface NavBarProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

type NavItem = {
  translationKey: string;
  to: `#${Section}`;
};

const navItems: NavItem[] = [
  { translationKey: "nav.home", to: "#home" },
  { translationKey: "nav.featured", to: "#featuredProperties" },
  { translationKey: "nav.list", to: "#PropertiesList" },
  { translationKey: "nav.services", to: "#ourServices" },
  { translationKey: "nav.contact", to: "#contact" },
];

const NavBar: React.FC<NavBarProps> = ({ theme, setTheme }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState<string>("home");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Scroll Spy (بس بالصفحة الرئيسية)
  useEffect(() => {
    if (location.pathname !== "/") return;

    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname]);

  const handleNavClick = (to: string) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: to } });
    } else {
      const element = document.querySelector(to);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsOpen(false);
  };

  return (
    <div
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="fixed top-0 left-0 w-full flex justify-between z-50 items-center bg-white/95 backdrop-blur-md pt-2 px-4 dark:bg-gray-800 dark:text-white"
    >
      {/* ✅ اللوجو - بكبس عليه بيرجع عالرئيسية */}
      <img
        src={Logo}
        alt="logo"
        className="max-h-12 cursor-pointer"
        onClick={() => {
          navigate("/");
          window.scrollTo({ top: 0, behavior: "smooth" });
          setIsOpen(false);
        }}
      />

      {/* قائمة الديسكتوب */}
      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <button
            key={item.to}
            onClick={() => handleNavClick(item.to)}
            className={`text-sm hover:text-accent cursor-pointer bg-transparent border-none ${
              item.to === `#${active}` && location.pathname === "/"
                ? "text-sky-500"
                : ""
            }`}
          >
            {t(item.translationKey)}
          </button>
        ))}
      </div>

      {/* أزرار الديسكتوب */}
      <div className="hidden md:flex gap-2 items-center">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-2xl p-2"
        >
          {theme === "dark" ? <MdLightMode /> : <MdDarkMode />}
        </button>

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

      {/* زر الموبايل */}
      <button
        className="md:hidden text-2xl"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <GiHamburgerMenu />
      </button>

      {/* قائمة الموبايل */}
      {isOpen && (
        <div
          className={`md:hidden fixed top-14 ${
            i18n.dir() === "rtl" ? "left-0" : "right-0"
          } w-[70%] bg-white dark:bg-gray-800 flex flex-col text-center gap-4 px-4 pb-4 pt-4 shadow-lg rounded-lg`}
        >
          {navItems.map((item) => (
            <button
              key={item.to}
              onClick={() => handleNavClick(item.to)}
              className={`text-sm cursor-pointer bg-transparent border-none ${
                item.to === `#${active}` && location.pathname === "/"
                  ? "text-sky-500"
                  : ""
              }`}
            >
              {t(item.translationKey)}
            </button>
          ))}

          <div className="border-t pt-3 flex justify-center gap-6">
            <button
              onClick={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setIsOpen(false);
              }}
              className="text-2xl"
            >
              {theme === "dark" ? <MdLightMode /> : <MdDarkMode />}
            </button>

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