// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  supabase: {
    redirect: false
  },
  image: {
    formats: ['webp', 'jpg', 'png'],
    quality: 80
  },
  typescript: {
    typeCheck: false,
    strict: false
  },
  vite: {
    esbuild: {
      target: 'esnext'
    },
    optimizeDeps: {
      exclude: ['@nuxt/devtools']
    },
    define: {
      __VUE_PROD_DEVTOOLS__: false
    }
  },
  runtimeConfig: {
    // Côté serveur seulement
    geminiApiKey: process.env.GEMINI_API_KEY,
    
    // Côté client aussi
    public: {
      appName: 'Mon Photobooth'
    }
  },
})
