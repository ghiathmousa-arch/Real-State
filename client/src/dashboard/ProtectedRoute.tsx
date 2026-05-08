import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoute = () => {
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user") || "{}")

  // مو مسجل دخول → 
  if (!token) return <Navigate to="/dashboard/login" replace />

  // مسجل بس مو admin → 
  if (user?.role !== "admin") return <Navigate to="/dashboard/login" replace />

  // تمام → اعرض الصفحة
  return <Outlet />
}

export default ProtectedRoute