// قسم "النسخة الإنجليزية (اختياري)" القابل للطي بفورم الإضافة والتعديل.
// منستعمل <details> عشان الحقول تضل بالـ DOM وهي مطوية — الإضافة بتقرا القيم من formEl.elements
// فلو انحذفت من الـ DOM ما كانت رح تنبعت.

import { MdExpandMore, MdLanguage } from 'react-icons/md'

interface Props {
  children: React.ReactNode
  // اختياري: للتحكم بالفتح من برّا (التعديل بيفتحه لحالو إذا العقار عندو نص إنجليزي)
  open?: boolean
  onToggle?: (open: boolean) => void
}

const EnglishSection = ({ children, open, onToggle }: Props) => (
  <details
    {...(open !== undefined ? { open } : {})}
    onToggle={e => onToggle?.(e.currentTarget.open)}
    className="group/en md:col-span-2 sm:col-span-2 rounded-[1.5rem] border border-gray-100 bg-gray-50/50"
  >
    <summary className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
      <span className="flex items-center gap-2 text-base font-black text-[#0f2d4a]">
        <MdLanguage size={18} className="text-blue-500" />
        النسخة الإنجليزية (اختياري)
      </span>
      <MdExpandMore size={22} className="text-gray-400 transition-transform group-open/en:rotate-180" />
    </summary>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pt-0" dir="rtl">
      {children}
    </div>
  </details>
)

export default EnglishSection
