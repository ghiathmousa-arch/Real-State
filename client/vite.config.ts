import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // نحذف console.*/debugger من بناء الإنتاج فقط، عشان يضل شغال بالتطوير المحلي عادي
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
}))
