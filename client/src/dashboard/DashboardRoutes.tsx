import { Routes, Route } from "react-router-dom"
import Auth from "./layouts/Auth"
import ProtectedRoute from "./ProtectedRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import DashboardLayout from "./layouts/DashboardLayout"
import Reports from "./pages/Reports"
import Investors from "./pages/Investors"
import Properties from "./pages/Properties"
import Trends from "./pages/Trends"
import AddProperty from "./components/AddProperty/AddProperty"

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
          {/* <Route path="/trends" element={<Trends />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="/reports" element={<Reports />} /> */}
          <Route path="properties/add" element={<AddProperty />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default DashboardRoutes