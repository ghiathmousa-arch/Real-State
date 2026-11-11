// مسؤول عن بناء الـ FormData اللي بتروح للسيرفر. مشترك بين الإضافة والتعديل — الإضافة بتبعتله formEl، والتعديل بتبعتله
// price مش هون — بيتعامل معه لحالو تحت
// cityEn و categoryEn مش هون — السيرفر بيحسبهن من المدينة والفئة بالعربي
const FORM_FIELDS = [
  'title', 'titleEn', 'description', 'descriptionEn',
  'category', 'type', 'city',
  'area', 'rooms', 'bathrooms', 'address', 'addressEn',
  'status', 'isFeatured', 'videoUrl'
]

interface BuildOptions {
  formEl?: HTMLFormElement
  formData?: Record<string, any>
  features: string[]
  featuresEn: string[]
  // التعديل بس: روابط الصور القديمة اللي لازم تضل — الباقي بينحذف من العقار ومن Cloudinary
  keepImages?: string[]
  // الصور الجديدة المرفوعة (إضافة أو تعديل)
  newImages?: File[]
}

export const buildPropertyFormData = ({
  formEl,
  formData,
  features,
  featuresEn,
  keepImages,
  newImages,
}: BuildOptions): FormData => {
  const data = new FormData()

  // باقي الحقول
  FORM_FIELDS.forEach(f => {
    if (formEl) {
      const el = formEl.elements.namedItem(f) as HTMLInputElement | HTMLSelectElement
      if (el) data.append(f, el.value)
    } else if (formData) {
      if (formData[f] !== undefined && formData[f] !== null)
        data.append(f, String(formData[f]))
    }
  })

  // السعر — مرة وحدة بس، دايماً يتبعت حتى لو فارغ
  if (formEl) {
    const el = formEl.elements.namedItem('price') as HTMLInputElement
    data.append('price', el && el.value ? el.value : '')
  } else if (formData) {
    // ✅ التأكد من تمرير القيمة الفارغة بشكل صحيح وعدم تحويل null لـ "null"
    const priceValue = (formData.price !== undefined && formData.price !== null) ? String(formData.price) : '';
    data.append('price', priceValue);

    // isFeatured بيحتاج معالجة خاصة بالـ Edit
    data.set('isFeatured', String(formData.isFeatured === true || formData.isFeatured === "true"))
  }
  data.append('features', features.join(','))
  data.append('featuresEn', featuresEn.join(','))

  // الصور: keepImages بينبعت JSON array (حتى لو فاضي = احذف كل القديمة)
  if (keepImages) data.append('keepImages', JSON.stringify(keepImages))
  newImages?.forEach(file => data.append('images', file))

  return data
}