import { MdBusiness, MdLabel, MdAccountBalance, MdAssignmentLate } from "react-icons/md"
import Header from "../components/Header/Header"
import { useEffect, useState, useMemo } from "react"
import StatCard from "../components/StatCard/StatCard"
import PropertiesTable from "../components/PropertiesTable/PropertiesTable"

const Properties = () => {
  const [propertiesList, setPropertiesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    marketValue: "0.0",
    pending: 0,
  });

  // دالة جلب البيانات - تم جعلها مستقلة ليتم استدعاؤها عند الحاجة للـ Refresh
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/properties");
      const data = await res.json();
      const properties = Array.isArray(data) ? data : data.data || [];

      setPropertiesList(properties);

      const totalValue = properties.reduce((acc: number, p: any) => acc + (Number(p.price) || 0), 0);
      const formattedMarketValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(totalValue / 1000000000);

      setStats({
        total: properties.length,
        available: properties.filter((p: any) => p.type === "buy").length,
        marketValue: formattedMarketValue,
        pending: properties.filter((p: any) => p.status === "pending").length,
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cards = useMemo(() => [
    { title: "إجمالي العقارات", value: loading ? "..." : stats.total.toLocaleString(), change: "12%+", badgeColor: "bg-green-50", badgeTextColor: "text-green-600", icon: <MdBusiness />, iconBg: "bg-blue-100 text-blue-700" },
    { title: "عقارات متاحة", value: loading ? "..." : stats.available.toLocaleString(), change: "مستقر", badgeColor: "bg-gray-50", badgeTextColor: "text-gray-500", icon: <MdLabel />, iconBg: "bg-indigo-50 text-indigo-400" },
    { title: "القيمة السوقية", value: loading ? "..." : <div className="flex flex-row-reverse items-baseline gap-1"><span>{stats.marketValue}B</span><span className="text-xs font-bold text-gray-400">ل.س</span></div>, change: "5.4%+", badgeColor: "bg-green-50", badgeTextColor: "text-green-600", icon: <MdAccountBalance />, iconBg: "bg-slate-100 text-slate-500" },
    { title: "طلبات معلقة", value: loading ? "..." : stats.pending.toLocaleString(), change: "تنبيه", badgeColor: "bg-red-50", badgeTextColor: "text-red-500", icon: <MdAssignmentLate />, iconBg: "bg-red-50 text-red-800" },
  ], [loading, stats]);

  return (
    <div className="p-6 bg-[#f8faff] min-h-screen" dir="rtl">
      <Header title="إدارة القوائم العقارية" description="نظرة شاملة على جميع الأصول العقارية" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {cards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>
      <div className="mt-10">
        {/* تمرير دالة fetchData هنا لتستخدم في الحذف */}
        <PropertiesTable data={propertiesList} loading={loading} refreshData={fetchData} />
      </div>
    </div>
  );
};

export default Properties;