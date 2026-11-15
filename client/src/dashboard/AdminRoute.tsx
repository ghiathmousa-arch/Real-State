import { Navigate, Outlet } from "react-router-dom"
import { useCurrentUser } from "./hooks/useCurrentUser"

// صفحات الأدمن بس (الرسائل، الموافقات، المستخدمين). السب أدمن اللي بيفتحها بإيدو بيرجع للعقارات.
// هاد للتجربة بس — الحماية الحقيقية بالسيرفر (adminOnly).
const AdminRoute = () => {
  const { isAdmin } = useCurrentUser()
  if (!isAdmin) return <Navigate to="/dashboard/properties" replace />
  return <Outlet />
}

export default AdminRoute
