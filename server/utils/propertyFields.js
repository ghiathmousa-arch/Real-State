// دوال التحقق المشتركة لبيانات العقار — بتستعملها راوتات العقارات (إضافة/تعديل)
// وراوتات "اعرض عقارك" (طلب الزائر + تحويله لعقار) بدل ما تتكرر بكل ملف.

const { CITIES, CATEGORIES } = require("../constants/property");

// ── التحقق من السعر ────────────────────────────────────────
// كل الأسعار بالمنصة بالدولار الأمريكي (USD). القيمة الفاضية = null ("السعر عند الطلب")
const MAX_PRICE_USD = 100_000_000;
const parsePrice = (v) => {
  if (v === undefined || v === null || String(v).trim() === "") return { value: null };
  const n = Number(v);
  if (!Number.isFinite(n))
    return { error: "السعر لازم يكون رقم (بالدولار الأمريكي)" };
  if (n < 0)
    return { error: "السعر ما بيصير يكون سالب" };
  if (n > MAX_PRICE_USD)
    return { error: "السعر أكبر من 100,000,000 دولار — تأكد إنك كاتبه بالدولار مو بالليرة" };
  return { value: n };
};

// ── أسعار الإيجار ومفروش ──────────────────────────────────────
// الفورم بيبعت الحقول مسطّحة (FormData): rentDaily / rentWeekly / rentMonthly / rentYearly
const RENT_PERIODS = ["daily", "weekly", "monthly", "yearly"];
const RENT_FIELDS = { daily: "rentDaily", weekly: "rentWeekly", monthly: "rentMonthly", yearly: "rentYearly" };
const RENT_LABELS = { daily: "اليومي", weekly: "الأسبوعي", monthly: "الشهري", yearly: "السنوي" };
const EMPTY_RENT_PRICES = { daily: null, weekly: null, monthly: null, yearly: null };

// كل سعر بيمرّ على parsePrice.
// current = الأسعار القديمة (تعديل): الحقل ما انبعت = يضل القديم، انبعت "" = null
const parseRentPrices = (body, current = EMPTY_RENT_PRICES) => {
  const value = {};
  for (const period of RENT_PERIODS) {
    const raw = body[RENT_FIELDS[period]];
    if (raw === undefined) {
      value[period] = current?.[period] ?? null;
      continue;
    }
    const parsed = parsePrice(raw);
    if (parsed.error) return { error: `السعر ${RENT_LABELS[period]}: ${parsed.error}` };
    value[period] = parsed.value;
  }
  return { value };
};

// "furnished" / "unfurnished" / أي شي تاني أو فاضي = null (غير محدد)
const FURNISHED_VALUES = ["furnished", "unfurnished"];
const parseFurnished = (v) => (FURNISHED_VALUES.includes(v) ? v : null);

// البيع بيستعمل price، الإيجار بيستعمل rentPrices — الطرف التاني دايماً null
const parseListingPrices = (b) => {
  const isRent = b.type === "rent";
  const price = isRent ? { value: null } : parsePrice(b.price);
  if (price.error) return { error: price.error };
  const rentPrices = isRent ? parseRentPrices(b) : { value: { ...EMPTY_RENT_PRICES } };
  if (rentPrices.error) return { error: rentPrices.error };
  return { price: price.value, rentPrices: rentPrices.value };
};

// ── الاسم الإنجليزي للمدينة والفئة ────────────────────────────
// cityEn و categoryEn ما بيجوا من الفورم — السيرفر بيحسبهن من القوائم الثابتة
// حسب القيمة العربية، عشان ما يصير في عقارات إنجليزيتها فاضية أو مكتوبة غلط
const findEn = (list, ar) => list.find((item) => item.ar === String(ar ?? "").trim())?.en ?? null;
const CITY_ERROR_MSG = "المدينة غير معروفة — اختار مدينة من القائمة";
const CATEGORY_ERROR_MSG = "الفئة غير معروفة — اختار فئة من القائمة";

const toNum = (v) => (v !== undefined && v !== null && v !== "" ? Number(v) : null);
const toArr = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  return v.split(",").map((f) => f.trim()).filter((f) => f);
};

// ── بيانات عقار جديد ──────────────────────────────────────────
// بتتحقق من body (متل POST /api/properties) وبترجّع { data } جاهز لـ Property.create،
// أو { error } برسالة عربية. user = مين أضافه (createdBy + action.by)؛ السب أدمن ما بيحط isFeatured.
const buildNewPropertyData = (b, images, user) => {
  if (!b.title || !b.city || !b.category || !b.type)
    return { error: "العنوان والمدينة والفئة والنوع مطلوبة" };

  const prices = parseListingPrices(b);
  if (prices.error) return { error: prices.error };

  const cityEn = findEn(CITIES, b.city);
  if (!cityEn) return { error: CITY_ERROR_MSG };
  const categoryEn = findEn(CATEGORIES, b.category);
  if (!categoryEn) return { error: CATEGORY_ERROR_MSG };

  return {
    data: {
      title: b.title,
      titleEn: b.titleEn || "",
      description: b.description,
      descriptionEn: b.descriptionEn || "",
      category: String(b.category).trim(),
      categoryEn,
      type: b.type,
      price: prices.price,
      rentPrices: prices.rentPrices,
      furnished: parseFurnished(b.furnished),
      city: String(b.city).trim(),
      cityEn,
      area: toNum(b.area),
      rooms: toNum(b.rooms),
      bathrooms: toNum(b.bathrooms),
      address: b.address || "",
      addressEn: b.addressEn || "",
      images,
      features: toArr(b.features),
      featuresEn: toArr(b.featuresEn),
      videoUrl: b.videoUrl || "", // رابط فيديو يوتيوب تبع العقار
      isFeatured: user.role === "admin" && (b.isFeatured === true || b.isFeatured === "true"),
      status: b.status || "active",
      // بينكتب مرة وحدة وما بيتغيّر (بعكس action.by)
      createdBy: { id: user._id, name: user.name },
      action: {
        type: "added",
        by: user.name,
        at: new Date()
      }
    },
  };
};

module.exports = {
  MAX_PRICE_USD,
  parsePrice,
  RENT_PERIODS,
  RENT_FIELDS,
  EMPTY_RENT_PRICES,
  parseRentPrices,
  FURNISHED_VALUES,
  parseFurnished,
  parseListingPrices,
  findEn,
  CITY_ERROR_MSG,
  CATEGORY_ERROR_MSG,
  toNum,
  toArr,
  buildNewPropertyData,
};
