import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Auth from './layouts/Auth'


function DashboardRoutes() {
  return (
    <Routes>
      {/* Auth كأب — Login كابن */}
      <Route element={<Auth />}>
        <Route path='login' element={<Login />} />
      </Route>

      {/* صفحات الداشبورد */}
      <Route path='/' element={<Overview />} />
    </Routes>
  )
}

export default DashboardRoutes