import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdCloudUpload, MdClose, MdSave } from 'react-icons/md'
import Header from '../Header/Header'
import SuccessModal from '../SuccessModal/SuccessModal'

const API_URL = import.meta.env.VITE_API_URL;
const BASE_URL = API_URL?.replace("/api", "");

const CITIES = [
  "دمشق", "ريف دمشق", "حلب", "ريف حلب", "حمص",
  "حماة", "اللاذقية", "طرطوس", "إدلب", "درعا",
  "السويداء", "القنيطرة", "دير الزور", "الحسكة", "الرقة"
];

const CITIES_EN = [
  "Damascus", "Rif Dimashq", "Aleppo", "Rif Aleppo", "Homs",
  "Hama", "Latakia", "Tartus", "Idlib", "Daraa",
  "Suwayda", "Quneitra", "Deir ez-Zor", "Al-Hasakah", "Raqqa"
];

const CATEGORIES = ["شقة", "منزل", "أرض", "مزرعة"]
const CATEGORIES_EN = ["Apartment", "House", "Land", "Farm"]

const AddProperty = () => {
  const navigate = useNavigate()
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const formEl = e.currentTarget
      const formData = new FormData()

      // ✅ تمت إضافة videoUrl لقائمة الحقول النصية يلي عم نجمعها من الفورم
      const fields = [
        'title', 'titleEn',
        'description', 'descriptionEn',
        'category', 'categoryEn',
        'type', 'price', 'city', 'cityEn',
        'area', 'rooms', 'bathrooms',
        'address', 'addressEn',
        'status', 'isFeatured', 'videoUrl'
      ]
      fields.forEach(f => {
        const el = formEl.elements.namedItem(f) as HTMLInputElement | HTMLSelectElement
        if (el) formData.append(f, el.value)
      })

      formData.append('features', features.join(','))
      formData.append('featuresEn', featuresEn.join(','))
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

      <form ref={formRef} onSubmit={handleSubmit} className="mt-8 bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* العنوان */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">عنوان العقار *</label>
            <input name="title" required placeholder="شقة فاخرة في المزة"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">Property Title (EN)</label>
            <input name="titleEn" placeholder="Luxury Apartment in Mezza"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]" dir="ltr" />
          </div>

          {/* الوصف */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">الوصف</label>
            <textarea name="description" rows={3} placeholder="وصف تفصيلي للعقار..."
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a] resize-none" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">Description (EN)</label>
            <textarea name="descriptionEn" rows={3} placeholder="Detailed description..."
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a] resize-none" dir="ltr" />
          </div>

          {/* الفئة */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">الفئة *</label>
            <select name="category" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]">
              <option value="">اختر الفئة</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">Category (EN) *</label>
            <select name="categoryEn" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]" dir="ltr">
              <option value="">Select Category</option>
              {CATEGORIES_EN.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* النوع */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">النوع *</label>
            <select name="type" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]">
              <option value="">اختر النوع</option>
              <option value="buy">بيع</option>
              <option value="rent">إيجار</option>
            </select>
          </div>

          {/* السعر - ✅ صار اختياري (تم حذف required و علامة *) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">السعر (ل.س)</label>
            <input
              name="price"
              type="text" // غيرناه لنص عشان يختفوا الأسهم
              inputMode="numeric" // بيفتح كيبورد الأرقام عالموبايل
              placeholder="1,000,000 (اختياري)"
              onChange={(e) => {
                // كود صغير ليمنع كتابة أي شي غير الأرقام
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
              }}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-blue-600"
            />
          </div>
          {/* المساحة */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">المساحة (م²) *</label>
            <input name="area" type="number" required min={0} placeholder="150"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]" />
          </div>

          {/* المدينة */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">المدينة *</label>
            <select name="city" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]">
              <option value="">اختر المدينة</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">City (EN) *</label>
            <select name="cityEn" required className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]" dir="ltr">
              <option value="">Select City</option>
              {CITIES_EN.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* العنوان التفصيلي */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">العنوان التفصيلي</label>
            <input name="address" placeholder="الحي، الشارع..."
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">Address (EN)</label>
            <input name="addressEn" placeholder="District, Street..."
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]" dir="ltr" />
          </div>

          {/* الغرف والحمامات */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">عدد الغرف</label>
            <input name="rooms" type="number" min={0} placeholder="3"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">عدد الحمامات</label>
            <input name="bathrooms" type="number" min={0} placeholder="2"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]" />
          </div>

          {/* ✅ رابط فيديو يوتيوب - حقل جديد */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">رابط فيديو يوتيوب (اختياري)</label>
            <input name="videoUrl" type="url" placeholder="https://youtu.be/xxxxxxx"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]" dir="ltr" />
          </div>

          {/* الحالة والمميز */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">الحالة</label>
            <select name="status" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]">
              <option value="active">نشط</option>
              <option value="pending">معلق</option>
              <option value="sold">مباع</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">عقار مميز؟</label>
            <select name="isFeatured" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-[#0f2d4a]">
              <option value="false">لا</option>
              <option value="true">نعم</option>
            </select>
          </div>

          {/* المميزات عربي */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">المميزات (عربي)</label>
            <div className="flex gap-2">
              <input value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                placeholder="مسبح، حديقة... ثم Enter"
                className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a]" />
              <button type="button" onClick={addFeature} className="px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition">+</button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">Features (EN)</label>
            <div className="flex gap-2">
              <input value={featureInputEn} onChange={e => setFeatureInputEn(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeatureEn())}
                placeholder="Pool, Garden... then Enter"
                className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-500 text-sm text-[#0f2d4a]" dir="ltr" />
              <button type="button" onClick={addFeatureEn} className="px-5 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition">+</button>
            </div>
            {featuresEn.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
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
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-black text-gray-400">الصور *</label>
            <div className="relative group">
              <input type="file" multiple accept="image/*" onChange={handleImages}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className={`p-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center gap-2 transition-all ${files.length > 0 ? "border-blue-400 bg-blue-50" : "border-gray-200 group-hover:border-blue-400"}`}>
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
        isOpen={showSuccess}
        title="تمت الإضافة!"
        message="تم إضافة العقار بنجاح إلى قاعدة البيانات"
        primaryBtn={{ label: "عرض العقارات", onClick: () => navigate('/dashboard/properties') }}
        secondaryBtn={{ label: "إضافة عقار آخر", onClick: resetForm }}
      />
    </div>
  )
}

export default AddProperty