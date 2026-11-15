import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router-dom"

import { api } from "../utils/api"
import { isStaffRole, saveCurrentUser, clearCurrentUser } from "./hooks/useCurrentUser"

const ProtectedRoute = () => {
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading")

  useEffect(() => {
    // التحقق الفعلي من الصلاحية يصير عالسيرفر عبر كوكي الجلسة httpOnly،
    // مش بالاكتفاء بقراءة localStorage (كانت بوابة من جهة الفرونت فقط وقابلة للتجاوز)
    api.get("/auth/me")
      .then(({ data: user }) => {
        // الأدمن والسب أدمن (editor) بيدخلوا — الصلاحيات التفصيلية بالسيرفر وبـ AdminRoute
        if (isStaffRole(user.role)) {
          saveCurrentUser(user)
          setStatus("authorized")
        } else {
          clearCurrentUser()
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
