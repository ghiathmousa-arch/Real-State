// فلاتر صفحة العقارات — المصدر الوحيد هو الـ URL (قابل للمشاركة):
//   /properties?type=rent&rentPeriod=monthly&furnished=furnished&city=دمشق&category=شقة&minPrice=200&maxPrice=400&q=...&sort=price_asc
// الفلترة نفسها محلية (على القائمة العامة كاملة) متل قبل.

import { priceFor, RENT_PERIODS, type RentPeriod } from "./format"
import { withImagesFirst } from "./format"

export type ListingType = "" | "buy" | "rent"
export type Furnished = "" | "furnished" | "unfurnished"
export type SortOrder = "newest" | "price_asc" | "price_desc"

export interface PropertyFilters {
  type: ListingType
  rentPeriod: "" | RentPeriod
  furnished: Furnished
  city: string
  category: string
  minPrice: string
  maxPrice: string
  q: string
  sort: SortOrder
}

export const EMPTY_FILTERS: PropertyFilters = {
  type: "", rentPeriod: "", furnished: "", city: "", category: "",
  minPrice: "", maxPrice: "", q: "", sort: "newest",
}

const SORTS: SortOrder[] = ["newest", "price_asc", "price_desc"]
const isNum = (v: string | null) => !!v && /^\d+(\.\d+)?$/.test(v)

// من الـ URL — أي قيمة مش معروفة بتنتجاهل بدل ما تكسّر الصفحة
export const filtersFromParams = (sp: URLSearchParams): PropertyFilters => {
  const type = sp.get("type")
  const rentPeriod = sp.get("rentPeriod")
  const furnished = sp.get("furnished")
  const sort = sp.get("sort")
  return {
    type: type === "buy" || type === "rent" ? type : "",
    rentPeriod: RENT_PERIODS.includes(rentPeriod as RentPeriod) ? (rentPeriod as RentPeriod) : "",
    furnished: furnished === "furnished" || furnished === "unfurnished" ? furnished : "",
    city: sp.get("city") || "",
    category: sp.get("category") || "",
    minPrice: isNum(sp.get("minPrice")) ? sp.get("minPrice")! : "",
    maxPrice: isNum(sp.get("maxPrice")) ? sp.get("maxPrice")! : "",
    q: sp.get("q") || "",
    sort: SORTS.includes(sort as SortOrder) ? (sort as SortOrder) : "newest",
  }
}

// للـ URL — القيم الفاضية والافتراضية ما بتنكتب (رابط نضيف)
export const filtersToParams = (f: Partial<PropertyFilters>): URLSearchParams => {
  const sp = new URLSearchParams()
  const keys: (keyof PropertyFilters)[] = ["type", "rentPeriod", "furnished", "city", "category", "minPrice", "maxPrice", "q", "sort"]
  keys.forEach(k => {
    const v = f[k]
    if (!v || (k === "sort" && v === "newest")) return
    sp.set(k, String(v))
  })
  return sp
}

export const hasActiveFilters = (f: PropertyFilters) =>
  Boolean(f.type || f.rentPeriod || f.furnished || f.city || f.category || f.minPrice || f.maxPrice || f.q.trim())

// ── الفلترة ──
// ignoreType: لحساب أعداد التبويبات (الكل / للبيع / للإيجار) حسب باقي الفلاتر
export const applyFilters = (list: any[], f: PropertyFilters, ignoreType = false): any[] => {
  const q = f.q.trim().toLowerCase()
  const min = f.minPrice ? Number(f.minPrice) : null
  const max = f.maxPrice ? Number(f.maxPrice) : null
  // مدة الإيجار بتنطبق بس على الإيجار — بتبويب "الكل" أو "للبيع" منتجاهلها
  const period = !ignoreType && f.type === "rent" ? f.rentPeriod : ""

  return list.filter(p => {
    if (q && ![p.title, p.titleEn, p.city, p.cityEn].some(v => v?.toLowerCase().includes(q))) return false
    if (!ignoreType && f.type && p.type !== f.type) return false
    if (f.city && p.city !== f.city && p.cityEn !== f.city) return false
    if (f.category && p.category !== f.category && p.categoryEn !== f.category) return false
    if (f.furnished && p.furnished !== f.furnished) return false
    if (period && p.rentPrices?.[period] == null) return false
    if (min != null || max != null) {
      const v = priceFor(p, period)
      if (v == null) return false
      if (min != null && v < min) return false
      if (max != null && v > max) return false
    }
    return true
  })
}

// ── الترتيب ──
// الأحدث (افتراضي، مع الصور أول) · السعر من الأقل · من الأعلى — العقارات بلا سعر دايماً بالآخر
export const sortProperties = (list: any[], sort: SortOrder, period: "" | RentPeriod = ""): any[] => {
  if (sort === "newest") {
    const byDate = [...list].sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    return withImagesFirst(byDate)
  }
  const dir = sort === "price_asc" ? 1 : -1
  return [...list].sort((a, b) => {
    const pa = priceFor(a, period)
    const pb = priceFor(b, period)
    if (pa == null && pb == null) return 0
    if (pa == null) return 1
    if (pb == null) return -1
    return (pa - pb) * dir
  })
}
