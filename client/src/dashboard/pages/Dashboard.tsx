import { useEffect, useState, useMemo } from "react"
import { MdOutlineBusiness, MdTrendingUp, MdSell, MdStar } from "react-icons/md"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import Header from "../components/Header/Header"
import StatCard from "../components/StatCard/StatCard"
import RecentActivities from "../components/RecentActivities/RecentActivities"


interface Property {
  type: 'buy' | 'rent'
  isFeatured: boolean
  price?: number
  city?: string
  createdAt?: string
}

// ── دالة تجميع متوسط الأسعار حسب الشهر ──────────
const buildChartData = (properties: Property[]) => {
  const months: Record<string, { total: number; count: number }> = {}

  properties.forEach(p => {
    if (!p.price || !p.createdAt) return
    const date = new Date(p.createdAt)
    const label = date.toLocaleDateString('ar-SY', { month: 'short', year: '2-digit' })
    if (!months[label]) months[label] = { total: 0, count: 0 }
    months[label].total += p.price
    months[label].count += 1
  })

  return Object.entries(months)
    .map(([month, { total, count }]) => ({
      month,
      avg: Math.round(total / count)
    }))
    .slice(-6) // آخر 6 أشهر
}

// ── Tooltip مخصص ─────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-right" dir="rtl">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-black text-[#0f2d4a]">
        {payload[0].value.toLocaleString()} <span className="text-[10px] font-bold text-gray-400">ل.س</span>
      </p>
    </div>
  )
}

const Dashboard = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:5000/api/properties")
      .then(res => res.json())
      .then(data => setProperties(Array.isArray(data) ? data : data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => ({
    total: properties.length,
    forSale: properties.filter(p => p.type === "buy").length,
    forRent: properties.filter(p => p.type === "rent").length,
    featured: properties.filter((p: any) => p.isFeatured === true).length,
  }), [properties])

  const chartData = useMemo(() => buildChartData(properties), [properties])

  const cards = useMemo(() => [
    { title: "إجمالي العقارات", value: loading ? "..." : stats.total.toLocaleString(), change: "12%+", badgeColor: "bg-green-50", badgeTextColor: "text-green-600", icon: <MdOutlineBusiness />, iconBg: "bg-blue-50 text-blue-600" },
    { title: "عقارات للبيع", value: loading ? "..." : stats.forSale.toLocaleString(), change: "5.2%+", badgeColor: "bg-green-50", badgeTextColor: "text-green-600", icon: <MdSell />, iconBg: "bg-green-50 text-green-600" },
    { title: "عقارات للإيجار", value: loading ? "..." : stats.forRent.toLocaleString(), change: "2%-", badgeColor: "bg-red-50", badgeTextColor: "text-red-500", icon: <MdTrendingUp />, iconBg: "bg-orange-50 text-orange-500" },
    { title: "العقارات المميزة", value: loading ? "..." : stats.featured.toLocaleString(), change: "18%+", badgeColor: "bg-purple-50", badgeTextColor: "text-purple-500", icon: <MdStar />, iconBg: "bg-purple-50 text-purple-500" },
  ], [loading, stats])

  // ألوان الشارت من الفاتح للغامق
  const barColors = ["#1e4d7b", "#1a6199", "#1a7ab8", "#4a9fd4", "#7dbfe8", "#b3d9f2"]

  return (
    <div className="flex flex-col gap-8" dir="rtl ">
      <Header
        title="أهلاً بك في لوحة التحكم"
        description="نظرة عامة على أداء العقارات والاستثمارات في دمشق اليوم."
      />

      {/* الكروت */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {/* القسم السفلي */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* آخر النشاطات */}
        <RecentActivities />

        {/* الشارت */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4" dir="rtl">
          <div className="text-right">
            <h2 className="text-lg font-black text-[#0f2d4a]">اتجاهات أسعار السوق</h2>
            <p className="text-xs text-gray-400 mt-0.5">متوسط سعر العقار (ليرة سورية) — آخر 6 أشهر</p>
          </div>

          {loading ? (
            <div className="h-52 bg-gray-50 rounded-2xl animate-pulse" />
          ) : chartData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-300 text-sm">
              لا توجد بيانات كافية
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="30%">
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  hide
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f3f4f6", radius: 8 }}
                />
                <Bar dataKey="avg" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={barColors[i % barColors.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard