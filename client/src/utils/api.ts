// المصدر الوحيد لرابط الـ API بكل الواجهة — بدل ما كل ملف يعمل replace("/api", "") بطريقته
//
// VITE_API_URL ممكن يكون مضبوط مع /api بالآخر أو بدونه (أو مع / زيادة) — منوحّدهم كلهم:
//   "https://x.onrender.com/api/" → API_BASE = "https://x.onrender.com"
import axios from "axios"

// جذر السيرفر (بدون /api) — للصور المحلية القديمة وأي رابط مش API
export const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "")

// instance موحّد لكل طلبات الـ API — المسارات بتنكتب نسبية: api.get("/properties")
// withCredentials عشان كوكي الجلسة (httpOnly) ينبعث مع طلبات الأدمن عبر النطاقات
export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
})

// رسالة الخطأ من السيرفر إذا موجودة، وإلا رسالة احتياطية
export const getApiError = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error
    if (typeof msg === "string" && msg.length < 200) return msg
  }
  return fallback
}
