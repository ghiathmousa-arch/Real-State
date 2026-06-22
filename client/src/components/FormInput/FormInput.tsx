// مسؤول عن كل حقل إدخال نصي أو رقمي أو textarea بالفورم. يشتغل بوضعين — uncontrolled بالإضافة وcontrolled بالتعديل.

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
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const inputClass =
  "w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"

const FormInput = ({
  label, name, type = "text", placeholder, required,
  dir, inputMode, min, isTextarea, value, onChange
}: Props) => {

  // إذا value موجود = controlled (Edit mode)
  // إذا value غير موجود = uncontrolled (Add mode)
  const controlled = value !== undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black text-gray-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {isTextarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={3}
          dir={dir}
          {...(controlled ? { value, onChange } : {})}
          className={`${inputClass} text-sm resize-none`}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          dir={dir}
          inputMode={inputMode}
          min={min}
          {...(controlled ? { value, onChange } : {})}
          className={inputClass}
        />
      )}
    </div>
  )
}

export default FormInput