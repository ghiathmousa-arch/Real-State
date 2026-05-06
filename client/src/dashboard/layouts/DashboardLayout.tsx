import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar/Sidebar"
import Navbar from "../components/Navbar/Navbar"

const DashboardLayout = () => {
  // حالة التحكم في فتح وإغلاق السايدبار بالجوال
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // دالة لتبديل حالة السايدبار
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // دالة لإغلاق السايدبار (سنمررها للسايدبار نفسه)
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#f9f9ff]" dir="rtl">

      {/* السايدبار — مررنا له الحالة ودالة الإغلاق */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* المحتوى — باقي الشاشة */}
      <div className="flex-1 flex flex-col min-w-0"> {/* min-w-0 تمنع المحتوى من التمدد خارج الشاشة */}

        {/* النافبار — مررنا له دالة الفتح عند الضغط على المنيو */}
        <Navbar onMenuClick={toggleSidebar} />

        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />  {/* هنا يتحمل Overview وباقي الصفحات */}
        </main>
      </div>

    </div>
  )
}

export default DashboardLayout