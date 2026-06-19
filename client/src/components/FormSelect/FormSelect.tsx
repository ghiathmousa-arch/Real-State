interface Option {
  value: string
  label: string
}

interface Props {
  label: string
  name: string
  options: Option[]
  placeholder?: string
  required?: boolean
  dir?: "ltr" | "rtl"
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

const selectClass =
  "w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"

const FormSelect = ({ label, name, options, placeholder, required, dir, value, onChange }: Props) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black text-gray-400">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select name={name} required={required} dir={dir} value={value} onChange={onChange} className={selectClass}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export default FormSelect