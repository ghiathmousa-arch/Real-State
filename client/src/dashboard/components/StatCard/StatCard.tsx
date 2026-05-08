import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: ReactNode
  change: string
  badgeColor: string
  badgeTextColor: string
  icon: ReactNode
  iconBg: string
}

const StatCard = ({ title, value, change, badgeColor, badgeTextColor, icon, iconBg }: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-6" dir="rtl">
      {/* الجزء العلوي: الشارة والأيقونة */}
      <div className="flex items-start justify-between">
        <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${badgeColor} ${badgeTextColor}`}>
          {change}
        </span>
        <span className={`text-xl p-3 rounded-xl ${iconBg}`}>
          {icon}
        </span>
      </div>

      {/* الجزء السفلي: العنوان والقيمة */}
      <div className="text-right overflow-hidden">
        <p className="text-sm text-gray-500 font-medium mb-1 truncate">{title}</p>
        <div
          className="text-xl md:text-2xl font-black text-[#0f2d4a] flex items-baseline justify-end gap-1 flex-wrap break-all whitespace-nowrap"
        >
          {value}
        </div>
      </div>
    </div>
  )
}

export default StatCard