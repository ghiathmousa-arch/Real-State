import { Routes, Route } from 'react-router-dom'
import DashboardRoutes from './dashboard/DashboardRoutes'

function App() {
  return (
    <Routes>
      {/* مسارات الداشبورد */}
      <Route path='/dashboard/*' element={<DashboardRoutes />} />

      {/* مسارات الموقع   */}
      <Route path='/*' element={<div>الموقع الرئيسي</div>} />
    </Routes>
  )
}

export default App