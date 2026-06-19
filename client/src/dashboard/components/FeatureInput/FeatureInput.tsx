import { MdClose } from 'react-icons/md'

interface Props {
  label: string
  placeholder: string
  features: string[]
  input: string
  dir?: "ltr" | "rtl"
  tagColor?: "blue" | "green"
  onInputChange: (val: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}

const tagStyles = {
  blue: { wrap: "bg-blue-50 text-blue-700", btn: "text-blue-400 hover:text-red-500" },
  green: { wrap: "bg-green-50 text-green-700", btn: "text-green-400 hover:text-red-500" },
}

const FeatureInput = ({
  label, placeholder, features, input, dir = "rtl",
  tagColor = "blue", onInputChange, onAdd, onRemove
}: Props) => {
  const style = tagStyles[tagColor]

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-black text-gray-400">{label}</label>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAdd())}
          placeholder={placeholder}
          dir={dir}
          className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a]"
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition"
        >
          +
        </button>
      </div>

      {features.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {features.map((f, i) => (
            <span key={i} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold ${style.wrap}`}>
              {f}
              <button type="button" onClick={() => onRemove(i)} className={style.btn}>
                <MdClose size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default FeatureInput