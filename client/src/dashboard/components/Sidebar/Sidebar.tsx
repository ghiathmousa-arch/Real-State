import { NavLink, useNavigate } from "react-router-dom"
import { MdDashboard, MdTrendingUp, MdPeople, MdOutlineBusiness, MdOutlineAssessment, MdSupport, MdLogout } from "react-icons/md"
import { IoMdAdd } from "react-icons/io"

const links = [
  { label: "Dashboard", path: "/dashboard", icon: <MdDashboard /> },
  { label: "Property Listings", path: "/dashboard/properties", icon: <MdOutlineBusiness /> },
  { label: "Market Trends", path: "/dashboard/trends", icon: <MdTrendingUp /> },
  { label: "Investors", path: "/dashboard/investors", icon: <MdPeople /> },
  { label: "Reports", path: "/dashboard/reports", icon: <MdOutlineAssessment /> },
]

const bottomLinks = [
  { label: "Add New Property", path: "/dashboard/properties/add", icon: <IoMdAdd />, style: "add" },
  { label: "Support", path: "/dashboard/support", icon: <MdSupport />, style: "normal" },
]

const Sidebar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    navigate("/dashboard/login")
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-l border-gray-200 flex flex-col justify-between py-8 px-6">

      {/* Logo */}
      <div>
        <div className="mb-10 text-right">
          <h1 className="text-lg font-bold text-[#004e80]">Syrian Estate Admin</h1>
          <p className="text-xs text-gray-400">Premium Management</p>
        </div>

        {/* Top Links */}
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-[#004e80] text-white" : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Links */}
      <div className="flex flex-col gap-2">
        {bottomLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={link.style === "add"
              ? "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-[#004e80] text-white hover:bg-[#003d6b] transition-all"
              : ({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-[#004e80] text-white" : "text-gray-500 hover:bg-gray-100"
                }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}

        {/* Logout — button مش link */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
        >
          <span className="text-lg"><MdLogout /></span>
          <span>Logout</span>
        </button>
      </div>

    </aside>
  )
}

export default Sidebar