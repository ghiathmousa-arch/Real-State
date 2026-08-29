// مسؤول عن كل القيم الثابتة بالمشروع — المدن والفئات بيجيبهن usePropertyOptions من الباك اند
// (المصدر الوحيد: server/constants/property.js) بدل ما يكونوا مكررين هون كمان.

import { useEffect, useState } from "react"
import axios from "axios"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

interface Option {
  ar: string
  en: string
}

// كاش بسيط عالمستوى الموديول حتى كل المكونات يلي بتستخدم usePropertyOptions
// بنفس الوقت يشاركوا نفس طلب الـ fetch بدل ما كل وحدة تطلبه لحالها
let citiesPromise: Promise<Option[]> | null = null
let categoriesPromise: Promise<Option[]> | null = null

const fetchCities = () => {
  if (!citiesPromise) {
    citiesPromise = axios.get<Option[]>(`${BASE_URL}/api/cities`).then(res => res.data)
  }
  return citiesPromise
}

const fetchCategories = () => {
  if (!categoriesPromise) {
    categoriesPromise = axios.get<Option[]>(`${BASE_URL}/api/categories`).then(res => res.data)
  }
  return categoriesPromise
}

export const usePropertyOptions = () => {
  const [cities, setCities] = useState<Option[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchCities(), fetchCategories()])
      .then(([c, cat]) => {
        if (cancelled) return
        setCities(c)
        setCategories(cat)
      })
      .catch(err => console.error("تعذر جلب المدن والفئات:", err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return {
    cities: cities.map(c => c.ar),
    citiesEn: cities.map(c => c.en),
    categories: categories.map(c => c.ar),
    categoriesEn: categories.map(c => c.en),
    loading,
  }
}

export const PROPERTY_TYPES = [
  { value: "buy", label: "بيع" },
  { value: "rent", label: "إيجار" },
]

export const PROPERTY_STATUS = [
  { value: "active", label: "نشط" },
  { value: "pending", label: "معلق" },
  { value: "sold", label: "مباع" },
]

export const FEATURED_OPTIONS = [
  { value: "false", label: "لا" },
  { value: "true", label: "نعم" },
]
