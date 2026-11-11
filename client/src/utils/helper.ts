// قراءة حقول العقار حسب لغة الموقع مع fallback للعربي:
// إذا الموقع بالإنجليزي والنص الإنجليزي فاضي، منعرض العربي بدل ما يطلع فاضي
// (الحقول الإنجليزية اختيارية بفورم الإضافة/التعديل).

type LocalizedField = "title" | "description" | "city" | "category" | "address"

export const localized = (obj: any, field: LocalizedField, isAr: boolean): string => {
  if (!obj) return ""
  const ar = obj[field] ?? ""
  if (isAr) return ar
  const en = obj[`${field}En`]
  return typeof en === "string" && en.trim() ? en : ar
}

// نفس الفكرة للمصفوفات (المميزات): إذا القائمة الإنجليزية فاضية منعرض العربية
export const localizedList = (obj: any, field: "features", isAr: boolean): string[] => {
  if (!obj) return []
  const ar: string[] = obj[field] ?? []
  if (isAr) return ar
  const en: string[] | undefined = obj[`${field}En`]
  return en?.length ? en : ar
}
