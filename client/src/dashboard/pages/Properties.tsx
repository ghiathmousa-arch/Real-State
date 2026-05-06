import { MdBusiness, MdLabel, MdAccountBalance, MdAssignmentLate } from "react-icons/md"
import Header from "../components/Header/Header"
import { useEffect, useState, useMemo, useCallback } from "react"
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

  // دالة جلب البيانات - تم استخدام useCallback لضمان ثبات الدالة عند تمريرها للجدول
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/properties");
      const data = await res.json();

      // التأكد من أن البيانات مصفوفة
      const properties = Array.isArray(data) ? data : data.data || [];
      setPropertiesList(properties);

      // حساب الإحصائيات بذكاء
      const totalValue = properties.reduce((acc: number, p: any) => acc + (Number(p.price) || 0), 0);

      // تنسيق القيمة السوقية (مثلاً مليار ل.س)
      const formattedMarketValue = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(totalValue / 1000000000);

      setStats({
        total: properties.length,
        available: properties.filter((p: any) => p.status === "active").length, // تم التعديل لفلترة النشط
        marketValue: formattedMarketValue,
        pending: properties.filter((p: any) => p.status === "pending").length,
      });
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // مصفوفة الكروت (Stats)
  const cards = useMemo(() => [
    {
      title: "إجمالي العقارات",
      value: loading ? "..." : stats.total.toLocaleString(),
      change: "محدّث",
      badgeColor: "bg-blue-50",
      badgeTextColor: "text-blue-600",
      icon: <MdBusiness />,
      iconBg: "bg-blue-100 text-blue-700"
    },
    {
      title: "عقارات نشطة",
      value: loading ? "..." : stats.available.toLocaleString(),
      change: "جاهزة",
      badgeColor: "bg-green-50",
      badgeTextColor: "text-green-600",
      icon: <MdLabel />,
      iconBg: "bg-green-50 text-green-400"
    },
    {
      title: "القيمة السوقية",
      value: loading ? "..." : (
        <div className="flex flex-row-reverse items-baseline gap-1 font-black">
          <span>{stats.marketValue}B</span>
          <span className="text-[10px] text-gray-400 uppercase">ل.س</span>
        </div>
      ),
      change: "تقريبي",
      badgeColor: "bg-gray-50",
      badgeTextColor: "text-gray-500",
      icon: <MdAccountBalance />,
      iconBg: "bg-slate-100 text-slate-500"
    },
    {
      title: "طلبات معلقة",
      value: loading ? "..." : stats.pending.toLocaleString(),
      change: stats.pending > 0 ? "انتباه" : "لا يوجد",
      badgeColor: stats.pending > 0 ? "bg-red-50" : "bg-gray-50",
      badgeTextColor: stats.pending > 0 ? "text-red-500" : "text-gray-400",
      icon: <MdAssignmentLate />,
      iconBg: "bg-red-50 text-red-800"
    },
  ], [loading, stats]);

  return (
    <div className="p-4 sm:p-8 bg-[#f8faff] min-h-screen" dir="rtl">
      {/* الهيدر */}
      <Header title="إدارة القوائم العقارية" description="نظرة شاملة على جميع الأصول العقارية" />

      {/* كروت الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
        {cards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* منطقة الجدول */}
      <div className="mt-10 mb-10">
        <PropertiesTable
          data={propertiesList}
          loading={loading}
          refreshData={fetchData}
        />
      </div>
    </div>
  );
};

export default Properties;