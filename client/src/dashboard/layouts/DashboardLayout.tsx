import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar/Sidebar"
import Navbar from "../components/Navbar/Navbar"

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f9f9ff]" dir="rtl">

      {/* السايدبار — يمين */}
      <Sidebar />

      {/* المحتوى — باقي الشاشة */}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <Outlet />  {/* هنا يتحمل Overview وباقي الصفحات */}
        </main>
      </div>

    </div>
  )
}

export default DashboardLayout