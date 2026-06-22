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

// ── السعر ────────────────────────────────────────────────
export const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return "—"
  if (price > 1000000) return (price / 1000000).toFixed(1) + 'M'
  return price.toLocaleString()
}