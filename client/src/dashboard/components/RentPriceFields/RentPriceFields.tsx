// خانات أسعار الإيجار الأربعة (يومي، أسبوعي، شهري، سنوي) بفورم الإضافة والتعديل.
// بتطلع بس لما النوع "إيجار" بدل خانة السعر الوحدة. كلها اختيارية — اللي بيتعبّى بس بيظهر بالموقع.
// متل FormInput: بدون values = uncontrolled (الإضافة)، مع values = controlled (التعديل).

import FormInput from '../../../components/FormInput/FormInput'

export type RentPeriod = "daily" | "weekly" | "monthly" | "yearly"
export type RentInputs = Record<RentPeriod, string>

// اسم الحقل بالـ FormData (مسطّح) لكل مدة — نفس أسماء السيرفر
export const RENT_FIELDS: { period: RentPeriod; name: string; label: string; placeholder: string }[] = [
  { period: "daily", name: "rentDaily", label: "السعر اليومي $", placeholder: "مثال: 40" },
  { period: "weekly", name: "rentWeekly", label: "السعر الأسبوعي $", placeholder: "مثال: 250" },
  { period: "monthly", name: "rentMonthly", label: "السعر الشهري $", placeholder: "مثال: 900" },
  { period: "yearly", name: "rentYearly", label: "السعر السنوي $", placeholder: "مثال: 9000" },
]

export const EMPTY_RENT_INPUTS: RentInputs = { daily: "", weekly: "", monthly: "", yearly: "" }

// من rentPrices العقار (أرقام أو null) لقيم الخانات (نصوص)
export const rentInputsFrom = (rentPrices: any): RentInputs => ({
  daily: rentPrices?.daily != null ? String(rentPrices.daily) : "",
  weekly: rentPrices?.weekly != null ? String(rentPrices.weekly) : "",
  monthly: rentPrices?.monthly != null ? String(rentPrices.monthly) : "",
  yearly: rentPrices?.yearly != null ? String(rentPrices.yearly) : "",
})

interface Props {
  values?: RentInputs
  // قيم أولية بالوضع uncontrolled (الإضافة من "طلب عرض")
  defaults?: Partial<RentInputs>
  onChange?: (period: RentPeriod, value: string) => void
}

const RentPriceFields = ({ values, defaults, onChange }: Props) => (
  <div className="md:col-span-2 sm:col-span-2 rounded-[1.5rem] border-2 border-blue-100 bg-blue-50/40 p-4 sm:p-5 flex flex-col gap-4">
    <div>
      <p className="text-base font-black text-[#0f2d4a]">أسعار الإيجار (بالدولار $)</p>
      <p className="text-sm font-bold text-gray-500 mt-1">
        عبّي بس المدد المتاحة — إذا تركتها كلها فاضية بيظهر "السعر عند الطلب"
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {RENT_FIELDS.map(f => (
        <FormInput
          key={f.name} name={f.name} label={f.label} placeholder={f.placeholder}
          numeric="int"
          {...(values ? {
            value: values[f.period],
            // FormInput (numeric) بيحوّل الأرقام العربية وبيفلتر قبل ما توصل هون
            onChange: e => onChange?.(f.period, e.target.value),
          } : { defaultValue: defaults?.[f.period] })}
        />
      ))}
    </div>
  </div>
)

export default RentPriceFields
