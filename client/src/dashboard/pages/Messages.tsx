import { useEffect, useState } from "react"
import { MdDelete, MdReply, MdMail, MdMailOutline, MdArrowBack } from "react-icons/md"

interface Message {
  _id: string
  name: string
  email: string
  phone?: string
  message: string
  replied: boolean
  createdAt: string
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Message | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sending, setSending] = useState(false)

  const API = import.meta.env.VITE_API_URL

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API}/api/contact`)
      const data = await res.json()
      setMessages(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMessages() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return
    await fetch(`${API}/api/contact/${id}`, { method: "DELETE" })
    setMessages(prev => prev.filter(m => m._id !== id))
    if (selected?._id === id) setSelected(null)
  }

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return
    setSending(true)
    try {
      const res = await fetch(`${API}/api/contact/${selected._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText })
      })
      const data = await res.json()
      if (data.success) {
        alert("✅ تم إرسال الرد بنجاح")
        setReplyText("")
        setMessages(prev => prev.map(m => m._id === selected._id ? { ...m, replied: true } : m))
        setSelected(prev => prev ? { ...prev, replied: true } : null)
      }
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#004e80]">
      جاري التحميل...
    </div>
  )

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)]" dir="rtl">

      {/* قائمة الرسائل — تختفي بالموبايل لما تختار رسالة */}
      <div className={`
        ${selected ? "hidden lg:flex" : "flex"} 
        flex-col w-full lg:w-2/5 bg-white rounded-xl shadow-sm border border-[#e3e8f9] overflow-y-auto
      `}>
        <div className="p-4 border-b border-[#e3e8f9]">
          <h2 className="text-lg font-bold text-[#161c27]">الرسائل</h2>
          <p className="text-sm text-[#717881]">{messages.length} رسالة</p>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-[#717881]">
            <MdMail size={40} className="mb-2 opacity-30" />
            <p>لا توجد رسائل</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg._id}
              onClick={() => setSelected(msg)}
              className={`p-4 border-b border-[#f1f3ff] cursor-pointer hover:bg-[#f1f3ff] transition-colors
                ${selected?._id === msg._id ? "bg-[#e8eeff] border-r-4 border-r-[#004e80]" : ""}
              `}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {msg.replied
                    ? <MdMailOutline size={16} className="text-[#717881]" />
                    : <MdMail size={16} className="text-[#004e80]" />
                  }
                  <span className="font-semibold text-[#161c27] text-sm">{msg.name}</span>
                </div>
                <span className="text-xs text-[#717881]">
                  {new Date(msg.createdAt).toLocaleDateString("ar-SY")}
                </span>
              </div>
              <p className="text-xs text-[#717881] truncate">{msg.message}</p>
              {msg.replied && (
                <span className="text-xs text-green-600 mt-1 inline-block">✓ تم الرد</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* تفاصيل الرسالة — تظهر بالموبايل لما تختار رسالة */}
      <div className={`
        ${selected ? "flex" : "hidden lg:flex"}
        flex-1 flex-col bg-white rounded-xl shadow-sm border border-[#e3e8f9] min-w-0
      `}>
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-[#717881]">
            <MdMail size={48} className="mb-3 opacity-20" />
            <p>اختر رسالة لعرضها</p>
          </div>
        ) : (
          <>
            {/* هيدر */}
            <div className="p-4 lg:p-5 border-b border-[#e3e8f9] flex justify-between items-start">
              <div className="flex items-center gap-3">
                {/* زر الرجوع — موبايل فقط */}
                <button
                  onClick={() => setSelected(null)}
                  className="lg:hidden p-1.5 text-[#004e80] hover:bg-[#f1f3ff] rounded-lg transition-colors"
                >
                  <MdArrowBack size={20} />
                </button>
                <div>
                  <h3 className="font-bold text-[#161c27] text-base lg:text-lg">{selected.name}</h3>
                  <p className="text-xs lg:text-sm text-[#717881]">{selected.email}</p>
                  {selected.phone && (
                    <p className="text-xs lg:text-sm text-[#717881]">{selected.phone}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(selected._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <MdDelete size={18} />
              </button>
            </div>

            {/* نص الرسالة */}
            <div className="p-4 lg:p-5 flex-1 overflow-y-auto">
              <p className="text-[#161c27] leading-relaxed bg-[#f9f9ff] p-4 rounded-lg text-sm lg:text-base">
                {selected.message}
              </p>
              <p className="text-xs text-[#717881] mt-2">
                {new Date(selected.createdAt).toLocaleString("ar-SY")}
              </p>
            </div>

            {/* صندوق الرد */}
            <div className="p-4 border-t border-[#e3e8f9]">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="اكتب ردك هنا..."
                rows={3}
                className="w-full border border-[#c0c7d1] rounded-lg p-3 text-sm resize-none
                  focus:outline-none focus:border-[#004e80] transition-colors"
              />
              <button
                onClick={handleReply}
                disabled={sending || !replyText.trim()}
                className="mt-2 flex items-center gap-2 bg-[#004e80] text-white px-5 py-2 rounded-lg
                  hover:bg-[#004a79] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <MdReply size={16} />
                {sending ? "جاري الإرسال..." : "إرسال الرد"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Messages