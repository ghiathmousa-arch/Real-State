//  المسؤول عن كل دوال التنسيق المشتركة. formatPrice وgetImgSrc وBASE_URL — مكتوبة مرة وحدة وكل المشروع يستورده

// ── BASE_URL ──────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || ""
export const BASE_URL = API_URL.replace(/\/api\/?$/, "")

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
export const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return "—"
  if (price > 1000000) return (price / 1000000).toFixed(1) + 'M'
  return price.toLocaleString()
}