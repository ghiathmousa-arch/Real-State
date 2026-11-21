// صفحة "اعرض عقارك معنا" (/list-your-property) — فورم عام لمالك العقار.
// الطلب بيروح للداشبورد كـ "طلب عرض" وما بينزل عالموقع إلا بعد ما الفريق يحوّله لعقار.
// الزوار غالباً كبار بالعمر: 4 أقسام مرقّمة، خطوط وخانات كبيرة، وأقل عدد من الحقول الإجبارية
// (الاسم، الهاتف، النوع، الفئة، المدينة).

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdClose, MdCloudUpload, MdCheckCircle } from "react-icons/md";
import SEO from "../components/SEO/SEO";
import { usePropertyOptions } from "../../constants/property";
import { WHATSAPP_NUMBER } from "../../constants/contact";
import { RENT_PERIODS } from "../../utils/format";
import { api } from "../../utils/api";
import axios from "axios";
import { digitsOnly } from "../../utils/digits";
import { shrinkImages } from "../../utils/shrinkImage";

const MAX_IMAGES = 12; // نفس حد صور العقار
const MAX_IMAGE_MB = 7;
const RENT_FIELD = { daily: "rentDaily", weekly: "rentWeekly", monthly: "rentMonthly", yearly: "rentYearly" } as const;

type Errors = Partial<Record<string, string>>;

const EMPTY = {
  ownerName: "", ownerPhone: "", type: "" as "" | "buy" | "rent", category: "", city: "",
  area: "", rooms: "", bathrooms: "", address: "", description: "",
  price: "", rentDaily: "", rentWeekly: "", rentMonthly: "", rentYearly: "", furnished: "",
  // honeypot — مخفي عن البشر. اسمه مقصود ما بيشبه أي حقل معروف (website/email/url...)
  // لأن autofill تبع كروم كان يعبّي حقل "website" المخفي، فالطلب الحقيقي كان ينعامل كبوت وما ينحفظ
  hp_field: "",
};

const inputClass =
  "w-full px-4 py-3 text-base bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-2xl outline-none focus:border-sky-500 text-gray-800 dark:text-white";

// مكونات صغيرة على مستوى الموديول (مش جوّا الصفحة) — وإلا كل حرف بيعيد تركيب الخانات وبيضيع الـ focus
const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-sm font-bold text-red-600 mt-1.5">{msg}</p> : null;

const Label = ({ text, required }: { text: string; required?: boolean }) => (
  <label className="block text-base font-bold text-gray-700 dark:text-gray-200 mb-1.5">
    {text} {required && <span className="text-red-500">*</span>}
  </label>
);

const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section className="bg-white dark:bg-gray-800 rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
    <h2 className="flex items-center gap-3 text-lg sm:text-xl font-extrabold text-gray-800 dark:text-white mb-5">
      <span className="w-8 h-8 rounded-full bg-[#004E80] text-white flex items-center justify-center text-base shrink-0">{n}</span>
      {title}
    </h2>
    {/* min-w-0: الخانات ما بتكبر أعرض من عمودها (وإلا بتعمل scroll أفقي على الشاشات الصغيرة) */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&>*]:min-w-0">{children}</div>
  </section>
);

const ListYourPropertyPage = () => {
  const { t, i18n } = useTranslation();
  const ar = i18n.language === "ar";
  const { cities, citiesEn, categories, categoriesEn } = usePropertyOptions();

  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  // المميزات (مسبح، حديقة...) — متل فورم الإضافة بالداشبورد: بتكتب وبتضغط "إضافة" أو Enter
  const [preparingImages, setPreparingImages] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field: keyof typeof EMPTY, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };
  // الأرقام العربية (٠-٩) بتتحوّل قبل الفلترة — وإلا بتنمسح بصمت
  const numeric = digitsOnly;

  // الصور بتتصغّر بالمتصفح قبل الرفع (shrinkImages) — أسرع على الموبايل وما بتتعّب السيرفر
  const addImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length + picked.length > MAX_IMAGES) {
      setErrors(prev => ({ ...prev, images: t("listProperty.errors.tooManyImages", { max: MAX_IMAGES }) }));
      return;
    }
    setPreparingImages(true);
    const selected = await shrinkImages(picked);
    setPreparingImages(false);
    const tooBig = selected.find(f => f.size > MAX_IMAGE_MB * 1024 * 1024);
    if (tooBig) {
      setErrors(prev => ({ ...prev, images: t("listProperty.errors.imageTooBig", { name: tooBig.name, mb: MAX_IMAGE_MB }) }));
      return;
    }
    setErrors(prev => ({ ...prev, images: undefined }));
    setFiles(prev => [...prev, ...selected]);
    setPreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))]);
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (val && !features.includes(val) && features.length < 30) setFeatures(prev => [...prev, val]);
    setFeatureInput("");
  };

  const removeImage = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setFiles(prev => prev.filter((_, j) => j !== i));
    setPreviews(prev => prev.filter((_, j) => j !== i));
  };

  // تحقق سريع بالمتصفح للحقول الإجبارية — السيرفر بيتحقق كمان وبيرجّع أخطاء لكل حقل
  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.ownerName.trim()) e.ownerName = t("listProperty.errors.required");
    const phone = form.ownerPhone;
    if (!phone) e.ownerPhone = t("listProperty.errors.required");
    // رقم سوري: 10 أرقام بيبلّش بـ 0 (موبايل 09… أو أرضي 011…)
    else if (!/^0[0-9]{9}$/.test(phone)) e.ownerPhone = t("listProperty.errors.phone");
    if (!form.type) e.type = t("listProperty.errors.type");
    if (!form.category) e.category = t("listProperty.errors.required");
    if (!form.city) e.city = t("listProperty.errors.required");
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector(`[data-field="${Object.keys(e)[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const data = new FormData();
    const common = ["ownerName", "ownerPhone", "type", "category", "city", "area", "rooms", "bathrooms", "address", "description", "furnished", "hp_field"] as const;
    common.forEach(f => data.append(f, form[f]));
    if (form.type === "rent") RENT_PERIODS.forEach(p => data.append(RENT_FIELD[p], form[RENT_FIELD[p]]));
    else data.append("price", form.price);
    data.append("features", features.join(","));
    files.forEach(f => data.append("images", f));

    setSending(true);
    try {
      await api.post("/property-requests", data);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const { error, fields } = err.response.data as { error?: string; fields?: Errors };
        if (fields) setErrors(fields);
        setSubmitError(typeof error === "string" ? error : t("listProperty.errors.generic"));
      } else {
        setSubmitError(t("listProperty.errors.network"));
      }
    } finally {
      setSending(false);
    }
  };

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t("listProperty.whatsappMessage"))}`;

  if (done) {
    return (
      <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4">
        <SEO title={t("listProperty.seoTitle")} description={t("listProperty.seoDescription")} />
        <div className="max-w-xl mx-auto text-center bg-white dark:bg-gray-800 rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 dark:border-gray-700">
          <MdCheckCircle className="mx-auto text-green-500" size={88} />
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-4">{t("listProperty.successTitle")}</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-3">{t("listProperty.successText")}</p>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white text-xl font-bold shadow-lg transition">
            <img src="/img/whatsapp.svg" width={28} height={28} alt="" />
            {t("listProperty.whatsappButton")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div dir={ar ? "rtl" : "ltr"} className={`min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16 px-4 ${ar ? "text-right" : "text-left"}`}>
      <SEO title={t("listProperty.seoTitle")} description={t("listProperty.seoDescription")} />

      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-800 dark:text-white">{t("listProperty.title")}</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mt-2">{t("listProperty.intro")}</p>
        </header>

        <form onSubmit={handleSubmit} noValidate className="relative flex flex-col gap-6">
          {/* honeypot — البوتات بتعبّيه، البشر ما بيشوفوه.
              ما منبعّده لبرّا الشاشة (left سالب كبير): بصفحة RTL هالشي بيعمل scroll أفقي وبيزيح الصفحة كلها.
              بدالو: نقطة 1px شفافة جوّا الفورم نفسه */}
          <div aria-hidden="true" className="absolute top-0 start-0 w-px h-px overflow-hidden opacity-0 pointer-events-none">
            <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" aria-label="leave empty"
              data-lpignore="true" data-1p-ignore data-form-type="other"
              value={form.hp_field} onChange={e => set("hp_field", e.target.value)} />
          </div>

          {/* (1) معلوماتك */}
          <Section n={1} title={t("listProperty.sections.owner")}>
            <div data-field="ownerName">
              <Label text={t("listProperty.fields.ownerName")} required />
              <input className={inputClass} value={form.ownerName} onChange={e => set("ownerName", e.target.value)} autoComplete="name" />
              <FieldError msg={errors.ownerName} />
            </div>
            <div data-field="ownerPhone">
              <Label text={t("listProperty.fields.ownerPhone")} required />
              <input className={inputClass} dir="ltr" inputMode="tel" autoComplete="tel" placeholder="0991234567"
                value={form.ownerPhone} maxLength={10}
                onChange={e => set("ownerPhone", digitsOnly(e.target.value).slice(0, 10))} />
              <FieldError msg={errors.ownerPhone} />
            </div>
          </Section>

          {/* (2) العقار */}
          <Section n={2} title={t("listProperty.sections.property")}>
            <div className="sm:col-span-2" data-field="type">
              <Label text={t("listProperty.fields.type")} required />
              <div className="grid grid-cols-2 gap-3">
                {(["buy", "rent"] as const).map(v => (
                  <button type="button" key={v} onClick={() => set("type", v)} aria-pressed={form.type === v}
                    className={`py-3.5 rounded-2xl border-2 text-lg font-extrabold transition
                      ${form.type === v
                        ? v === "rent" ? "bg-amber-500 border-amber-500 text-white" : "bg-[#004E80] border-[#004E80] text-white"
                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-sky-400"}`}>
                    {t(`listProperty.types.${v}`)}
                  </button>
                ))}
              </div>
              <FieldError msg={errors.type} />
            </div>
            <div data-field="category">
              <Label text={t("listProperty.fields.category")} required />
              <select className={inputClass} value={form.category} onChange={e => set("category", e.target.value)}>
                <option value="">{t("listProperty.choose")}</option>
                {categories.map((c, i) => <option key={c} value={c}>{ar ? c : categoriesEn[i] || c}</option>)}
              </select>
              <FieldError msg={errors.category} />
            </div>
            <div data-field="city">
              <Label text={t("listProperty.fields.city")} required />
              <select className={inputClass} value={form.city} onChange={e => set("city", e.target.value)}>
                <option value="">{t("listProperty.choose")}</option>
                {cities.map((c, i) => <option key={c} value={c}>{ar ? c : citiesEn[i] || c}</option>)}
              </select>
              <FieldError msg={errors.city} />
            </div>
            <div data-field="area">
              <Label text={t("listProperty.fields.area")} />
              <input className={inputClass} dir="ltr" inputMode="numeric" value={form.area} onChange={e => set("area", numeric(e.target.value))} />
              <FieldError msg={errors.area} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div data-field="rooms">
                <Label text={t("listProperty.fields.rooms")} />
                <input className={inputClass} dir="ltr" inputMode="numeric" value={form.rooms} onChange={e => set("rooms", numeric(e.target.value))} />
              </div>
              <div data-field="bathrooms">
                <Label text={t("listProperty.fields.bathrooms")} />
                <input className={inputClass} dir="ltr" inputMode="numeric" value={form.bathrooms} onChange={e => set("bathrooms", numeric(e.target.value))} />
              </div>
            </div>
            <div className="sm:col-span-2" data-field="address">
              <Label text={t("listProperty.fields.address")} />
              <input className={inputClass} value={form.address} onChange={e => set("address", e.target.value)} placeholder={t("listProperty.placeholders.address")} />
              <FieldError msg={errors.address} />
            </div>
            <div className="sm:col-span-2" data-field="description">
              <Label text={t("listProperty.fields.description")} />
              <textarea className={`${inputClass} resize-y`} rows={4} maxLength={3000} value={form.description}
                onChange={e => set("description", e.target.value)} placeholder={t("listProperty.placeholders.description")} />
              <FieldError msg={errors.description} />
            </div>
            <div className="sm:col-span-2" data-field="features">
              <Label text={t("listProperty.fields.features")} />
              <div className="flex gap-3">
                <input className={`${inputClass} flex-1 min-w-0`} value={featureInput}
                  onChange={e => setFeatureInput(e.target.value.replace(/,/g, "،"))}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                  placeholder={t("listProperty.placeholders.features")} maxLength={100} />
                <button type="button" onClick={addFeature}
                  className="shrink-0 px-5 rounded-2xl bg-[#004E80] hover:bg-sky-700 text-white text-base font-bold transition">
                  {t("listProperty.addFeature")}
                </button>
              </div>
              {features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {features.map((f, i) => (
                    <span key={f} className="inline-flex items-center gap-2 ps-3 pe-1.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-900/30 text-sky-800 dark:text-sky-200 text-sm font-bold">
                      {f}
                      <button type="button" onClick={() => setFeatures(prev => prev.filter((_, j) => j !== i))}
                        aria-label={t("listProperty.removeFeature")}
                        className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 text-red-500 flex items-center justify-center">
                        <MdClose size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <FieldError msg={errors.features} />
            </div>
          </Section>

          {/* (3) السعر */}
          <Section n={3} title={t("listProperty.sections.price")}>
            {form.type === "rent" ? (
              <>
                <p className="sm:col-span-2 text-sm text-gray-500 dark:text-gray-400 -mt-2">{t("listProperty.rentHint")}</p>
                {RENT_PERIODS.map(p => (
                  <div key={p}>
                    <Label text={t(`listProperty.rentPrices.${p}`)} />
                    <input className={inputClass} dir="ltr" inputMode="numeric" placeholder="$"
                      value={form[RENT_FIELD[p]]} onChange={e => set(RENT_FIELD[p], numeric(e.target.value))} />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <Label text={t("listProperty.fields.furnished")} />
                  <select className={inputClass} value={form.furnished} onChange={e => set("furnished", e.target.value)}>
                    <option value="">{t("listProperty.furnished.unknown")}</option>
                    <option value="furnished">{t("properties.furnished")}</option>
                    <option value="unfurnished">{t("properties.unfurnished")}</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="sm:col-span-2" data-field="price">
                <Label text={t("listProperty.fields.price")} />
                <input className={inputClass} dir="ltr" inputMode="numeric" placeholder="$"
                  value={form.price} onChange={e => set("price", numeric(e.target.value))} />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">{t("listProperty.priceHint")}</p>
              </div>
            )}
            <div className="sm:col-span-2"><FieldError msg={errors.price} /></div>
          </Section>

          {/* (4) الصور */}
          <Section n={4} title={t("listProperty.sections.images")}>
            <div className="sm:col-span-2" data-field="images">
              {files.length < MAX_IMAGES && (
                <label className="relative flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-3xl cursor-pointer hover:border-sky-400 transition">
                  <input type="file" multiple accept="image/*" onChange={addImages} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <MdCloudUpload size={36} className="text-sky-500" />
                  <span className="text-base font-bold text-gray-600 dark:text-gray-300 text-center">
                    {preparingImages
                      ? t("listProperty.preparingImages")
                      : t("listProperty.imagesHint", { max: MAX_IMAGES, count: files.length })}
                  </span>
                </label>
              )}
              <FieldError msg={errors.images} />
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {previews.map((src, i) => (
                    <div key={src} className="relative">
                      <img src={src} className="w-full h-24 sm:h-32 object-cover rounded-2xl" alt="" />
                      <button type="button" onClick={() => removeImage(i)} aria-label={t("listProperty.removeImage")}
                        className="absolute top-1.5 end-1.5 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow">
                        <MdClose size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {submitError && (
            <p className="text-base font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-4">{submitError}</p>
          )}

          <button type="submit" disabled={sending || preparingImages}
            className="w-full py-4 rounded-2xl bg-[#004E80] hover:bg-sky-700 text-white text-lg font-extrabold shadow-lg transition disabled:opacity-60">
            {sending ? t("listProperty.sending") : t("listProperty.submit")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ListYourPropertyPage;
