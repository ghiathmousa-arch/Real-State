import { MdBusiness, MdLabel, MdAccountBalance, MdAssignmentLate } from "react-icons/md"
import Header from "../components/Header/Header"
import { useEffect, useState, useMemo, useCallback } from "react"
import StatCard from "../components/StatCard/StatCard"
import PropertiesTable from "../components/PropertiesTable/PropertiesTable"
import { formatPrice } from "../../utils/format"
import { api } from "../../utils/api"
import { useCurrentUser } from "../hooks/useCurrentUser"



const Properties = () => {
  const { isAdmin } = useCurrentUser();
  const [propertiesList, setPropertiesList] = useState([]);
  // فلتر "حسب الشخص" (للأدمن) — بينفلتر بالسيرفر ?createdBy=
  const [createdBy, setCreatedBy] = useState("");
  const [people, setPeople] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    api.get("/auth/users")
      .then(res => setPeople(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Users fetch error:", err));
  }, [isAdmin]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    marketValue: "$0",
    pending: 0,
  });

  // دالة جلب البيانات - تم استخدام useCallback لضمان ثبات الدالة عند تمريرها للجدول
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // قائمة الأدمن (كل الحالات) — القائمة العامة صارت بترجّع النشط بس
      const { data } = await api.get("/properties/admin/all", {
        params: createdBy ? { createdBy } : undefined,
      });

      // التأكد من أن البيانات مصفوفة
      const properties = Array.isArray(data) ? data : data.data || [];
      setPropertiesList(properties);

      // حساب الإحصائيات بذكاء
      // القيمة السوقية = أسعار البيع بس (الإيجار ما إلو price — أسعاره بـ rentPrices)
      const totalValue = properties
        .filter((p: any) => p.type === "buy")
        .reduce((acc: number, p: any) => acc + (Number(p.price) || 0), 0);

      // تنسيق القيمة السوقية بالدولار (مثلاً $1.2M) — نفس formatPrice المستخدمة بكل المشروع
      const formattedMarketValue = formatPrice(totalValue);

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
  }, [createdBy]);

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
          <span dir="ltr">{stats.marketValue}</span>
          <span className="text-[10px] text-gray-400 uppercase">USD</span>
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
          people={isAdmin ? people : undefined}
          createdBy={createdBy}
          onCreatedByChange={setCreatedBy}
        />
      </div>
    </div>
  );
};

export default Properties;