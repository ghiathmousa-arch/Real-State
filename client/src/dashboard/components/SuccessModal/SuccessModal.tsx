import { MdCheckCircle } from 'react-icons/md'

interface Props {
  isOpen: boolean
  title?: string
  message?: string
  primaryBtn: { label: string; onClick: () => void }
  secondaryBtn?: { label: string; onClick: () => void }
}

const SuccessModal = ({ isOpen, title = "تمت العملية!", message = "تمت العملية بنجاح", primaryBtn, secondaryBtn }: Props) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

      <div className="relative bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl flex flex-col items-center gap-6 text-center" dir="rtl">

        <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
          <MdCheckCircle size={56} className="text-green-500" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-[#0f2d4a]">{title}</h2>
          <p className="text-sm text-gray-400 mt-2 font-medium">{message}</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={primaryBtn.onClick}
            className="w-full py-4 bg-[#0f2d4a] text-white rounded-2xl font-black hover:bg-blue-900 transition-all"
          >
            {primaryBtn.label}
          </button>

          {secondaryBtn && (
            <button
              onClick={secondaryBtn.onClick}
              className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
            >
              {secondaryBtn.label}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

export default SuccessModal