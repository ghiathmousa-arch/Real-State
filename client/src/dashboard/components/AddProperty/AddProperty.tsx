import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdCloudUpload, MdClose, MdSave } from 'react-icons/md'
import Header from '../Header/Header'
import SuccessModal from '../SuccessModal/SuccessModal'
import FormInput from '../../../components/FormInput/FormInput'
import FormSelect from '../../../components/FormSelect/FormSelect'
import FeatureInput from '../FeatureInput/FeatureInput'
import { buildPropertyFormData } from '../../../utils/buildPropertyFormData'
import {
  usePropertyOptions,
  PROPERTY_TYPES, PROPERTY_STATUS, FEATURED_OPTIONS
} from '../../../constants/property'

const API_URL = import.meta.env.VITE_API_URL
const BASE_URL = API_URL?.replace("/api", "")

const TEXT_FIELDS = [
  { name: "title", label: "عنوان العقار", placeholder: "شقة فاخرة في المزة", required: true },
  { name: "titleEn", label: "Property Title (EN)", placeholder: "Luxury Apartment in Mezza", dir: "ltr" as const },
  { name: "description", label: "الوصف", placeholder: "وصف تفصيلي للعقار...", isTextarea: true },
  { name: "descriptionEn", label: "Description (EN)", placeholder: "Detailed description...", dir: "ltr" as const, isTextarea: true },
]

const NUMBER_FIELDS = [
  { name: "area", label: "المساحة (م²)", type: "number", placeholder: "150", required: true, min: 0 },
  { name: "rooms", label: "عدد الغرف", type: "number", placeholder: "3", min: 0 },
  { name: "bathrooms", label: "عدد الحمامات", type: "number", placeholder: "2", min: 0 },
]

const ADDRESS_FIELDS = [
  { name: "address", label: "العنوان التفصيلي", placeholder: "الحي، الشارع..." },
  { name: "addressEn", label: "Address (EN)", placeholder: "District, Street...", dir: "ltr" as const },
]

const AddProperty = () => {
  const navigate = useNavigate()
  const { cities, citiesEn, categories, categoriesEn } = usePropertyOptions()

  const SELECT_FIELDS = useMemo(() => [
    { name: "category", label: "الفئة", required: true, placeholder: "اختر الفئة", options: categories.map(c => ({ value: c, label: c })) },
    { name: "categoryEn", label: "Category (EN)", required: true, placeholder: "Select Category", dir: "ltr" as const, options: categoriesEn.map(c => ({ value: c, label: c })) },
    { name: "type", label: "النوع", required: true, placeholder: "اختر النوع", options: PROPERTY_TYPES },
    { name: "city", label: "المدينة", required: true, placeholder: "اختر المدينة", options: cities.map(c => ({ value: c, label: c })) },
    { name: "cityEn", label: "City (EN)", required: true, placeholder: "Select City", dir: "ltr" as const, options: citiesEn.map(c => ({ value: c, label: c })) },
    { name: "status", label: "الحالة", options: PROPERTY_STATUS },
    { name: "isFeatured", label: "عقار مميز؟", options: FEATURED_OPTIONS },
  ], [cities, citiesEn, categories, categoriesEn])

  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [features, setFeatures] = useState<string[]>([])
  const [featuresEn, setFeaturesEn] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState("")
  const [featureInputEn, setFeatureInputEn] = useState("")
  const formRef = useRef<HTMLFormElement>(null)

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    setFiles(selected)
    setPreviews(selected.map(f => URL.createObjectURL(f)))
  }

  const removeImage = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const addFeature = () => {
    const val = featureInput.trim()
    if (val && !features.includes(val)) { setFeatures(prev => [...prev, val]); setFeatureInput("") }
  }

  const addFeatureEn = () => {
    const val = featureInputEn.trim()
    if (val && !featuresEn.includes(val)) { setFeaturesEn(prev => [...prev, val]); setFeatureInputEn("") }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const formData = buildPropertyFormData({ formEl: e.currentTarget, features, featuresEn })
      files.forEach(file => formData.append('images', file))

      const res = await fetch(`${BASE_URL}/api/properties`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setShowSuccess(true)
    } catch (err: any) {
      console.error("فشل:", err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowSuccess(false)
    setPreviews([])
    setFiles([])
    setFeatures([])
    setFeaturesEn([])
    formRef.current?.reset()
  }

  return (
    <div className="p-6 bg-[#f8faff] min-h-screen" dir="rtl">
      <Header title="إضافة عقار جديد" description="أدخل بيانات العقار بالعربي والإنجليزي" />

      <form ref={formRef} onSubmit={handleSubmit}
        className="mt-8 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {TEXT_FIELDS.map(f => <FormInput key={f.name} {...f} />)}
          {SELECT_FIELDS.map(f => <FormSelect key={f.name} {...f} />)}

          <FormInput
            name="price" label="السعر (ل.س)" placeholder="1,000,000 (اختياري)" inputMode="numeric"
            onChange={e => { (e.target as HTMLInputElement).value = e.target.value.replace(/[^0-9]/g, '') }}
          />

          {NUMBER_FIELDS.map(f => <FormInput key={f.name} {...f} />)}
          {ADDRESS_FIELDS.map(f => <FormInput key={f.name} {...f} />)}

          <FormInput name="videoUrl" label="رابط فيديو يوتيوب (اختياري)" type="url" placeholder="https://youtu.be/xxxxxxx" dir="ltr" />

          <FeatureInput
            label="المميزات (عربي)" placeholder="مسبح، حديقة... ثم Enter"
            features={features} input={featureInput} tagColor="blue"
            onInputChange={setFeatureInput} onAdd={addFeature}
            onRemove={i => setFeatures(prev => prev.filter((_, j) => j !== i))}
          />

          <FeatureInput
            label="Features (EN)" placeholder="Pool, Garden... then Enter"
            features={featuresEn} input={featureInputEn} tagColor="green" dir="ltr"
            onInputChange={setFeatureInputEn} onAdd={addFeatureEn}
            onRemove={i => setFeaturesEn(prev => prev.filter((_, j) => j !== i))}
          />

          {/* الصور */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">الصور *</label>
            <div className="relative group">
              <input type="file" multiple accept="image/*" onChange={handleImages}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-2 transition-all
                  ${files.length > 0 ? "border-blue-400 bg-blue-50" : "border-gray-200 group-hover:border-blue-400"}`}>
                <MdCloudUpload size={36} className={files.length > 0 ? "text-blue-500" : "text-gray-300"} />
                <span className="text-sm font-bold text-gray-400">
                  {files.length > 0 ? `${files.length} صور مختارة` : "اسحب الصور هنا أو اضغط للاختيار"}
                </span>
              </div>
            </div>
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group/img">
                    <img src={src} className="w-full h-20 object-cover rounded-2xl border border-gray-100" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition">
                      <MdClose size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="flex gap-4 mt-10">
          <button type="submit" disabled={loading}
            className="flex-1 py-5 bg-[#0f2d4a] text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-900 shadow-xl transition-all disabled:opacity-50">
            <MdSave size={22} />
            {loading ? "جاري الإضافة..." : "إضافة العقار"}
          </button>
          <button type="button" onClick={() => navigate('/dashboard/properties')}
            className="px-8 py-5 bg-gray-100 text-gray-600 rounded-[1.5rem] font-black hover:bg-gray-200 transition-all">
            إلغاء
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccess} title="تمت الإضافة!" message="تم إضافة العقار بنجاح إلى قاعدة البيانات"
        primaryBtn={{ label: "عرض العقارات", onClick: () => navigate('/dashboard/properties') }}
        secondaryBtn={{ label: "إضافة عقار آخر", onClick: resetForm }}
      />
    </div>
  )
}

export default AddProperty