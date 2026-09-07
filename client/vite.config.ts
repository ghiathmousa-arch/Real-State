import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import ar from './src/website/locales/ar.json'
import seo from './src/seo.config'

// الموقع SPA بلا SSR، فكل شي بينحقن عبر react-helmet-async (العنوان، الوصف،
// og:*، والـ structured data) ما بيوجد إلا بعد ما يشتغل JavaScript. جوجل بينفّذ JS
// بس أبطأ وأقل ضماناً، وكراولرات السوشال (فيسبوك، واتساب، تويتر) ما بتشغّله أبداً —
// فمشاركة رابط الموقع كانت تطلع بلا عنوان ولا وصف ولا صورة.
//
// هالبلَك-إن بيحقن نفس البيانات ثابتة بالـ HTML وقت البناء، من نفس المصدر
// (ar.json و seo.config) فما في احتمال تنحرف عن المعروض على الصفحة.
//
// كل وسم بيحمل data-rh="true": هيك react-helmet-async بيتعامل معه كأنه من إنتاجه
// وبيستبدله لما يشتغل JS (مثلاً عنوان صفحة عقار معيّن) بدل ما يضيف نسخة تانية.
const seoTags = () => ({
  name: 'inject-seo-tags',
  transformIndexHtml() {
    const rh = { 'data-rh': 'true' }
    const faqItems = Array.isArray(ar.faq?.items) ? ar.faq.items : []

    const tags: any[] = [
      { tag: 'title', children: seo.titleAr, attrs: rh, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, name: 'description', content: seo.descriptionAr }, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, name: 'robots', content: 'index, follow' }, injectTo: 'head' },
      { tag: 'link', attrs: { ...rh, rel: 'canonical', href: seo.url }, injectTo: 'head' },

      { tag: 'meta', attrs: { ...rh, property: 'og:type', content: 'website' }, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, property: 'og:site_name', content: seo.siteName }, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, property: 'og:title', content: seo.titleAr }, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, property: 'og:description', content: seo.descriptionAr }, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, property: 'og:image', content: seo.image }, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, property: 'og:url', content: seo.url }, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, property: 'og:locale', content: 'ar_SY' }, injectTo: 'head' },

      { tag: 'meta', attrs: { ...rh, name: 'twitter:card', content: 'summary_large_image' }, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, name: 'twitter:title', content: seo.titleAr }, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, name: 'twitter:description', content: seo.descriptionAr }, injectTo: 'head' },
      { tag: 'meta', attrs: { ...rh, name: 'twitter:image', content: seo.image }, injectTo: 'head' },
    ]

    const blocks: object[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: seo.siteName,
        url: seo.url,
        logo: seo.image,
        sameAs: Object.values(seo.social).filter(Boolean),
      },
    ]

    if (faqItems.length > 0) {
      blocks.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item: { question: string; answer: string }) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      })
    }

    for (const block of blocks) {
      tags.push({
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        children: JSON.stringify(block),
        injectTo: 'head',
      })
    }

    return tags
  },
})

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    seoTags(),
  ],
  // نحذف console.*/debugger من بناء الإنتاج فقط، عشان يضل شغال بالتطوير المحلي عادي
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
