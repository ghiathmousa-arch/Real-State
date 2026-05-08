import { useState } from "react"
import { IoIosSearch, IoIosMenu } from "react-icons/io" // ضفنا أيقونة المنيو
import { useNavigate } from "react-router-dom"

const Navbar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">

      {/* زر المنيو - يظهر فقط في الجوال */}
      <button onClick={onMenuClick} className="lg:hidden p-2 text-[#004e80]">
        <IoIosMenu size={28} />
      </button>

      {/* Search - مخفي في الجوال الصغير جداً أو مصغر */}
      <div className="relative hidden sm:block">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 w-48 lg:w-72">
          <span className="text-gray-400"><IoIosSearch /></span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="بحث..."
            className="bg-transparent outline-none text-sm text-gray-600 w-full text-right"
          />
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs lg:text-sm font-black text-[#0f2d4a]">{user.name || "Admin"}</p>
          <p className="text-[10px] lg:text-xs text-gray-400">Admin</p>
        </div>
        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#004e80] text-white flex items-center justify-center text-sm font-bold">
          {user.name?.[0] || "A"}
        </div>
      </div>
    </header>
  )
}
export default Navbar;