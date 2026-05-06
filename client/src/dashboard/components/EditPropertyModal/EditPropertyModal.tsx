import { useState, useEffect } from 'react'
import { MdClose, MdSave, MdCloudUpload } from "react-icons/md"
import axios from 'axios'
import SuccessModal from '../SuccessModal/SuccessModal'

interface Props {
  isOpen: boolean
  onClose: () => void
  property: any
  onSuccess: () => void
}

const EditPropertyModal = ({ isOpen, onClose, property, onSuccess }: Props) => {
  const [formData, setFormData] = useState<any>({})
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const BACKEND_URL = "http://localhost:5000"

  useEffect(() => {
    if (property) setFormData({ ...property })
  }, [property])

  if (!isOpen) return null

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const data = new FormData()

      const fields = ['title', 'price', 'area', 'city', 'description', 'category', 'type', 'rooms', 'bathrooms', 'address', 'status']
      fields.forEach(f => {
        if (formData[f] !== undefined && formData[f] !== null)
          data.append(f, String(formData[f]))
      })
      data.append('isFeatured', String(formData.isFeatured === true || formData.isFeatured === "true"))

      if (selectedFiles && selectedFiles.length > 0) {
        data.append('replaceImages', 'true')
        Array.from(selectedFiles).forEach(file => data.append('images', file))
      } else {
        data.append('replaceImages', 'false')
      }

      await axios.put(`${BACKEND_URL}/api/properties/${property._id}`, data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })

      setShowSuccess(true)
    } catch (error: any) {
      console.error("فشل التعديل:", error.response?.data?.error || "خطأ في السيرفر")
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: "عنوان العقار", key: "title", type: "text", colSpan: true },
    { label: "السعر (ل.س)", key: "price", type: "number", colSpan: false },
    { label: "المساحة (م²)", key: "area", type: "number", colSpan: false },
    { label: "المدينة", key: "city", type: "text", colSpan: false },
    { label: "العنوان", key: "address", type: "text", colSpan: false },
    { label: "عدد الغرف", key: "rooms", type: "number", colSpan: false },
    { label: "عدد الحمامات", key: "bathrooms", type: "number", colSpan: false },
  ]

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

        <form
          onSubmit={handleSubmit}
          className="relative bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 overflow-y-auto max-h-[95vh] sm:max-h-[90vh] shadow-2xl"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0f2d4a]">تعديل بيانات العقار</h2>
              <p className="text-xs text-gray-400 font-bold mt-1">تحديث المعلومات الأساسية والصور</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 sm:p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
              <MdClose size={22} />
            </button>
          </div>

          {/* الصورة الحالية */}
          {property?.images?.[0] && !selectedFiles && (
            <div className="mb-5">
              <p className="text-xs font-black text-gray-400 mb-2">الصورة الحالية</p>
              <img
                src={`${BACKEND_URL}${property.images[0]}`}
                className="w-full h-36 sm:h-40 object-cover rounded-2xl border border-gray-100"
                alt="current"
              />
            </div>
          )}

          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.key} className={`space-y-1.5 ${field.colSpan ? "sm:col-span-2" : ""}`}>
                <label className="block text-xs font-black text-gray-400">{field.label}</label>
                <input
                  type={field.type}
                  className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                  value={
                    formData[field.key] !== undefined && formData[field.key] !== null
                      ? String(formData[field.key])
                      : ''
                  }
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              </div>
            ))}

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">الحالة</label>
              <select
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.status || 'active'}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="active">نشط</option>
                <option value="sold">مباع</option>
                <option value="pending">معلق</option>
              </select>
            </div>

            {/* isFeatured */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">مميز؟</label>
              <select
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.isFeatured ? "true" : "false"}
                onChange={(e) => handleChange('isFeatured', e.target.value)}
              >
                <option value="true">نعم</option>
                <option value="false">لا</option>
              </select>
            </div>

            {/* Upload */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-black text-gray-400">
                استبدال الصور {selectedFiles ? `— تم اختيار ${selectedFiles.length} صور` : "(اختياري)"}
              </label>
              <div className="relative group">
                <input
                  type="file" multiple accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                />
                <div className={`p-5 sm:p-6 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-2 transition-all ${selectedFiles ? "border-blue-400 bg-blue-50" : "border-gray-200 group-hover:border-blue-400"
                  }`}>
                  <MdCloudUpload size={30} className={selectedFiles ? "text-blue-500" : "text-gray-300 group-hover:text-blue-500"} />
                  <span className="text-xs font-bold text-gray-400 text-center">
                    {selectedFiles
                      ? `${selectedFiles.length} صور جاهزة للرفع — ستحل محل القديمة`
                      : "اسحب الصور هنا أو اضغط للاختيار"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 sm:mt-8 py-4 sm:py-5 bg-[#0f2d4a] text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-900 shadow-xl transition-all disabled:opacity-50"
          >
            <MdSave size={22} />
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        title="تم التعديل!"
        message="تم تحديث بيانات العقار بنجاح"
        primaryBtn={{
          label: "حسناً",
          onClick: () => { setShowSuccess(false); onSuccess(); onClose() }
        }}
      />
    </>
  )
}

export default EditPropertyModal