import { useEffect, useState } from "react";
import { type Property } from "./types/property";
import { getProperties } from "./api/properties";
import PropertyCard from "./components/PropertyCard";

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"ar" | "en">("ar");

  useEffect(() => {
    getProperties()
      .then(data => setProperties(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 ${lang === "ar" ? "font-arabic" : ""}`} dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Navbar */}
      <nav className="bg-white shadow-sm py-4 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏠</span>
          <span className="font-bold text-blue-700 text-lg">
            {lang === "ar" ? "سوريا للعقارات" : "Syria Real Estate"}
          </span>
        </div>
        <button
          onClick={() => setLang(l => l === "ar" ? "en" : "ar")}
          className="bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-xl hover:bg-blue-100 transition"
        >
          {lang === "ar" ? "EN" : "عربي"}
        </button>
      </nav>

      {/* العقارات */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {lang === "ar" ? "أحدث العقارات" : "Latest Properties"}
        </h2>

        {loading ? (
          <div className="text-center text-gray-400 py-20">
            {lang === "ar" ? "جاري التحميل..." : "Loading..."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p._id} property={p} lang={lang} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;