import { useEffect, useState } from "react"

interface Activity {
  _id: string
  title: string
  city: string
  price: number
  status: string
  action: { type: "added" | "sold" | "updated"; by: string; at: string }
}

const actionConfig = {
  added: { label: "تمت إضافة", dot: "bg-green-500" },
  updated: { label: "تم تعديل", dot: "bg-blue-500" },
  sold: { label: "تم بيع", dot: "bg-purple-500" },
}

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `منذ ${mins} دقيقة`
  if (hours < 24) return `منذ ${hours} ساعة`
  return `منذ ${days} يوم`
}

const RecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://localhost:5000/api/properties/recent")
      .then(res => res.json())
      .then(data => setActivities(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5" dir="rtl">

      {/* العنوان */}
      <h2 className="text-lg font-black text-[#0f2d4a] text-right">آخر النشاطات</h2>

      {/* القائمة */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">لا توجد نشاطات</p>
      ) : (
        <div className="flex flex-col gap-5">
          {activities.map((a) => {
            const config = actionConfig[a.action.type] || actionConfig.added
            return (
              <div key={a._id} className="flex items-start gap-3">

                {/* Dot */}
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${config.dot}`} />

                {/* Info */}
                <div className="flex-1 text-right">
                  <p className="text-sm font-black text-[#0f2d4a]">
                    {config.label} {a.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeAgo(a.action.at)} • بواسطة {a.action.by}
                  </p>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* زر عرض الكل */}
      <button className="w-full mt-2 py-3 border border-gray-200 rounded-2xl text-sm font-bold text-blue-600 hover:bg-gray-50 transition">
        عرض كافة النشاطات
      </button>

    </div>
  )
}

export default RecentActivities