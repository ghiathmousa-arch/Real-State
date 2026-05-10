import { useState, useEffect } from "react"
import { MdClose, MdSend } from "react-icons/md"
import { RiRobot2Fill } from "react-icons/ri"
import { useTranslation } from "react-i18next"

interface Message {
  role: "ai" | "user"
  text: string
}

const AiChat = () => {
  const { t } = useTranslation()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: t("ai_chat.welcome") }
  ])
  const [input, setInput] = useState("")

  // إعادة ضبط رسالة الترحيب عند تغيير اللغة
useEffect(() => {
  setMessages(prev => {
    // إذا أول رسالة هي رسالة الترحيب فقط عدّلها
    const updated = [...prev]

    if (updated.length > 0 && updated[0].role === "ai") {
      updated[0] = {
        role: "ai",
        text: t("ai_chat.welcome")
      }
    }

    return updated
  })
}, [t])

  const handleSend = () => {
    if (!input.trim()) return

    setMessages(prev => [...prev, { role: "user", text: input }])
    setInput("")

    // مؤقتاً — رح تربطو بالـ AI لاحقاً
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: "ai", text: t("ai_chat.coming_soon") }
      ])
    }, 800)
  }

  return (
    <>
      {/* البوب */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-4 sm:left-6 z-200 w-[calc(100vw-32px)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#e3e8f9] flex flex-col overflow-hidden"
          style={{ maxHeight: "70vh" }}
        >
          {/* هيدر */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#004e80]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white font-bold text-sm">
                {t("ai_chat.title")}
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition"
            >
              <MdClose size={20} title={t("ai_chat.close")} />
            </button>
          </div>

          {/* الرسائل */}
          <div
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#f9f9ff]"
            dir="rtl"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-relaxed
                  ${
                    msg.role === "ai"
                      ? "bg-white border border-[#e3e8f9] text-[#161c27] rounded-tr-sm"
                      : "bg-[#004e80] text-white rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* الإدخال */}
          <div
            className="p-3 border-t border-[#e3e8f9] flex items-center gap-2 bg-white"
            dir="rtl"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder={t("ai_chat.placeholder")}
              className="flex-1 text-sm px-4 py-2.5 bg-[#f1f3ff] rounded-xl outline-none focus:ring-2 focus:ring-[#004e80]/20 text-[#161c27]"
            />

            <button
              onClick={handleSend}
              className="p-2.5 bg-[#004e80] text-white rounded-xl hover:bg-[#003d6b] transition active:scale-95"
            >
              <MdSend size={18} />
            </button>
          </div>
        </div>
      )}

      {/* الزر العائم */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-4 sm:left-6 z-200 w-14 h-14 bg-[#004e80] text-white rounded-full shadow-lg hover:bg-[#003d6b] transition-all active:scale-95 flex items-center justify-center"
      >
        {isOpen ? (
          <MdClose size={24} />
        ) : (
          <RiRobot2Fill size={26} />
        )}
      </button>
    </>
  )
}

export default AiChat