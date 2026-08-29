import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = API_URL?.replace("/api", "");

const ProtectedRoute = () => {
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading")

  useEffect(() => {
    // التحقق الفعلي من الصلاحية يصير عالسيرفر عبر كوكي الجلسة httpOnly،
    // مش بالاكتفاء بقراءة localStorage (كانت بوابة من جهة الفرونت فقط وقابلة للتجاوز)
    fetch(`${BASE_URL}/api/auth/me`, { credentials: "include" })
      .then(res => (res.ok ? res.json() : Promise.reject()))
      .then(user => {
        if (user.role === "admin") {
          localStorage.setItem("user", JSON.stringify(user))
          setStatus("authorized")
        } else {
          setStatus("unauthorized")
        }
      })
      .catch(() => setStatus("unauthorized"))
  }, [])

  if (status === "loading")
    return (
      <div className="flex items-center justify-center h-screen text-[#004e80] font-bold">
        جاري التحقق...
      </div>
    )

  if (status === "unauthorized") return <Navigate to="/dashboard/login" replace />

  return <Outlet />
}

export default ProtectedRoute
