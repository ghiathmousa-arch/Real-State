// مسؤول عن كل حقل إدخال نصي أو رقمي أو textarea بالفورم. يشتغل بوضعين — uncontrolled بالإضافة وcontrolled بالتعديل.
import { digitsOnly, decimalOnly } from "../../utils/digits"

interface Props {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  dir?: "ltr" | "rtl"
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  min?: number
  isTextarea?: boolean
  value?: string | number
  // قيمة أولية بالوضع uncontrolled (الإضافة) — مثلاً تحويل "طلب عرض" لعقار
  defaultValue?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  // خانة رقمية: "int" = أرقام بس، "decimal" = أرقام ونقطة. بتقبل الأرقام العربية (٠-٩) وبتحوّلها،
  // وبتشتغل بالوضعين (controlled و uncontrolled). منستعملها بدل type="number" اللي بيرفض الأرقام العربية
  numeric?: "int" | "decimal"
}

// الخطوط والـ labels كبيرة وغامقة — اللي بيضيفوا غالباً كبار بالعمر
const inputClass =
  "w-full p-4 text-base bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"

const FormInput = ({
  label, name, type = "text", placeholder, required,
  dir, inputMode, min, isTextarea, value, defaultValue, onChange, numeric
}: Props) => {

  // إذا value موجود = controlled (Edit mode)
  // إذا value غير موجود = uncontrolled (Add mode)
  const controlled = value !== undefined

  // الخانات الرقمية: منحوّل الأرقام العربية ومنفلتر قبل ما توصل القيمة لأي حدا
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (numeric) e.target.value = numeric === "decimal" ? decimalOnly(e.target.value) : digitsOnly(e.target.value)
    onChange?.(e)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-bold text-gray-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {isTextarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={3}
          dir={dir}
          {...(controlled ? { value, onChange: handleChange } : { defaultValue, onChange: handleChange })}
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          name={name}
          type={numeric ? "text" : type}
          placeholder={placeholder}
          required={required}
          inputMode={numeric ? (numeric === "decimal" ? "decimal" : "numeric") : inputMode}
          dir={numeric ? "ltr" : dir}
          min={min}
          {...(controlled ? { value, onChange: handleChange } : { defaultValue, onChange: handleChange })}
          className={inputClass}
        />
      )}
    </div>
  )
}

export default FormInput