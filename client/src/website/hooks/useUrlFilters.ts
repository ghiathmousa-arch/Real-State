// فلاتر صفحة العقارات من/على الـ URL. التعديل بيعمل replace (مش push)
// عشان زر الرجوع ما يمشي على كل تغيير فلتر.

import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { filtersFromParams, filtersToParams, type PropertyFilters } from "../../utils/propertyFilters"

export const useUrlFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams])

  const update = useCallback((patch: Partial<PropertyFilters>) => {
    setSearchParams(prev => filtersToParams({ ...filtersFromParams(prev), ...patch }), { replace: true })
  }, [setSearchParams])

  const reset = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }, [setSearchParams])

  return { filters, update, reset }
}
