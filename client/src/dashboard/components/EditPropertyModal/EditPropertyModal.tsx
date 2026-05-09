import { useState, useEffect } from 'react'
import { MdClose, MdSave, MdCloudUpload } from "react-icons/md"
import axios from 'axios'
import SuccessModal from '../SuccessModal/SuccessModal'

const CITIES = [
  "دمشق", "ريف دمشق", "حلب", "ريف حلب", "حمص",
  "حماة", "اللاذقية", "طرطوس", "إدلب", "درعا",
  "السويداء", "القنيطرة", "دير الزور", "الحسكة", "الرقة"
]
const CITIES_EN = [
  "Damascus", "Rif Dimashq", "Aleppo", "Rif Aleppo", "Homs",
  "Hama", "Latakia", "Tartus", "Idlib", "Daraa",
  "Suwayda", "Quneitra", "Deir ez-Zor", "Al-Hasakah", "Raqqa"
]
const CATEGORIES = ["شقة", "منزل", "أرض", "مزرعة"]
const CATEGORIES_EN = ["Apartment", "House", "Land", "Farm"]

interface Props {
  isOpen: boolean
  onClose: () => void
  property: any
  onSuccess: () => void
}

const EditPropertyModal = ({ isOpen, onClose, property, onSuccess }: Props) => {
  const [formData, setFormData] = useState<any>({})
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [features, setFeatures] = useState<string[]>([])
  const [featuresEn, setFeaturesEn] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState("")
  const [featureInputEn, setFeatureInputEn] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const BACKEND_URL = "http://localhost:5000"

  useEffect(() => {
    if (property) {
      setFormData({ ...property })
      setFeatures(property.features || [])
      setFeaturesEn(property.featuresEn || [])
    }
  }, [property])

  if (!isOpen) return null

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }))
  }

  const addFeature = () => {
    const val = featureInput.trim()
    if (val && !features.includes(val)) {
      setFeatures(prev => [...prev, val])
      setFeatureInput("")
    }
  }

  const addFeatureEn = () => {
    const val = featureInputEn.trim()
    if (val && !featuresEn.includes(val)) {
      setFeaturesEn(prev => [...prev, val])
      setFeatureInputEn("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const data = new FormData()

      const fields = [
        'title', 'titleEn',
        'description', 'descriptionEn',
        'category', 'categoryEn',
        'type', 'price', 'city', 'cityEn',
        'area', 'rooms', 'bathrooms',
        'address', 'addressEn', 'status'
      ]
      fields.forEach(f => {
        if (formData[f] !== undefined && formData[f] !== null)
          data.append(f, String(formData[f]))
      })

      data.append('isFeatured', String(formData.isFeatured === true || formData.isFeatured === "true"))
      data.append('features', features.join(','))
      data.append('featuresEn', featuresEn.join(','))

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

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

        <form onSubmit={handleSubmit}
          className="relative bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 overflow-y-auto max-h-[95vh] sm:max-h-[90vh] shadow-2xl"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0f2d4a]">تعديل بيانات العقار</h2>
              <p className="text-xs text-gray-400 font-bold mt-1">تحديث المعلومات بالعربي والإنجليزي</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 sm:p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
              <MdClose size={22} />
            </button>
          </div>

          {/* الصورة الحالية */}
          {property?.images?.[0] && !selectedFiles && (
            <div className="mb-5">
              <p className="text-xs font-black text-gray-400 mb-2">الصورة الحالية</p>
              <img src={`${BACKEND_URL}${property.images[0]}`}
                className="w-full h-36 sm:h-40 object-cover rounded-2xl border border-gray-100" alt="current" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* العنوان */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">عنوان العقار</label>
              <input type="text"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">Property Title (EN)</label>
              <input type="text" dir="ltr"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.titleEn || ''} onChange={e => handleChange('titleEn', e.target.value)} />
            </div>

            {/* الوصف */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">الوصف</label>
              <textarea rows={3}
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a] resize-none"
                value={formData.description || ''} onChange={e => handleChange('description', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">Description (EN)</label>
              <textarea rows={3} dir="ltr"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a] resize-none"
                value={formData.descriptionEn || ''} onChange={e => handleChange('descriptionEn', e.target.value)} />
            </div>

            {/* الفئة */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">الفئة</label>
              <select className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.category || ''} onChange={e => handleChange('category', e.target.value)}>
                <option value="">اختر الفئة</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">Category (EN)</label>
              <select dir="ltr" className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.categoryEn || ''} onChange={e => handleChange('categoryEn', e.target.value)}>
                <option value="">Select Category</option>
                {CATEGORIES_EN.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* النوع */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">النوع</label>
              <select className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.type || ''} onChange={e => handleChange('type', e.target.value)}>
                <option value="buy">بيع</option>
                <option value="rent">إيجار</option>
              </select>
            </div>

            {/* السعر */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">السعر (ل.س)</label>
              <input type="text" inputMode="numeric"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-blue-600"
                value={formData.price || ''}
                onChange={e => handleChange('price', e.target.value.replace(/[^0-9]/g, ''))} />
            </div>

            {/* المساحة */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">المساحة (م²)</label>
              <input type="number"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.area || ''} onChange={e => handleChange('area', e.target.value)} />
            </div>

            {/* المدينة */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">المدينة</label>
              <select className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.city || ''} onChange={e => handleChange('city', e.target.value)}>
                <option value="">اختر المدينة</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">City (EN)</label>
              <select dir="ltr" className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.cityEn || ''} onChange={e => handleChange('cityEn', e.target.value)}>
                <option value="">Select City</option>
                {CITIES_EN.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* العنوان */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">العنوان التفصيلي</label>
              <input type="text"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">Address (EN)</label>
              <input type="text" dir="ltr"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.addressEn || ''} onChange={e => handleChange('addressEn', e.target.value)} />
            </div>

            {/* الغرف والحمامات */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">عدد الغرف</label>
              <input type="number"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.rooms || ''} onChange={e => handleChange('rooms', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">عدد الحمامات</label>
              <input type="number"
                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.bathrooms || ''} onChange={e => handleChange('bathrooms', e.target.value)} />
            </div>

            {/* الحالة والمميز */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">الحالة</label>
              <select className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.status || 'active'} onChange={e => handleChange('status', e.target.value)}>
                <option value="active">نشط</option>
                <option value="sold">مباع</option>
                <option value="pending">معلق</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">مميز؟</label>
              <select className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]"
                value={formData.isFeatured ? "true" : "false"} onChange={e => handleChange('isFeatured', e.target.value)}>
                <option value="true">نعم</option>
                <option value="false">لا</option>
              </select>
            </div>

            {/* المميزات عربي */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">المميزات (عربي)</label>
              <div className="flex gap-2">
                <input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="مسبح، حديقة..."
                  className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a]" />
                <button type="button" onClick={addFeature} className="px-4 py-2 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition">+</button>
              </div>
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {features.map((f, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold">
                      {f}
                      <button type="button" onClick={() => setFeatures(prev => prev.filter((_, j) => j !== i))} className="text-blue-400 hover:text-red-500">
                        <MdClose size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* المميزات إنجليزي */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-gray-400">Features (EN)</label>
              <div className="flex gap-2">
                <input value={featureInputEn} onChange={e => setFeatureInputEn(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeatureEn())}
                  placeholder="Pool, Garden..." dir="ltr"
                  className="flex-1 p-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a]" />
                <button type="button" onClick={addFeatureEn} className="px-4 py-2 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition">+</button>
              </div>
              {featuresEn.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {featuresEn.map((f, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold">
                      {f}
                      <button type="button" onClick={() => setFeaturesEn(prev => prev.filter((_, j) => j !== i))} className="text-green-400 hover:text-red-500">
                        <MdClose size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* الصور */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-black text-gray-400">
                استبدال الصور {selectedFiles ? `— تم اختيار ${selectedFiles.length} صور` : "(اختياري)"}
              </label>
              <div className="relative group">
                <input type="file" multiple accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={e => setSelectedFiles(e.target.files)} />
                <div className={`p-5 sm:p-6 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-2 transition-all
                  ${selectedFiles ? "border-blue-400 bg-blue-50" : "border-gray-200 group-hover:border-blue-400"}`}>
                  <MdCloudUpload size={30} className={selectedFiles ? "text-blue-500" : "text-gray-300 group-hover:text-blue-500"} />
                  <span className="text-xs font-bold text-gray-400 text-center">
                    {selectedFiles ? `${selectedFiles.length} صور جاهزة — ستحل محل القديمة` : "اسحب الصور هنا أو اضغط للاختيار"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full mt-6 sm:mt-8 py-4 sm:py-5 bg-[#0f2d4a] text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-900 shadow-xl transition-all disabled:opacity-50">
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