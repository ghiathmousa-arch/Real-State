// صفحة "بانتظار الموافقة" (أدمن): طلبات تعديل السب أدمن.
// لكل طلب: صورة العقار وعنوانه، مين بعته وإيمتى، جدول "الحالي ← المقترح" للحقول اللي تغيّرت بس،
// الصور المحذوفة والجديدة، وزرّين موافقة / رفض (مع تأكيد).

import { useCallback, useEffect, useState } from "react"
import { MdCheck, MdClose, MdHomeWork, MdArrowBack } from "react-icons/md"
import Header from "../components/Header/Header"
import { api, getApiError } from "../../utils/api"
import { getImgSrc, formatPrice, formatRentPrices, RENT_PERIODS, type RentPrices } from "../../utils/format"

// ── تسميات الحقول والقيم ──────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  title: "العنوان", titleEn: "العنوان (EN)", description: "الوصف", descriptionEn: "الوصف (EN)",
  category: "الفئة", type: "النوع", price: "السعر", rentPrices: "أسعار الإيجار", furnished: "مفروش؟",
  city: "المدينة", area: "المساحة", rooms: "الغرف", bathrooms: "الحمامات",
  address: "العنوان التفصيلي", addressEn: "العنوان التفصيلي (EN)",
  features: "المميزات", featuresEn: "المميزات (EN)", videoUrl: "رابط الفيديو", status: "الحالة",
}
const TYPE_LABELS: Record<string, string> = { buy: "بيع", rent: "إيجار" }
const STATUS_LABELS: Record<string, string> = { active: "نشط", pending: "معلّق", sold: "مباع" }
const FURNISHED_LABELS: Record<string, string> = { furnished: "مفروش", unfurnished: "غير مفروش" }
const RENT_FIELD: Record<string, string> = { daily: "rentDaily", weekly: "rentWeekly", monthly: "rentMonthly", yearly: "rentYearly" }

const SIMPLE_FIELDS = ["title", "titleEn", "description", "descriptionEn", "category", "city", "address", "addressEn", "videoUrl"]
const NUMBER_FIELDS = ["area", "rooms", "bathrooms"]
const LIST_FIELDS = ["features", "featuresEn"]

const toNum = (v: any) => (v === undefined || v === null || String(v).trim() === "" ? null : Number(v))
const toList = (v: any): string[] =>
  Array.isArray(v) ? v : String(v ?? "").split(",").map(s => s.trim()).filter(Boolean)
const show = (v: any) => (v === null || v === undefined || v === "" ? "—" : String(v))
const rentText = (rp: RentPrices | null | undefined) => {
  const items = formatRentPrices(rp, true)
  return items.length ? items.map(i => i.text).join(" · ") : "عند الطلب"
}

interface Change { field: string; from: string; to: string }

// الحقول اللي تغيّرت فعلاً — بنفس منطق السيرفر (الحقل ما انبعت = ما تغيّر، "" = بيتمسح)
const diffChanges = (property: any, data: Record<string, any>): Change[] => {
  const changes: Change[] = []
  const push = (field: string, from: string, to: string) => { if (from !== to) changes.push({ field, from, to }) }

  SIMPLE_FIELDS.forEach(f => {
    if (data[f] !== undefined) push(f, show(property[f]), show(String(data[f]).trim()))
  })
  NUMBER_FIELDS.forEach(f => {
    if (data[f] !== undefined) push(f, show(property[f]), show(toNum(data[f])))
  })
  LIST_FIELDS.forEach(f => {
    if (data[f] !== undefined) push(f, (property[f] || []).join("، ") || "—", toList(data[f]).join("، ") || "—")
  })
  if (data.status !== undefined)
    push("status", STATUS_LABELS[property.status] ?? show(property.status), STATUS_LABELS[data.status] ?? show(data.status))
  if (data.furnished !== undefined)
    push("furnished", FURNISHED_LABELS[property.furnished] ?? "غير محدد", FURNISHED_LABELS[data.furnished] ?? "غير محدد")

  // النوع والسعر: تغيير النوع بيصفّر الطرف التاني
  const newType = data.type ?? property.type
  if (data.type !== undefined) push("type", TYPE_LABELS[property.type] ?? show(property.type), TYPE_LABELS[newType] ?? show(newType))

  if (newType === "rent") {
    const base: RentPrices = property.type === "rent" ? (property.rentPrices || {}) : {}
    const proposed: RentPrices = {}
    RENT_PERIODS.forEach(p => {
      const raw = data[RENT_FIELD[p]]
      proposed[p] = raw === undefined ? base[p] ?? null : toNum(raw)
    })
    push("rentPrices", property.type === "rent" ? rentText(property.rentPrices) : "—", rentText(proposed))
    if (property.type !== "rent" && property.price != null) push("price", formatPrice(property.price), "—")
  } else {
    const oldPrice = property.type === "rent" ? null : property.price
    const newPrice = data.price !== undefined ? toNum(data.price) : oldPrice
    push("price", property.price != null ? formatPrice(property.price) : "عند الطلب", newPrice != null ? formatPrice(newPrice) : "عند الطلب")
    if (property.type === "rent") push("rentPrices", rentText(property.rentPrices), "—")
  }
  return changes
}

// نفس معالجة روابط الصور بباقي الداشبورد (Cloudinary أو /uploads المحلية القديمة)
const imgSrc = (url: string) => getImgSrc([url]) ?? ""

// ── كرت الطلب ────────────────────────────────────────────
const RequestCard = ({ property, onDone }: { property: any; onDone: () => void }) => {
  const pending = property.pendingChanges
  const [confirming, setConfirming] = useState<"approve" | "reject" | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const changes = diffChanges(property, pending.data || {})
  const currentImages: string[] = property.images || []
  const removedImages = pending.keepImages ? currentImages.filter((u: string) => !pending.keepImages.includes(u)) : []
  const newImages: string[] = pending.newImages || []
  const cover = getImgSrc(currentImages)

  const act = async (kind: "approve" | "reject") => {
    setBusy(true)
    setError("")
    try {
      await api.post(`/properties/${property._id}/${kind === "approve" ? "approve-changes" : "reject-changes"}`)
      onDone()
    } catch (err) {
      setError(getApiError(err, kind === "approve" ? "تعذّرت الموافقة، حاول مرة تانية" : "تعذّر الرفض، حاول مرة تانية"))
      setConfirming(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-4 sm:p-6 flex flex-col gap-5">
      {/* الرأس */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-gray-100 flex items-center justify-center">
          {cover ? <img src={cover} className="w-full h-full object-cover" alt={property.title} /> : <MdHomeWork size={24} className="text-gray-300" />}
        </div>
        <div className="min-w-0">
          <h3 className="font-black text-[#0f2d4a] truncate">{property.title}</h3>
          <p className="text-xs text-gray-400 font-bold mt-1">
            طلب من <span className="text-[#004e80]">{pending.submittedBy?.name || "—"}</span>
            {pending.submittedAt && <> · {new Date(pending.submittedAt).toLocaleString("ar-SY")}</>}
          </p>
        </div>
      </div>

      {/* الحالي ← المقترح */}
      {changes.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-gray-100">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-[11px] text-gray-400 font-black">
              <tr>
                <th className="px-3 py-2 w-32">الحقل</th>
                <th className="px-3 py-2">الحالي</th>
                <th className="px-3 py-2 w-6"></th>
                <th className="px-3 py-2">المقترح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {changes.map(c => (
                <tr key={c.field}>
                  <td className="px-3 py-2 font-black text-gray-500 text-xs whitespace-nowrap">{FIELD_LABELS[c.field] ?? c.field}</td>
                  <td className="px-3 py-2 text-gray-500 bg-red-50/50 line-through decoration-red-300 break-words max-w-[240px]">{c.from}</td>
                  <td className="px-1 py-2 text-gray-300"><MdArrowBack /></td>
                  <td className="px-3 py-2 font-bold text-[#0f2d4a] bg-green-50 break-words max-w-[240px]">{c.to}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-400 font-bold">ما في تغييرات بالحقول — بس تغييرات بالصور (إذا في).</p>
      )}

      {/* الصور */}
      {(removedImages.length > 0 || newImages.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {removedImages.length > 0 && (
            <div>
              <p className="text-xs font-black text-red-500 mb-2">صور رح تنحذف ({removedImages.length})</p>
              <div className="flex flex-wrap gap-2">
                {removedImages.map((u: string) => (
                  <img key={u} src={imgSrc(u)} className="w-20 h-14 object-cover rounded-xl border-2 border-red-300 opacity-60" alt="" />
                ))}
              </div>
            </div>
          )}
          {newImages.length > 0 && (
            <div>
              <p className="text-xs font-black text-green-600 mb-2">صور جديدة ({newImages.length})</p>
              <div className="flex flex-wrap gap-2">
                {newImages.map(u => (
                  <img key={u} src={imgSrc(u)} className="w-20 h-14 object-cover rounded-xl border-2 border-green-400" alt="" />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{error}</p>
      )}

      {/* موافقة / رفض — مع تأكيد */}
      {confirming ? (
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 rounded-2xl p-3">
          <span className="text-sm font-black text-[#0f2d4a]">
            {confirming === "approve" ? "متأكد إنك بدك تطبّق التعديل؟" : "متأكد إنك بدك ترفض التعديل؟ الصور الجديدة رح تنحذف."}
          </span>
          <div className="flex gap-2 ms-auto">
            <button disabled={busy} onClick={() => act(confirming)}
              className={`px-5 py-2.5 rounded-xl text-white font-black text-sm disabled:opacity-50 ${confirming === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
              {busy ? "..." : "نعم"}
            </button>
            <button disabled={busy} onClick={() => setConfirming(null)}
              className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-600 font-black text-sm">
              لا
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <button onClick={() => setConfirming("approve")}
            className="flex-1 py-3.5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black flex items-center justify-center gap-2 transition">
            <MdCheck size={20} /> موافقة
          </button>
          <button onClick={() => setConfirming("reject")}
            className="flex-1 py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-black flex items-center justify-center gap-2 transition">
            <MdClose size={20} /> رفض
          </button>
        </div>
      )}
    </div>
  )
}

// ── الصفحة ───────────────────────────────────────────────
const PendingChanges = () => {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const { data } = await api.get("/properties/pending-changes")
      setRequests(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(getApiError(err, "تعذّر جلب الطلبات"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  return (
    <div className="p-4 sm:p-8 bg-[#f8faff] min-h-screen" dir="rtl">
      <Header title="بانتظار الموافقة" description="تعديلات السب أدمن — ما بتتطبّق إلا بموافقتك" />

      <div className="mt-8 flex flex-col gap-6">
        {loading ? (
          [1, 2].map(n => <div key={n} className="h-64 rounded-[1.5rem] bg-gray-100 animate-pulse" />)
        ) : error ? (
          <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{error}</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold">ما في طلبات تعديل معلّقة 🎉</div>
        ) : (
          requests.map(p => <RequestCard key={p._id} property={p} onDone={fetchRequests} />)
        )}
      </div>
    </div>
  )
}

export default PendingChanges
