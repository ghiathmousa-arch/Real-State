// "تحويل لعقار": بيجيب الطلب وبيفتح فورم الإضافة (AddProperty) بوضع "من طلب" معبّى ببياناته وصوره.
import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import AddProperty, { type ListingRequest } from "../components/AddProperty/AddProperty"
import { api, getApiError } from "../../utils/api"

const ConvertRequest = () => {
  const { id } = useParams<{ id: string }>()
  const [request, setRequest] = useState<ListingRequest | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    api.get(`/property-requests/${id}`)
      .then(({ data }) => {
        if (data.status !== "new") setError("هالطلب انعالج من قبل (محوّل أو مرفوض)")
        else setRequest(data)
      })
      .catch(err => setError(getApiError(err, "تعذّر جلب الطلب")))
  }, [id])

  if (error)
    return (
      <div className="p-10 text-center" dir="rtl">
        <p className="text-red-600 font-bold mb-4">{error}</p>
        <Link to="/dashboard/requests" className="text-[#004e80] font-black underline">رجوع للطلبات</Link>
      </div>
    )

  if (!request) return <div className="p-10 text-center text-[#004e80] font-bold">جاري التحميل...</div>

  return <AddProperty fromRequest={request} />
}

export default ConvertRequest
