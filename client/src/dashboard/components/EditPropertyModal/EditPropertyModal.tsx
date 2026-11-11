import { useState, useEffect, useRef, useMemo } from 'react'
import { MdClose, MdSave, MdCloudUpload } from "react-icons/md"
import SuccessModal from '../SuccessModal/SuccessModal'
import FormInput from '../../../components/FormInput/FormInput'
import FormSelect from "../../../components/FormSelect/FormSelect"
import FeatureInput from '../FeatureInput/FeatureInput'
import { buildPropertyFormData } from '../../../utils/buildPropertyFormData'
import { cdn } from '../../../utils/format'
import { api, API_BASE, getApiError } from '../../../utils/api'
import {
  usePropertyOptions,
  PROPERTY_TYPES, PROPERTY_STATUS, FEATURED_OPTIONS
} from '../../../constants/property'

const MAX_IMAGES = 12
const MAX_IMAGE_MB = 7

interface Props {
  isOpen: boolean
  onClose: () => void
  property: any
  onSuccess: () => void
}

const TEXT_FIELDS = [
  { name: "title", label: "عنوان العقار", placeholder: "شقة فاخرة في المزة" },
  { name: "titleEn", label: "Property Title (EN)", placeholder: "Luxury Apartment in Mezza", dir: "ltr" as const },
  { name: "description", label: "الوصف", placeholder: "وصف تفصيلي...", isTextarea: true },
  { name: "descriptionEn", label: "Description (EN)", placeholder: "Detailed description...", dir: "ltr" as const, isTextarea: true },
]

const NUMBER_FIELDS = [
  { name: "area", label: "المساحة (م²)", type: "number", min: 0 },
  { name: "rooms", label: "عدد الغرف", type: "number", min: 0 },
  { name: "bathrooms", label: "عدد الحمامات", type: "number", min: 0 },
]

const ADDRESS_FIELDS = [
  { name: "address", label: "العنوان التفصيلي", placeholder: "الحي، الشارع..." },
  { name: "addressEn", label: "Address (EN)", placeholder: "District, Street...", dir: "ltr" as const },
]

const EditPropertyModal = ({ isOpen, onClose, property, onSuccess }: Props) => {
  const { cities, categories } = usePropertyOptions()
  const [formData, setFormData] = useState<any>({})
  const [priceInput, setPriceInput] = useState("")
  // الصور: القديمة اللي لسا محفوظة (روابط) + الجديدة المختارة (ملفات ومعاينات)
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [features, setFeatures] = useState<string[]>([])
  const [featuresEn, setFeaturesEn] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState("")
  const [featureInputEn, setFeatureInputEn] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const lastIdRef = useRef<string | null>(null)

  useEffect(() => {
    // لما المودال يتسكّر منصفّر الـ ID — عشان أي فتح جاي يبلّش من بيانات العقار الحقيقية
    // (مثلاً صور انشالت بدون حفظ ما لازم تضل مخفية وتنحذف بالحفظ الجاي)
    if (!isOpen) {
      lastIdRef.current = null
      return
    }
    // يشتغل بس لما يتغير الـ ID — مش كل re-render
    if (property && property._id !== lastIdRef.current) {
      lastIdRef.current = property._id
      setFormData({ ...property })
      setPriceInput(property.price != null ? String(property.price) : "")
      setFeatures(property.features || [])
      setFeaturesEn(property.featuresEn || [])
      setExistingImages((property.images || []).filter((img: string) => img && !img.includes('undefined')))
      setNewFiles([])
      setNewPreviews([])
      setImageError("")
      setSubmitError("")
    }
  }, [property, isOpen])

  // cityEn و categoryEn ما عاد ينبعتوا — السيرفر بيحسبهن من القيمة العربية
  const SELECT_FIELDS = useMemo(() => [
    { name: "category", label: "الفئة", placeholder: "اختر الفئة", options: categories.map(c => ({ value: c, label: c })) },
    { name: "type", label: "النوع", options: PROPERTY_TYPES },
    { name: "city", label: "المدينة", placeholder: "اختر المدينة", options: cities.map(c => ({ value: c, label: c })) },
    { name: "status", label: "الحالة", options: PROPERTY_STATUS },
    { name: "isFeatured", label: "مميز؟", options: FEATURED_OPTIONS },
  ], [cities, categories])

  if (!isOpen) return null

  const handleChange = (field: string, value: string) =>
    setFormData((prev: any) => ({ ...prev, [field]: value }))

  const addFeature = () => {
    const val = featureInput.trim()
    if (val && !features.includes(val)) { setFeatures(prev => [...prev, val]); setFeatureInput("") }
  }

  const addFeatureEn = () => {
    const val = featureInputEn.trim()
    if (val && !featuresEn.includes(val)) { setFeaturesEn(prev => [...prev, val]); setFeatureInputEn("") }
  }

  const totalImages = existingImages.length + newFiles.length

  // الصور الجديدة بتنضاف فوق الموجودة (مش بدالها) — والمجموع ما بيتجاوز MAX_IMAGES
  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    e.target.value = "" // عشان نقدر نختار نفس الملف مرة تانية بعد حذفه

    if (totalImages + selected.length > MAX_IMAGES) {
      setImageError(`الحد الأقصى ${MAX_IMAGES} صورة — عندك ${totalImages} واخترت ${selected.length}`)
      return
    }

    const tooBig = selected.find(f => f.size > MAX_IMAGE_MB * 1024 * 1024)
    if (tooBig) {
      setImageError(`"${tooBig.name}" أكبر من ${MAX_IMAGE_MB} ميجابايت`)
      return
    }

    setImageError("")
    setNewFiles(prev => [...prev, ...selected])
    setNewPreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))])
  }

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url))
    setImageError("")
  }

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newPreviews[index])
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
    setImageError("")
  }

  const toImgSrc = (img: string) =>
    cdn(img.startsWith('http') ? img : `${API_BASE}/${img.replace(/^\//, '')}`)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError("")
    try {
      const data = buildPropertyFormData({
        formData: { ...formData, price: priceInput },
        features,
        featuresEn,
        keepImages: existingImages,
        newImages: newFiles,
      })

      await api.put(`/properties/${property._id}`, data)
      setShowSuccess(true)
    } catch (error) {
      setSubmitError(getApiError(error, "تعذّر حفظ التعديلات، حاول مرة تانية"))
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
          dir="rtl">

          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0f2d4a]">تعديل بيانات العقار</h2>
              <p className="text-xs text-gray-400 font-bold mt-1">تحديث المعلومات بالعربي والإنجليزي</p>
            </div>
            <button type="button" onClick={onClose}
              className="p-2 sm:p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
              <MdClose size={22} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {TEXT_FIELDS.map(f => (
              <FormInput key={f.name} {...f}
                value={formData[f.name] ?? ''}
                onChange={e => handleChange(f.name, e.target.value)} />
            ))}

            {SELECT_FIELDS.map(f => (
              <FormSelect key={f.name} {...f}
                value={f.name === 'isFeatured' ? (formData.isFeatured ? "true" : "false") : (formData[f.name] ?? '')}
                onChange={e => handleChange(f.name, e.target.value)} />
            ))}

            {/* السعر — state منفصل عشان ما يتأثر بالـ useEffect */}
            <FormInput
              name="price" label="السعر (بالدولار $)" inputMode="numeric" dir="ltr"
              placeholder="مثال: 85000 (اختياري)"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value.replace(/[^0-9]/g, ''))} />

            {NUMBER_FIELDS.map(f => (
              <FormInput key={f.name} {...f}
                value={String(formData[f.name] ?? '')}
                onChange={e => handleChange(f.name, e.target.value)} />
            ))}

            {ADDRESS_FIELDS.map(f => (
              <FormInput key={f.name} {...f}
                value={formData[f.name] ?? ''}
                onChange={e => handleChange(f.name, e.target.value)} />
            ))}

            <FormInput
              name="videoUrl" label="رابط فيديو يوتيوب (اختياري)" type="url" dir="ltr"
              placeholder="https://youtu.be/xxxxxxx"
              value={formData.videoUrl ?? ''}
              onChange={e => handleChange('videoUrl', e.target.value)} />

            <FeatureInput
              label="المميزات (عربي)" placeholder="مسبح، حديقة..."
              features={features} input={featureInput} tagColor="blue"
              onInputChange={setFeatureInput} onAdd={addFeature}
              onRemove={i => setFeatures(prev => prev.filter((_, j) => j !== i))} />

            <FeatureInput
              label="Features (EN)" placeholder="Pool, Garden..." dir="ltr"
              features={featuresEn} input={featureInputEn} tagColor="green"
              onInputChange={setFeatureInputEn} onAdd={addFeatureEn}
              onRemove={i => setFeaturesEn(prev => prev.filter((_, j) => j !== i))} />

            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-black text-gray-400">
                الصور — {totalImages} من {MAX_IMAGES}
              </label>

              {/* الصور الحالية + الجديدة — كل وحدة إلها زر حذف */}
              {totalImages > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                  {existingImages.map(img => (
                    <div key={img} className="relative">
                      <img src={toImgSrc(img)} className="w-full h-20 object-cover rounded-2xl border border-gray-100" alt="" />
                      <button type="button" onClick={() => removeExistingImage(img)} title="حذف الصورة"
                        className="absolute top-1 left-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow">
                        <MdClose size={14} />
                      </button>
                    </div>
                  ))}
                  {newPreviews.map((src, i) => (
                    <div key={src} className="relative">
                      <img src={src} className="w-full h-20 object-cover rounded-2xl border-2 border-blue-400" alt="" />
                      <span className="absolute bottom-1 right-1 text-[9px] font-black bg-blue-500 text-white px-1.5 rounded-md">جديدة</span>
                      <button type="button" onClick={() => removeNewImage(i)} title="إزالة الصورة"
                        className="absolute top-1 left-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow">
                        <MdClose size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {totalImages < MAX_IMAGES && (
                <div className="relative group">
                  <input type="file" multiple accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleImages} />
                  <div className={`p-5 sm:p-6 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-2 transition-all
                    ${newFiles.length > 0 ? "border-blue-400 bg-blue-50" : "border-gray-200 group-hover:border-blue-400"}`}>
                    <MdCloudUpload size={30} className={newFiles.length > 0 ? "text-blue-500" : "text-gray-300 group-hover:text-blue-500"} />
                    <span className="text-xs font-bold text-gray-400 text-center">
                      {newFiles.length > 0
                        ? `${newFiles.length} صور جديدة — بتنضاف للموجودة. اضغط لإضافة المزيد`
                        : "أضف صور جديدة — اسحبها هنا أو اضغط للاختيار"}
                    </span>
                  </div>
                </div>
              )}
              {imageError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {imageError}
                </p>
              )}
            </div>

          </div>

          {submitError && (
            <p className="mt-6 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              {submitError}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full mt-6 sm:mt-8 py-4 sm:py-5 bg-[#0f2d4a] text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-900 shadow-xl transition-all disabled:opacity-50">
            <MdSave size={22} />
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccess} title="تم التعديل!" message="تم تحديث بيانات العقار بنجاح"
        primaryBtn={{
          label: "حسناً", onClick: () => {
            lastIdRef.current = null
            setShowSuccess(false)
            onSuccess()
            onClose()
          }
        }} />
    </>
  )
}

export default EditPropertyModal