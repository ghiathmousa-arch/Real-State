// المصدر الوحيد لقوائم المدن والفئات — الفرونت إند بيجيبهن من /api/cities و /api/categories
// بدل ما تكون مكررة ومختلفة بأكثر من مكان بالكود

const CITIES = [
  { ar: "دمشق", en: "Damascus" },
  { ar: "ريف دمشق", en: "Rif Dimashq" },
  { ar: "حلب", en: "Aleppo" },
  { ar: "ريف حلب", en: "Rif Aleppo" },
  { ar: "حمص", en: "Homs" },
  { ar: "حماة", en: "Hama" },
  { ar: "اللاذقية", en: "Latakia" },
  { ar: "طرطوس", en: "Tartus" },
  { ar: "إدلب", en: "Idlib" },
  { ar: "درعا", en: "Daraa" },
  { ar: "السويداء", en: "Suwayda" },
  { ar: "القنيطرة", en: "Quneitra" },
  { ar: "دير الزور", en: "Deir ez-Zor" },
  { ar: "الحسكة", en: "Al-Hasakah" },
  { ar: "الرقة", en: "Raqqa" },
];

const CATEGORIES = [
  { ar: "شقة", en: "Apartment" },
  { ar: "منزل", en: "House" },
  { ar: "أرض", en: "Land" },
  { ar: "مزرعة", en: "Farm" },
];

module.exports = { CITIES, CATEGORIES };
