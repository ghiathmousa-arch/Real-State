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

          {/* للأدمن بس */}
          <Route element={<AdminRoute />}>
            <Route path="/messages" element={<Messages />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default DashboardRoutes