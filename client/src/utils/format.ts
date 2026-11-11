//  المسؤول عن كل دوال التنسيق المشتركة. formatPrice وgetImgSrc وBASE_URL — مكتوبة مرة وحدة وكل المشروع يستورده

// ── BASE_URL ──────────────────────────────────────────────
// جذر السيرفر بييجي من utils/api.ts (المصدر الوحيد) — BASE_URL اسم قديم منخليه للتوافق
import { API_BASE } from "./api"
export const BASE_URL = API_BASE

// ── Cloudinary ───────────────────────────────────────────
// f_auto بيخلي Cloudinary يقرر الصيغة حسب المتصفح (AVIF لكروم، WebP لسفاري)
// وq_auto بيختار أفضل جودة/حجم. أفضل من تثبيت webp وقت الرفع، لأن القرار
// بينعاد لكل متصفح على حدة وبدون ما نعيد رفع ولا صورة.
// الدالة idempotent: إذا الرابط مطبّق عليه التحويل أصلاً بترجعه متل ما هو،
// وأي رابط مش Cloudinary بيمرق بدون تعديل.
export const cdn = (url: string | null | undefined, extra = ""): string => {
  if (!url || !url.includes("/image/upload/")) return url || ""
  if (/\/image\/upload\/[^/]*[fq]_auto/.test(url)) return url
  const transforms = ["f_auto", "q_auto", extra].filter(Boolean).join(",")
  return url.replace("/image/upload/", `/image/upload/${transforms}/`)
}

// ── الصور ────────────────────────────────────────────────
export const getImgSrc = (images: string[]): string | null => {
  const first = images?.find(img => img && !img.includes('undefined'))
  if (!first) return null
  return cdn(first.startsWith('http') ? first : `${BASE_URL}/${first.replace(/^\//, '')}`)
}

// ── ترتيب العقارات ───────────────────────────────────────
// العقارات يلي معها صور بتظهر أول، ويلي بلا صور بتنزل لآخر القائمة.
// Array.prototype.sort ثابت (stable) من ES2019، فالترتيب الأصلي بيضل محفوظ جوّا كل مجموعة.
export const hasImage = (property: any): boolean =>
  Boolean(property?.images?.[0])

export const withImagesFirst = <T,>(properties: T[]): T[] =>
  [...properties].sort((a, b) => Number(hasImage(b)) - Number(hasImage(a)))

// ── السعر ────────────────────────────────────────────────
// كل الأسعار بالمنصة بالدولار الأمريكي (USD) — هي الدالة الوحيدة لعرض السعر بكل المشروع.
// "$250,000" عادةً، "$1.2M" من المليون وطالع، و"—" إذا ما في سعر.
// الأرقام دايماً بصيغة en-US (مش أرقام عربية) عشان تضل متطابقة مع رمز $.
export const formatPrice = (price: number | null | undefined): string => {
  if (price == null || !Number.isFinite(Number(price))) return "—"
  const n = Number(price)
  if (n >= 1_000_000) {
    const millions = (n / 1_000_000).toFixed(1).replace(/\.0$/, "")
    return `$${millions}M`
  }
  return `$${Math.round(n).toLocaleString("en-US")}`
}

// ── أسعار الإيجار ────────────────────────────────────────
// عقار الإيجار إلو لحد 4 أسعار (يومي، أسبوعي، شهري، سنوي) — اللي بيتعبّى بس بيظهر.
export type RentPeriod = "daily" | "weekly" | "monthly" | "yearly"
export type RentPrices = Partial<Record<RentPeriod, number | null>>

export const RENT_PERIODS: RentPeriod[] = ["daily", "weekly", "monthly", "yearly"]

const RENT_LABELS: Record<RentPeriod, { ar: string; en: string }> = {
  daily: { ar: "يوم", en: "Day" },
  weekly: { ar: "أسبوع", en: "Week" },
  monthly: { ar: "شهر", en: "Month" },
  yearly: { ar: "سنة", en: "Year" },
}

export interface RentPriceItem {
  period: RentPeriod
  label: string   // "يوم" / "Day"
  price: string   // "$40"
  text: string    // "$40 / يوم"
}

// المدد المعبّاة بالترتيب (يومي ← سنوي). فاضية = "السعر عند الطلب"
export const formatRentPrices = (
  rentPrices: RentPrices | null | undefined,
  isAr: boolean
): RentPriceItem[] =>
  RENT_PERIODS
    .filter(period => rentPrices?.[period] != null && Number.isFinite(Number(rentPrices[period])))
    .map(period => {
      const label = RENT_LABELS[period][isAr ? "ar" : "en"]
      const price = formatPrice(rentPrices![period])
      return { period, label, price, text: `${price} / ${label}` }
    })

// السعر الرئيسي للكرت: البيع = price، الإيجار = أول مدة متوفرة.
// null = ما في سعر ("السعر عند الطلب")
export const getMainPrice = (
  property: any,
  isAr: boolean
): { price: string; suffix?: string } | null => {
  if (property?.type === "rent") {
    const first = formatRentPrices(property.rentPrices, isAr)[0]
    return first ? { price: first.price, suffix: first.label } : null
  }
  return property?.price != null ? { price: formatPrice(property.price) } : null
}
