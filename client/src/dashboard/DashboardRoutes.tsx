import { Routes, Route } from "react-router-dom"
import Auth from "./layouts/Auth"
import ProtectedRoute from "./ProtectedRoute"
import AdminRoute from "./AdminRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import DashboardLayout from "./layouts/DashboardLayout"
import Properties from "./pages/Properties"
import AddProperty from "./components/AddProperty/AddProperty"
import Messages from "./pages/Messages"
import PendingChanges from "./pages/PendingChanges"
import Users from "./pages/Users"
import Requests from "./pages/Requests"
import ConvertRequest from "./pages/ConvertRequest"

const DashboardRoutes = () => {
  return (
    <Routes>
      {/* صفحات Auth — بدون حماية */}
      <Route element={<Auth />}>
        <Route path="login" element={<Login />} />
      </Route>

      {/* صفحات الداشبورد — محمية */}
      <Route element={<ProtectedRoute />}>        {/* حماية */}
        <Route element={<DashboardLayout />}>     {/* شكل */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="properties/add" element={<AddProperty />} />
          {/* طلبات "اعرض عقارك" — أدمن وسب أدمن */}
          <Route path="requests" element={<Requests />} />
          <Route path="requests/:id/convert" element={<ConvertRequest />} />

          {/* للأدمن بس */}
          <Route element={<AdminRoute />}>
            <Route path="/messages" element={<Messages />} />
            <Route path="/pending-changes" element={<PendingChanges />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default DashboardRoutes