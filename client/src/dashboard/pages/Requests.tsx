// صفحة "طلبات العرض" (أدمن وسب أدمن): طلبات "اعرض عقارك" من الموقع العام.
// تبويبات: جديدة (n) · محوّلة · مرفوضة. لكل طلب: صورة، النوع، الفئة، المدينة، السعر، اسم المالك
// ورقمه (واتساب + اتصال)، التاريخ — وزرّين "تحويل لعقار" (بيفتح فورم الإضافة معبّى) و"رفض" (مع سبب وتأكيد).

import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MdHomeWork, MdPhone, MdClose, MdSwapHoriz } from "react-icons/md"
import Header from "../components/Header/Header"
import { api, getApiError } from "../../utils/api"
import { getImgSrc, formatPrice, formatRentPrices } from "../../utils/format"

type Status = "new" | "converted" | "rejected"

const TABS: { value: Status; label: string }[] = [
  { value: "new", label: "جديدة" },
  { value: "converted", label: "محوّلة" },
  { value: "rejected", label: "مرفوضة" },
]

const FURNISHED_LABELS: Record<string, string> = { furnished: "مفروش", unfurnished: "غير مفروش" }

// رقم سوري محلي (09...) → صيغة دولية لواتساب (9639...)
const toWhatsApp = (phone: string) => {
  const digits = phone.replace(/[^0-9]/g, "")
  if (phone.trim().startsWith("+")) return digits
  if (digits.startsWith("00")) return digits.slice(2)
  if (digits.startsWith("0")) return `963${digits.slice(1)}`
  return digits
}

const priceText = (r: any) => {
  if (r.type === "rent") {
    const items = formatRentPrices(r.rentPrices, true)
    return items.length ? items.map(i => i.text).join(" · ") : "السعر عند الطلب"
  }
  return r.price != null ? formatPrice(r.price) : "السعر عند الطلب"
}

const RequestCard = ({ request, onChanged }: { request: any; onChanged: () => void }) => {
  const navigate = useNavigate()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const cover = getImgSrc(request.images || [])
  const isNew = request.status === "new"

  const reject = async () => {
    setBusy(true)
    setError("")
    try {
      await api.post(`/property-requests/${request._id}/reject`, { reason })
      onChanged()
    } catch (err) {
      setError(getApiError(err, "تعذّر رفض الطلب"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <div className="relative h-40 bg-gray-50 flex items-center justify-center">
        {cover ? <img src={cover} className="w-full h-full object-cover" alt="" /> : <MdHomeWork size={40} className="text-gray-300" />}
        <span className={`absolute top-3 right-3 text-xs font-black px-3 py-1 rounded-full text-white ${request.type === "rent" ? "bg-amber-500" : "bg-sky-600"}`}>
          {request.type === "rent" ? "إيجار" : "بيع"}
        </span>
        {request.images?.length > 1 && (
          <span className="absolute bottom-3 left-3 text-[10px] font-black px-2 py-0.5 rounded-full bg-black/60 text-white">{request.images.length} صور</span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-black text-[#0f2d4a]">{request.category} — {request.city}</h3>
          <p className="text-sm font-black text-sky-700 mt-1">{priceText(request)}</p>
          <p className="text-[11px] text-gray-400 font-bold mt-1">
            {[request.area ? `${request.area} م²` : "", request.rooms ? `${request.rooms} غرف` : "", request.bathrooms ? `${request.bathrooms} حمام` : "", FURNISHED_LABELS[request.furnished] || ""].filter(Boolean).join(" · ")}
          </p>
          {request.address && <p className="text-xs text-gray-500 mt-1">{request.address}</p>}
          {request.description && <p className="text-xs text-gray-500 mt-2 line-clamp-3">{request.description}</p>}
        </div>

        {/* المالك — للفريق بس، ما بيطلع للعامة */}
        <div className="bg-gray-50 rounded-2xl p-3">
          <p className="text-sm font-black text-[#0f2d4a]">{request.ownerName}</p>
          <p className="text-sm font-bold text-gray-500 mt-0.5" dir="ltr">{request.ownerPhone}</p>
          {request.ownerNote && <p className="text-xs text-gray-500 mt-1">{request.ownerNote}</p>}
          <div className="flex gap-2 mt-3">
            <a href={`https://wa.me/${toWhatsApp(request.ownerPhone)}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-black flex items-center justify-center gap-1.5">
              <img src="/img/whatsapp.svg" width={16} height={16} alt="" /> واتساب
            </a>
            <a href={`tel:${request.ownerPhone}`}
              className="flex-1 py-2 rounded-xl bg-[#004e80] hover:bg-[#003d6b] text-white text-xs font-black flex items-center justify-center gap-1.5">
              <MdPhone size={16} /> اتصال
            </a>
          </div>
        </div>

        <p className="text-[11px] text-gray-400 font-bold">
          {new Date(request.createdAt).toLocaleString("ar-SY")}
          {request.handledBy?.name && ` · عالجه ${request.handledBy.name}`}
        </p>
        {request.status === "rejected" && request.rejectReason && (
          <p className="text-xs font-bold text-red-600 bg-red-50 rounded-xl px-3 py-2">سبب الرفض: {request.rejectReason}</p>
        )}
        {request.status === "converted" && request.propertyId && (
          <button onClick={() => navigate("/dashboard/properties")}
            className="text-xs font-black text-green-700 bg-green-50 rounded-xl px-3 py-2 text-right">
            تحوّل لعقار ✓
          </button>
        )}

        {error && <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

        {isNew && (rejecting ? (
          <div className="flex flex-col gap-2 mt-auto">
            <textarea value={reason} onChange={e => setReason(e.target.value)} maxLength={500} rows={2}
              placeholder="سبب الرفض (اختياري)"
              className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-red-300 resize-none" />
            <p className="text-xs font-bold text-gray-500">متأكد؟ صور الطلب رح تنحذف.</p>
            <div className="flex gap-2">
              <button disabled={busy} onClick={reject}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-black disabled:opacity-50">
                {busy ? "..." : "تأكيد الرفض"}
              </button>
              <button disabled={busy} onClick={() => setRejecting(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-black">
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mt-auto">
            <button onClick={() => navigate(`/dashboard/requests/${request._id}/convert`)}
              className="flex-1 py-3 rounded-xl bg-[#0f2d4a] hover:bg-blue-900 text-white text-sm font-black flex items-center justify-center gap-1.5">
              <MdSwapHoriz size={18} /> تحويل لعقار
            </button>
            <button onClick={() => setRejecting(true)}
              className="px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-black flex items-center gap-1">
              <MdClose size={16} /> رفض
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const Requests = () => {
  const [status, setStatus] = useState<Status>("new")
  const [requests, setRequests] = useState<any[]>([])
  const [newCount, setNewCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const [list, count] = await Promise.all([
        api.get("/property-requests", { params: { status } }),
        api.get("/property-requests/count"),
      ])
      setRequests(Array.isArray(list.data) ? list.data : [])
      setNewCount(count.data?.count ?? 0)
    } catch (err) {
      setError(getApiError(err, "تعذّر جلب الطلبات"))
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div className="p-4 sm:p-8 bg-[#f8faff] min-h-screen" dir="rtl">
      <Header title="طلبات العرض" description="عقارات بعتها أصحابها من صفحة &quot;اعرض عقارك&quot; — ما بتنزل عالموقع إلا بعد التحويل" />

      <div className="flex gap-2 mt-6 mb-6">
        {TABS.map(tab => (
          <button key={tab.value} onClick={() => setStatus(tab.value)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-black transition ${status === tab.value ? "bg-[#0f2d4a] text-white shadow" : "bg-white border border-gray-100 text-gray-500 hover:bg-gray-50"}`}>
            {tab.label}{tab.value === "new" && ` (${newCount})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <div key={n} className="h-96 rounded-[1.5rem] bg-gray-100 animate-pulse" />)}
        </div>
      ) : error ? (
        <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{error}</p>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-bold">ما في طلبات هون</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {requests.map(r => <RequestCard key={r._id} request={r} onChanged={fetchData} />)}
        </div>
      )}
    </div>
  )
}

export default Requests
