// نطاقات السعر (بالدولار) للبحث بالرئيسية وفلتر صفحة العقارات — عدّلها من هون بس.
// كل نطاق: min و/أو max (شاملة). بتتغيّر حسب البيع أو مدة الإيجار.

import type { RentPeriod } from "../utils/format"

export type PriceMode = "buy" | RentPeriod

export interface PriceRange {
  min?: number
  max?: number
}

export const PRICE_RANGES: Record<PriceMode, PriceRange[]> = {
  buy: [{ max: 50_000 }, { min: 50_000, max: 100_000 }, { min: 100_000, max: 250_000 }, { min: 250_000, max: 500_000 }, { min: 500_000 }],
  daily: [{ max: 30 }, { min: 30, max: 60 }, { min: 60, max: 100 }, { min: 100 }],
  weekly: [{ max: 150 }, { min: 150, max: 350 }, { min: 350, max: 700 }, { min: 700 }],
  monthly: [{ max: 200 }, { min: 200, max: 400 }, { min: 400, max: 800 }, { min: 800 }],
  yearly: [{ max: 2_000 }, { min: 2_000, max: 5_000 }, { min: 5_000, max: 10_000 }, { min: 10_000 }],
}

// مفتاح ثابت للنطاق (قيمة الـ <option>) — مثلاً "50000-100000" أو "-50000" أو "500000-"
export const rangeKey = (r: PriceRange) => `${r.min ?? ""}-${r.max ?? ""}`

export const parseRangeKey = (key: string): { minPrice: string; maxPrice: string } => {
  const [min = "", max = ""] = key.split("-")
  return { minPrice: min, maxPrice: max }
}

// "$50K" · "$2K" · "$30"
const compact = (n: number) =>
  n >= 1_000_000 ? `$${n / 1_000_000}M` : n >= 1_000 ? `$${n / 1_000}K` : `$${n}`

// t: دالة الترجمة — priceRange.under / priceRange.over
export const rangeLabel = (r: PriceRange, t: (k: string, o?: any) => string) => {
  if (r.min == null && r.max != null) return t("priceRange.under", { value: compact(r.max) })
  if (r.max == null && r.min != null) return t("priceRange.over", { value: compact(r.min) })
  return `${compact(r.min!)} – ${compact(r.max!)}`
}
