// تصغير الصور بالمتصفح قبل الرفع — صورة الموبايل (3–7MB) بتصير ~200–500KB.
// الرفع أسرع بكتير على داتا الموبايل، والسيرفر ما بيتعب (كان يفشل بـ "فشلت عملية معالجة الصور"
// لما تنبعت 10+ صور كبيرة سوا). createImageBitmap بيطبّق اتجاه الصورة (EXIF) فما بتطلع مقلوبة.
// إذا أي شي فشل (مثلاً صيغة ما بيفهمها المتصفح) منرجّع الملف الأصلي — والسيرفر بيتعامل معه.

const MAX_DIM = 1600
const QUALITY = 0.85

export const shrinkImage = async (file: File): Promise<File> => {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
    // صورة صغيرة أصلاً — ما في داعي نعيد ضغطها
    if (scale === 1 && file.size < 1_000_000) {
      bitmap.close()
      return file
    }
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) { bitmap.close(); return file }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/jpeg", QUALITY))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" })
  } catch {
    return file
  }
}

// صورة ورا صورة (مش كلهن سوا) — عشان ذاكرة الموبايل
export const shrinkImages = async (files: File[]): Promise<File[]> => {
  const out: File[] = []
  for (const f of files) out.push(await shrinkImage(f))
  return out
}
