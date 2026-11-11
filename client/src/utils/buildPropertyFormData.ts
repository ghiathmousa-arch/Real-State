// مسؤول عن بناء الـ FormData اللي بتروح للسيرفر. مشترك بين الإضافة والتعديل — الإضافة بتبعتله formEl، والتعديل بتبعتله
// price مش هون — بيتعامل معه لحالو تحت
// cityEn و categoryEn مش هون — السيرفر بيحسبهن من المدينة والفئة بالعربي
const FORM_FIELDS = [
  'title', 'titleEn', 'description', 'descriptionEn',
  'category', 'type', 'city',
  'area', 'rooms', 'bathrooms', 'address', 'addressEn',
  'status', 'isFeatured', 'videoUrl', 'furnished'
]

// أسعار الإيجار — مسطّحة بالـ FormData (نفس أسماء السيرفر)
const RENT_FIELDS = ['rentDaily', 'rentWeekly', 'rentMonthly', 'rentYearly']

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

  // قيمة حقل من الفورم أو من الـ state — الفاضي/null بيصير "" (مش "null")
  const read = (f: string): string => {
    if (formEl) {
      const el = formEl.elements.namedItem(f) as HTMLInputElement | null
      return el?.value ?? ''
    }
    const v = formData?.[f]
    return v !== undefined && v !== null ? String(v) : ''
  }

  // السعر: البيع بيبعت price بس، والإيجار بيبعت الأسعار الأربعة بس (حتى الفاضية = امسحها).
  // هيك أي قيمة قديمة بالخانات المخفية ما بتنبعت
  if (read('type') === 'rent') {
    RENT_FIELDS.forEach(f => data.append(f, read(f)))
  } else {
    data.append('price', read('price'))
  }

  // isFeatured بيحتاج معالجة خاصة بالـ Edit
  if (!formEl && formData)
    data.set('isFeatured', String(formData.isFeatured === true || formData.isFeatured === "true"))
  data.append('features', features.join(','))
  data.append('featuresEn', featuresEn.join(','))

  // الصور: keepImages بينبعت JSON array (حتى لو فاضي = احذف كل القديمة)
  if (keepImages) data.append('keepImages', JSON.stringify(keepImages))
  newImages?.forEach(file => data.append('images', file))

  return data
}