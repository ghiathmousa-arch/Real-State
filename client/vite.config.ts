import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import ar from './src/website/locales/ar.json'
import seo from './src/seo.config'

// الموقع SPA بلا SSR، فالـ structured data يلي بتنحقن عبر react-helmet-async
// ما بتظهر إلا بعد ما يشتغل JavaScript. جوجل بينفّذ JS بس أبطأ وأقل ضماناً.
// هالبلَك-إن بيحقن نفس الـ schema ثابتة بالـ HTML وقت البناء — نفس المصدر
// (ar.json و seo.config) فما في احتمال تنحرف عن النص المعروض على الصفحة.
const structuredData = () => ({
  name: 'inject-structured-data',
  transformIndexHtml() {
    const faqItems = Array.isArray(ar.faq?.items) ? ar.faq.items : []

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

    return blocks.map((block) => ({
      tag: 'script',
      attrs: { type: 'application/ld+json' },
      children: JSON.stringify(block),
      injectTo: 'head' as const,
    }))
  },
})

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    structuredData(),
  ],
  // نحذف console.*/debugger من بناء الإنتاج فقط، عشان يضل شغال بالتطوير المحلي عادي
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
