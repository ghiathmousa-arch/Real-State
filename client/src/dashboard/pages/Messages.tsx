import { useEffect, useState } from "react"
// استيراد الأيقونات اللازمة من مكتبة react-icons لتنسيق صندوق الرسائل والمنبثقات
import {
  MdDelete, MdReply, MdMail, MdMailOutline,
  MdArrowBack, MdWarning, MdCheckCircle, MdClose
} from "react-icons/md"

// تعريف واجهة البيانات (Interface) لشكل الرسالة المستقبلة من قاعدة البيانات
interface Message {
  _id: string
  name: string
  email: string
  phone?: string
  message: string
  replied: boolean
  createdAt: string
}

// جلب الرابط الأساسي للـ API ومعالجة المسار ليتوافق مع البيئة المحلية والإنتاج تلقائياً
const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = API_URL?.replace("/api", "");

const Messages = () => {
  // ---- الحالات (States) الخاصة بمكون الرسائل ----
  const [messages, setMessages] = useState<Message[]>([]) // مصفوفة لتخزين الرسائل المجلوبة
  const [loading, setLoading] = useState(true)            // حالة التحميل أثناء جلب البيانات
  const [selected, setSelected] = useState<Message | null>(null) // الرسالة النشطة حالياً التي يعرضها الأدمن
  const [replyText, setReplyText] = useState("")          // نص الرد المكتوب داخل حقل النص
  const [sending, setSending] = useState(false)            // حالة إرسال الرد لتجنب التكرار

  // ---- حالات النوافذ المنبثقة المخصصة القياسية (Standard Popups States) ----
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);     // حالة فتح أو إغلاق مودال تأكيد الحذف
  const [deleteId, setDeleteId] = useState<string | null>(null); // تخزين معرف الرسالة المراد حذفها
  const [successPopup, setSuccessPopup] = useState(false);       // حالة إظهار بوب اب نجاح إرسال الرد

  // دالة لجلب الرسائل من السيرفر
  const fetchMessages = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/contact`)
      const data = await res.json()
      setMessages(data.data)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  // استدعاء دالة الجلب فور تحميل المكون لأول مرة
  useEffect(() => { fetchMessages() }, [])

  // دالة تشغيل منبثقة تأكيد الحذف
  const openDeleteConfirmation = (id: string) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  }

  // الدالة الفعلية لحذف الرسالة بعد التأكيد من المنبثقة المخصصة
  const confirmDelete = async () => {
    const id = deleteId;
    if (!id) return;

    try {
      await fetch(`${BASE_URL}/api/contact/${id}`, { method: "DELETE" })
      // تحديث قائمة الرسائل في الواجهة وحذف الرسالة المحذوفة
      setMessages(prev => prev.filter(m => m._id !== id))
      // إذا كانت الرسالة المحذوفة هي المعروضة حالياً، قم بإغلاق تفاصيلها
      if (selected?._id === id) setSelected(null)
    } catch (error) {
      console.error("Error deleting message:", error)
    } finally {
      // إغلاق المنبثقة وتصفير المعرف
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  }

  // دالة إرسال الرد عبر البريد الإلكتروني
  const handleReply = async () => {
    if (!selected || !replyText.trim()) return
    setSending(true)
    try {
      const res = await fetch(`${BASE_URL}/api/contact/${selected._id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText })
      })
      const data = await res.json()
      if (data.success) {
        setSuccessPopup(true) // إظهار بوب اب النجاح الأنيق
        setReplyText("")      // تفريغ صندوق الكتابة
        // تحديث حالة الرسالة محلياً لتصبح "تم الرد" دون الحاجة لإعادة جلب كل الرسائل
        setMessages(prev => prev.map(m => m._id === selected._id ? { ...m, replied: true } : m))
        setSelected(prev => prev ? { ...prev, replied: true } : null)
      }
    } catch (error) {
      console.error("Error sending reply:", error)
    } finally {
      setSending(false)
    }
  }

  // واجهة حالة التحميل (Skeleton / Loader)
  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#004e80] font-bold">
      جاري التحميل...
    </div>
  )

  return (
    <div className="flex gap-4 h-[calc(100vh-120px)] relative" dir="rtl">

      {/* ---- قائمة الرسائل الجانبية ---- */}
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

      {/* ---- قسم عرض تفاصيل الرسالة النشطة ---- */}
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
            {/* الهيدر العلوي للرسالة */}
            <div className="p-4 lg:p-5 border-b border-[#e3e8f9] flex justify-between items-start">
              <div className="flex items-center gap-3">
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
              {/* زر الحذف المرتبط الآن بالمنبثقة المخصصة */}
              <button
                onClick={() => openDeleteConfirmation(selected._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <MdDelete size={18} />
              </button>
            </div>

            {/* نص محتوى الرسالة المكتوب */}
            <div className="p-4 lg:p-5 flex-1 overflow-y-auto">
              <p className="text-[#161c27] leading-relaxed bg-[#f9f9ff] p-4 rounded-lg text-sm lg:text-base whitespace-pre-line">
                {selected.message}
              </p>
              <p className="text-xs text-[#717881] mt-2">
                {new Date(selected.createdAt).toLocaleString("ar-SY")}
              </p>
            </div>

            {/* صندوق إنشاء نص الرد وإرساله */}
            <div className="p-4 border-t border-[#e3e8f9]">
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="اكتب ردك هنا..."
                rows={3}
                className="w-full border border-[#c0c7d1] rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-[#004e80] transition-colors"
              />
              <button
                onClick={handleReply}
                disabled={sending || !replyText.trim()}
                className="mt-2 flex items-center gap-2 bg-[#004e80] text-white px-5 py-2 rounded-lg hover:bg-[#004a79] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <MdReply size={16} />
                {sending ? "جاري الإرسال..." : "إرسال الرد"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. منبثقة مخصصة لتأكيد الحذف (Custom Delete Confirmation Modal) */}
      {/* ======================================================== */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* الخلفية المظلمة الشفافة */}
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsDeleteOpen(false)} />

          {/* صندوق التنبيه الفعلي */}
          <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 text-red-500 mb-4">
              <MdWarning size={30} />
            </div>
            <h3 className="text-lg font-black text-[#161c27] mb-2">تأكيد حذف الرسالة</h3>
            <p className="text-sm text-[#717881] mb-6">هل أنت متأكد تماماً من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء لاحقاً.</p>

            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-red-600/20"
              >
                نعم، احذفها
              </button>
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. منبثقة عائمة للإشعار بالنجاح (Custom Success Toast/Popup) */}
      {/* ======================================================== */}
      {successPopup && (
        <div className="fixed bottom-6 left-6 z-[200] max-w-md w-full bg-white border border-green-100 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom duration-300 shadow-green-900/10">
          <div className="text-green-500 shrink-0 mt-0.5">
            <MdCheckCircle size={22} />
          </div>
          <div className="flex-1 text-right">
            <h4 className="text-sm font-black text-[#161c27]">تم الإرسال بنجاح</h4>
            <p className="text-xs text-[#717881] mt-0.5">تم إرسال ردك على البريد الإلكتروني للمخدم بنجاح.</p>
          </div>
          <button
            onClick={() => setSuccessPopup(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <MdClose size={18} />
          </button>
        </div>
      )}

    </div>
  )
}

export default Messages