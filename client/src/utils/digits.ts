// تحويل الأرقام العربية لأرقام لاتينية — كتير من اللي بيضيفوا كيبوردهم عربي وبيكتبوا "٠٩٩١٢٣٤٥٦٧" أو "٤٠".
// لازم تنطبق **قبل** أي فلترة بـ [^0-9]، وإلا الأرقام العربية بتنمسح بصمت والخانة بتضل فاضية.
//   ٠-٩ (U+0660–0669 عربية) · ۰-۹ (U+06F0–06F9 فارسية/أوردو) · ٫ (الفاصلة العشرية العربية) → .

export const toLatinDigits = (v: string): string =>
  String(v ?? "")
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, ".")

// أرقام بس (سعر، غرف...) — بعد تحويل العربية
export const digitsOnly = (v: string): string => toLatinDigits(v).replace(/[^0-9]/g, "")

// رقم عشري (مساحة): أرقام ونقطة وحدة
export const decimalOnly = (v: string): string => {
  const cleaned = toLatinDigits(v).replace(/[^0-9.]/g, "")
  const [int, ...rest] = cleaned.split(".")
  return rest.length ? `${int}.${rest.join("")}` : int
}
