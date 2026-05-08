import { Routes, Route } from 'react-router-dom'
import DashboardRoutes from './dashboard/DashboardRoutes'
import HomePage from './website/pages/HomePage'

function App() {
  return (
    
      <Routes>
        {/* مسارات الداشبورد */}
        <Route path='/dashboard/*' element={<DashboardRoutes />} />

        {/* مسارات الموقع   */}
        <Route path='/' element={<HomePage/>} />
        
      </Routes>
    
  )
}

export default App