import { useEffect, useState, useMemo } from "react"
import { MdOutlineBusiness, MdTrendingUp, MdSell, MdStar } from "react-icons/md"
import Header from "../components/Header/Header"
import StatCard from "../components/StatCard/StatCard"

// تعريف واجهة البيانات لتحسين الـ TypeScript
interface Property {
  type: 'buy' | 'rent';
  isFeatured: boolean;
  price?: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    forSale: 0,
    forRent: 0,
    featured: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/properties")
        const data = await res.json()

        // استخراج المصفوفة بشكل آمن
        const properties: Property[] = Array.isArray(data) ? data : data.data || []

        setStats({
          total: properties.length,
          forSale: properties.filter(p => p.type === "buy").length,
          forRent: properties.filter(p => p.type === "rent").length,
          featured: properties.filter((p: any) => p.isFeatured === true).length,
        })
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // استخدام useMemo لتحسين الأداء ومنع إعادة تعريف المصفوفة عند كل رندر
  const cards = useMemo(() => [
    {
      title: "إجمالي العقارات",
      value: loading ? "..." : stats.total.toLocaleString('en-US'),
      change: "12%+",
      badgeColor: "bg-green-50",
      badgeTextColor: "text-green-600",
      icon: <MdOutlineBusiness />,
      iconBg: "bg-blue-50 text-blue-600",
    },
    {
      title: "عقارات للبيع",
      value: loading ? "..." : stats.forSale.toLocaleString('en-US'),
      change: "5.2%+",
      badgeColor: "bg-green-50",
      badgeTextColor: "text-green-600",
      icon: <MdSell />,
      iconBg: "bg-green-50 text-green-600",
    },
    {
      title: "عقارات للإيجار",
      value: loading ? "..." : stats.forRent.toLocaleString('en-US'),
      change: "2%-",
      badgeColor: "bg-red-50",
      badgeTextColor: "text-red-500",
      icon: <MdTrendingUp />,
      iconBg: "bg-orange-50 text-orange-500",
    },
    {
      title: "العقارات المميزة",
      value: loading ? "..." : stats.featured.toLocaleString('en-US'),
      change: "18%+",
      badgeColor: "bg-purple-50",
      badgeTextColor: "text-purple-500",
      icon: <MdStar />,
      iconBg: "bg-purple-50 text-purple-500",
    },
  ], [loading, stats]);

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      <Header
        title="أهلاً بك في لوحة التحكم"
        description="نظرة عامة على أداء العقارات والاستثمارات في دمشق اليوم."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>
    </div>
  )
}

export default Dashboard