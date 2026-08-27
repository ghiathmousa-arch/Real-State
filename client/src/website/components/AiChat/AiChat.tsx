import { useState, useEffect, useRef } from "react"
import { MdClose, MdSend } from "react-icons/md"
import { RiRobot2Fill } from "react-icons/ri"

interface Message {
  role: "ai" | "user"
  text: string
}

const FLASK_URL = import.meta.env.VITE_CHATBOT_URL || "http://127.0.0.1:5001"

const AiChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // تمرير للأسفل عند كل رسالة جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // إرجاع الفوكس لحقل الكتابة بعد فتح الشات أو استلام رد
  useEffect(() => {
    if (isOpen && !isLoading) {
      inputRef.current?.focus()
    }
  }, [isOpen, isLoading])

  // بدء جلسة جديدة عند فتح الشات
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startSession()
    }
  }, [isOpen])

  const startSession = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${FLASK_URL}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: null })
      })
      const data = await res.json()
      setSessionId(data.session_id)
      setMessages([{ role: "ai", text: data.response }])
    } catch {
      setMessages([{ role: "ai", text: "⚠️ تعذر الاتصال بالخادم. تأكد من تشغيل سيرفر الـ Chatbot." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userText = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", text: userText }])
    setIsLoading(true)

    try {
      const res = await fetch(`${FLASK_URL}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, user_input: userText })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: "ai", text: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "⚠️ حدث خطأ، يرجى المحاولة لاحقاً." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    if (sessionId) {
      await fetch(`${FLASK_URL}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      })
    }
    setSessionId(null)
    setMessages([])
    startSession()
  }

  return (
    <>
      {/* البوب */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-4 sm:left-6 z-[200] w-[calc(100vw-32px)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#e3e8f9] flex flex-col overflow-hidden"
          style={{ maxHeight: "70vh" }}
        >
          {/* هيدر */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#004e80]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white font-bold text-sm">AI Chat</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="text-white/70 hover:text-white text-xs transition"
                title="بدء محادثة جديدة"
              >
                🔄 إعادة
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition">
                <MdClose size={20} />
              </button>
            </div>
          </div>

          {/* الرسائل */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#f9f9ff]" dir="rtl">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line leading-relaxed
                  ${msg.role === "ai"
                      ? "bg-white border border-[#e3e8f9] text-[#161c27] rounded-tr-sm"
                      : "bg-[#004e80] text-white rounded-tl-sm"
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* مؤشر التحميل */}
            {isLoading && (
              <div className="flex justify-end">
                <div className="bg-white border border-[#e3e8f9] px-4 py-2.5 rounded-2xl rounded-tr-sm">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-[#004e80] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-[#004e80] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-[#004e80] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* الإدخال */}
          <div className="p-3 border-t border-[#e3e8f9] flex items-center gap-2 bg-white" dir="rtl">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="اكتب رسالتك..."
              disabled={isLoading}
              className="flex-1 text-sm px-4 py-2.5 bg-[#f1f3ff] rounded-xl outline-none focus:ring-2 focus:ring-[#004e80]/20 text-[#161c27] disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="p-2.5 bg-[#004e80] text-white rounded-xl hover:bg-[#003d6b] transition active:scale-95 disabled:opacity-50"
            >
              <MdSend size={18} />
            </button>
          </div>
        </div>
      )}

      {/* الزر العائم */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-4 sm:left-6 z-[200] w-14 h-14 bg-[#004e80] text-white rounded-full shadow-lg hover:bg-[#003d6b] transition-all active:scale-95 flex items-center justify-center"
      >
        {isOpen ? <MdClose size={24} /> : <RiRobot2Fill size={26} />}
      </button>
    </>
  )
}

export default AiChat