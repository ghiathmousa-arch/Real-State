import { Routes, Route } from 'react-router-dom'
import DashboardRoutes from './dashboard/DashboardRoutes'
import HomePage from './website/pages/HomePage'
import Layout from './website/Layout/Layout'


function App() {
  return (
    
      <Routes>
        {/* مسارات الداشبورد */}
        <Route path='/dashboard/*' element={<DashboardRoutes />} />

        {/* مسارات الموقع   */}
        <Route path='/' element={<Layout/>} >
        <Route path='' element={<HomePage/>} />
        </Route>
        
      </Routes>
    
  )
}

export default App