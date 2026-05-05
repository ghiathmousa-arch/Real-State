import { useState } from "react"
import { IoIosSearch, IoMdSettings } from "react-icons/io"
import { MdNotifications } from "react-icons/md"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)

    if (val.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`http://localhost:5000/api/properties?search=${val}`)
      const data = await res.json()
      setResults(data.slice(0, 5)) // أول 5 نتائج بس
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">

      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 w-72">
          <span className="text-gray-400"><IoIosSearch /></span>
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="البحث عن العقارات أو المدينة..."
            className="bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400 w-full text-right"
          />
        </div>

        {/* Results Popup */}
        {query.length >= 2 && (
          <div className="absolute top-12 right-0 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-4">جاري البحث...</p>
            ) : results.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">لا توجد نتائج</p>
            ) : (
              results.map((p) => (
                <button
                  key={p._id}
                  onClick={() => {
                    navigate(`/dashboard/properties/${p._id}`)
                    setQuery("")
                    setResults([])
                  }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                >
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.city}</p>
                  </div>
                  <span className="text-xs bg-blue-50 text-[#004e80] px-2 py-1 rounded-lg shrink-0">
                    {p.type === "rent" ? "إيجار" : "بيع"}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Icons + User */}
      {/* Icons + User */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-black text-[#0f2d4a]">{user.name || "Admin"}</p>
            <p className="text-xs text-gray-400">{user.role === "admin" ? "مدير العقارات" : "مستخدم"}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#004e80] text-white flex items-center justify-center text-sm font-bold">
            {user.name?.[0] || "A"}
          </div>
        </div>
      </div>

    </header>
  )
}

export default Navbar