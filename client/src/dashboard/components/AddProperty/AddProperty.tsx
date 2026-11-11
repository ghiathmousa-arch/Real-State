import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdCloudUpload, MdClose, MdSave } from 'react-icons/md'
import Header from '../Header/Header'
import SuccessModal from '../SuccessModal/SuccessModal'
import FormInput from '../../../components/FormInput/FormInput'
import FormSelect from '../../../components/FormSelect/FormSelect'
import FeatureInput from '../FeatureInput/FeatureInput'
import EnglishSection from '../EnglishSection/EnglishSection'
import RentPriceFields from '../RentPriceFields/RentPriceFields'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { buildPropertyFormData } from '../../../utils/buildPropertyFormData'
import { getImgSrc } from '../../../utils/format'
import { api, getApiError } from '../../../utils/api'
import {
  usePropertyOptions,
  PROPERTY_TYPES, PROPERTY_STATUS, FEATURED_OPTIONS, FURNISHED_OPTIONS
} from '../../../constants/property'

const MAX_IMAGES = 12
const MAX_IMAGE_MB = 7

const TEXT_FIELDS = [
  { name: "title", label: "عنوان العقار", placeholder: "شقة فاخرة في المزة", required: true },
  { name: "description", label: "الوصف", placeholder: "وصف تفصيلي للعقار...", isTextarea: true },
]

// الحقول الإنجليزية كلها اختيارية ومحطوطة بقسم مطوي — إذا فاضية الموقع بيعرض العربي
const EN_FIELDS = [
  { name: "titleEn", label: "Property Title (EN)", placeholder: "Luxury Apartment in Mezza", dir: "ltr" as const },
  { name: "addressEn", label: "Address (EN)", placeholder: "District, Street...", dir: "ltr" as const },
  { name: "descriptionEn", label: "Description (EN)", placeholder: "Detailed description...", dir: "ltr" as const, isTextarea: true },
]

const NUMBER_FIELDS = [
  // numeric بدل type="number" — عشان الأرقام العربية (٠-٩) تنقبل وتتحوّل
  { name: "area", label: "المساحة (م²)", numeric: "decimal" as const, placeholder: "150", required: true },
  { name: "rooms", label: "عدد الغرف", numeric: "int" as const, placeholder: "3" },
  { name: "bathrooms", label: "عدد الحمامات", numeric: "int" as const, placeholder: "2" },
]

const ADDRESS_FIELDS = [
  { name: "address", label: "العنوان التفصيلي", placeholder: "الحي، الشارع..." },
]

// "طلب عرض" من فورم الموقع العام — بيفتح فورم الإضافة معبّى ببياناته وصوره (وضع "من طلب")
export interface ListingRequest {
  _id: string
  type: "buy" | "rent"
  category: string
  city: string
  area?: number | null
  rooms?: number | null
  bathrooms?: number | null
  address?: string
  description?: string
  price?: number | null
  rentPrices?: Partial<Record<"daily" | "weekly" | "monthly" | "yearly", number | null>>
  furnished?: string | null
  images?: string[]
}

const str = (v: unknown) => (v === null || v === undefined ? "" : String(v))

// fromRequest: إذا موجود، الحفظ بيروح لـ POST /property-requests/:id/convert بدل POST /properties
const AddProperty = ({ fromRequest }: { fromRequest?: ListingRequest } = {}) => {
  const navigate = useNavigate()
  const { cities, categories, loading: optionsLoading } = usePropertyOptions()

  // القيم الأولية من الطلب (عنوان مقترح: "شقة للإيجار في دمشق")
  const defaults = useMemo<Record<string, string>>(() => {
    if (!fromRequest) return {}
    const r = fromRequest
    return {
      title: `${r.category} ${r.type === "rent" ? "للإيجار" : "للبيع"} في ${r.city}`,
      description: str(r.description),
      category: r.category, type: r.type, city: r.city,
      furnished: str(r.furnished),
      price: str(r.price),
      area: str(r.area), rooms: str(r.rooms), bathrooms: str(r.bathrooms),
      address: str(r.address),
    }
  }, [fromRequest])
  const rentDefaults = useMemo(() => ({
    daily: str(fromRequest?.rentPrices?.daily), weekly: str(fromRequest?.rentPrices?.weekly),
    monthly: str(fromRequest?.rentPrices?.monthly), yearly: str(fromRequest?.rentPrices?.yearly),
  }), [fromRequest])

  // "عقار مميز؟" للأدمن بس — السب أدمن ما بيشوفه (والسيرفر بيخليه false)
  const { isAdmin } = useCurrentUser()

  // cityEn و categoryEn ما عاد ينبعتوا — السيرفر بيحسبهن من القيمة العربية
  const SELECT_FIELDS = useMemo(() => [
    { name: "category", label: "الفئة", required: true, placeholder: "اختر الفئة", options: categories.map(c => ({ value: c, label: c })) },
    { name: "type", label: "النوع", required: true, placeholder: "اختر النوع", options: PROPERTY_TYPES },
    { name: "city", label: "المدينة", required: true, placeholder: "اختر المدينة", options: cities.map(c => ({ value: c, label: c })) },
    { name: "status", label: "الحالة", options: PROPERTY_STATUS },
    ...(isAdmin ? [{ name: "isFeatured", label: "عقار مميز؟", options: FEATURED_OPTIONS }] : []),
    { name: "furnished", label: "مفروش؟", options: FURNISHED_OPTIONS },
  ], [cities, categories, isAdmin])

  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [imageError, setImageError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [previews, setPreviews] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [features, setFeatures] = useState<string[]>([])
  const [featuresEn, setFeaturesEn] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState("")
  const [featureInputEn, setFeatureInputEn] = useState("")
  // النوع المختار — بيحدد إذا منعرض خانة السعر (بيع) أو أسعار الإيجار الأربعة (إيجار)
  const [type, setType] = useState<string>(fromRequest?.type ?? "")
  // صور الطلب اللي رح تنتقل للعقار — الأدمن بيقدر يشيل منها
  const [requestImages, setRequestImages] = useState<string[]>(fromRequest?.images ?? [])
  const formRef = useRef<HTMLFormElement>(null)

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])

    // نوقف الاختيار هون بدل ما نخلي السيرفر يرفضه بعد رفع كامل — أسرع وأوضح للمستخدم
    if (selected.length + requestImages.length > MAX_IMAGES) {
      setImageError(`الحد الأقصى ${MAX_IMAGES} صورة — اخترت ${selected.length}${requestImages.length ? ` + ${requestImages.length} من الطلب` : ""}`)
      e.target.value = ""
      return
    }

    const tooBig = selected.find(f => f.size > MAX_IMAGE_MB * 1024 * 1024)
    if (tooBig) {
      setImageError(`"${tooBig.name}" أكبر من ${MAX_IMAGE_MB} ميجابايت`)
      e.target.value = ""
      return
    }

    setImageError("")
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
    setSubmitError("")
    try {
      const formData = buildPropertyFormData({ formEl: e.currentTarget, features, featuresEn, newImages: files })

      if (fromRequest) {
        formData.append('keepRequestImages', JSON.stringify(requestImages))
        await api.post(`/property-requests/${fromRequest._id}/convert`, formData)
      } else {
        await api.post('/properties', formData)
      }
      setShowSuccess(true)
    } catch (err) {
      setSubmitError(getApiError(err, "تعذّر إضافة العقار، تأكد من الاتصال وحاول مرة تانية"))
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowSuccess(false)
    setImageError("")
    setSubmitError("")
    setPreviews([])
    setFiles([])
    setFeatures([])
    setFeaturesEn([])
    setType("")
    formRef.current?.reset()
  }

  // من طلب: منستنى المدن والفئات قبل ما نرسم الفورم — وإلا القيم الأولية للقوائم ما بتنطبق
  if (fromRequest && optionsLoading)
    return <div className="p-10 text-center text-[#004e80] font-bold">جاري التحميل...</div>

  return (
    <div className="p-6 bg-[#f8faff] min-h-screen" dir="rtl">
      <Header
        title={fromRequest ? "تحويل طلب لعقار" : "إضافة عقار جديد"}
        description={fromRequest
          ? "راجع بيانات الطلب وعدّلها — رقم واسم المالك ما بينتقلوا للعقار"
          : "أدخل بيانات العقار بالعربي — الإنجليزي اختياري"} />

      <form ref={formRef} onSubmit={handleSubmit}
        onChange={e => {
          const el = e.target as HTMLSelectElement
          if (el.name === "type") setType(el.value)
        }}
        className="mt-8 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {TEXT_FIELDS.map(f => <FormInput key={f.name} {...f} defaultValue={defaults[f.name]} />)}
          {SELECT_FIELDS.map(f => <FormSelect key={f.name} {...f} defaultValue={defaults[f.name]} />)}

          {/* إيجار = 4 أسعار للمدد، بيع (أو ما انختار نوع) = سعر واحد */}
          {type === "rent" ? (
            <RentPriceFields defaults={rentDefaults} />
          ) : (
            <FormInput
              name="price" label="السعر (بالدولار $)" placeholder="مثال: 85000 (اختياري)" numeric="int"
              defaultValue={defaults.price}
            />
          )}

          {NUMBER_FIELDS.map(f => <FormInput key={f.name} {...f} defaultValue={defaults[f.name]} />)}
          {ADDRESS_FIELDS.map(f => <FormInput key={f.name} {...f} defaultValue={defaults[f.name]} />)}

          <FormInput name="videoUrl" label="رابط فيديو يوتيوب (اختياري)" type="url" placeholder="https://youtu.be/xxxxxxx" dir="ltr" />

          <FeatureInput
            label="المميزات (عربي)" placeholder="مسبح، حديقة... ثم Enter"
            features={features} input={featureInput} tagColor="blue"
            onInputChange={setFeatureInput} onAdd={addFeature}
            onRemove={i => setFeatures(prev => prev.filter((_, j) => j !== i))}
          />

          <EnglishSection>
            {EN_FIELDS.map(f => <FormInput key={f.name} {...f} />)}
            <FeatureInput
              label="Features (EN)" placeholder="Pool, Garden... then Enter"
              features={featuresEn} input={featureInputEn} tagColor="green" dir="ltr"
              onInputChange={setFeatureInputEn} onAdd={addFeatureEn}
              onRemove={i => setFeaturesEn(prev => prev.filter((_, j) => j !== i))}
            />
          </EnglishSection>

          {/* الصور */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-700">الصور *</label>
            {/* صور الطلب — بتنتقل للعقار إلا اللي بتشيلها (هي بتنحذف من Cloudinary) */}
            {requestImages.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-bold text-gray-400 mb-2">صور الطلب ({requestImages.length})</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {requestImages.map(url => (
                    <div key={url} className="relative">
                      <img src={getImgSrc([url]) ?? ""} className="w-full h-20 object-cover rounded-2xl border-2 border-amber-300" alt="" />
                      <button type="button" title="إزالة الصورة"
                        onClick={() => setRequestImages(prev => prev.filter(u => u !== url))}
                        className="absolute top-1 left-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow">
                        <MdClose size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="relative group">
              <input type="file" multiple accept="image/*" onChange={handleImages}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-2 transition-all
                  ${files.length > 0 ? "border-blue-400 bg-blue-50" : "border-gray-200 group-hover:border-blue-400"}`}>
                <MdCloudUpload size={36} className={files.length > 0 ? "text-blue-500" : "text-gray-300"} />
                <span className="text-sm font-bold text-gray-400">
                  {files.length > 0 ? `${files.length} صور مختارة` : `اسحب الصور هنا أو اضغط للاختيار (حتى ${MAX_IMAGES})`}
                </span>
              </div>
            </div>
            {imageError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-2">
                {imageError}
              </p>
            )}
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

        {submitError && (
          <p className="mt-8 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            {submitError}
          </p>
        )}

        <div className="flex gap-4 mt-10">
          <button type="submit" disabled={loading}
            className="flex-1 py-5 bg-[#0f2d4a] text-white rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-blue-900 shadow-xl transition-all disabled:opacity-50">
            <MdSave size={22} />
            {loading ? "جاري الإضافة..." : fromRequest ? "تحويل لعقار ونشره" : "إضافة العقار"}
          </button>
          <button type="button" onClick={() => navigate(fromRequest ? '/dashboard/requests' : '/dashboard/properties')}
            className="px-8 py-5 bg-gray-100 text-gray-600 rounded-[1.5rem] font-black hover:bg-gray-200 transition-all">
            إلغاء
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccess} title="تمت الإضافة!" message="تم إضافة العقار بنجاح إلى قاعدة البيانات"
        primaryBtn={{ label: "عرض العقارات", onClick: () => navigate('/dashboard/properties') }}
        secondaryBtn={fromRequest
          ? { label: "رجوع للطلبات", onClick: () => navigate('/dashboard/requests') }
          : { label: "إضافة عقار آخر", onClick: resetForm }}
      />
    </div>
  )
}

export default AddProperty