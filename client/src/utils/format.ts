//  المسؤول عن كل دوال التنسيق المشتركة. formatPrice وgetImgSrc وBASE_URL — مكتوبة مرة وحدة وكل المشروع يستورده

// ── BASE_URL ──────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || ""
export const BASE_URL = API_URL.replace(/\/api\/?$/, "")

// ── الصور ────────────────────────────────────────────────
export const getImgSrc = (images: string[]): string | null => {
  const first = images?.find(img => img && !img.includes('undefined'))
  if (!first) return null
  return first.startsWith('http') ? first : `${BASE_URL}/${first.replace(/^\//, '')}`
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