import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { MdDashboard, MdOutlineBusiness, MdLogout, MdClose, MdEmail } from "react-icons/md"
import { IoMdAdd } from "react-icons/io"

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = API_URL?.replace("/api", "");

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const navigate = useNavigate()
  const [showLogoutPopup, setShowLogoutPopup] = useState(false)

  const handleConfirmLogout = async () => {
    try {
      // يمسح كوكي الجلسة httpOnly من طرف السيرفر — localStorage.removeItem لا يكفي لأنه ما بيوصلها أصلاً
      await fetch(`${BASE_URL}/api/auth/logout`, { method: "POST", credentials: "include" })
    } catch {
      // حتى لو فشل الطلب (مثلاً الشبكة)، نكمّل تسجيل الخروج محلياً
    }
    localStorage.removeItem("user")
    navigate("/dashboard/login")
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 right-0 z-[101] w-64 bg-white border-l border-gray-200 flex flex-col justify-between py-8 px-6 transition-transform duration-300
        lg:static lg:translate-x-0 ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}>

        <div className="flex flex-col">
          <button onClick={onClose} className="lg:hidden self-start mb-4 text-gray-500 hover:text-gray-700">
            <MdClose size={28} />
          </button>

          <div className="mb-10 text-right">
            <h1 className="text-lg font-bold text-[#004e80]">Syrian Estate Admin</h1>
            <p className="text-xs text-gray-400 font-medium">Premium Management</p>
          </div>

          <nav className="flex flex-col gap-2">
            {[
              { label: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
              { label: "Property Listings", path: "/dashboard/properties", icon: <MdOutlineBusiness /> },
              { label: "الرسائل", path: "/dashboard/messages", icon: <MdEmail /> },
            ].map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 
                  active:scale-95
                  ${isActive
                    ? "bg-[#004e80] text-white shadow-md shadow-blue-100"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#004e80]"
                  }`
                }
              >
                <span className="text-xl">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <NavLink
            to="/dashboard/properties/add"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95
              ${isActive
                ? "bg-[#003557] text-white ring-2 ring-[#004e80] ring-offset-2"
                : "bg-[#004e80] text-white hover:bg-[#003d6b]"
              }`
            }
          >
            <span className="text-xl"><IoMdAdd /></span>
            <span>Add New Property</span>
          </NavLink>

          <button
            onClick={() => setShowLogoutPopup(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 active:bg-red-100 active:scale-95 transition-all duration-200"
          >
            <span className="text-xl"><MdLogout /></span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-[350px]">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MdLogout size={30} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">تسجيل الخروج</h3>
            <p className="text-gray-500 text-center text-sm mb-8">هل أنت متأكد أنك تريد مغادرة النظام؟</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmLogout}
                className="bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 active:scale-95 transition-all"
              >
                تأكيد الخروج
              </button>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 active:scale-95 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar