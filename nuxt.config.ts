// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {enabled: false},

  // Configuration Vercel optimisée
  nitro: {
    preset: 'vercel',
    vercel: {
      functions: {
        maxDuration: 30
      }
    }
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  supabase: {
    redirect: false
  },

  image: {
    formats: ['webp', 'jpg', 'png'],
    quality: 80,
    provider: 'ipx'
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

  // Configuration build pour production
  build: {
    transpile: ['@google/generative-ai']
  },

  // Headers de sécurité
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    },
    '/previews/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    }
  },

  runtimeConfig: {
    // Côté serveur seulement
    geminiApiKey: process.env.GEMINI_API_KEY,

    // Côté client aussi
    public: {
      appName: 'Mon Photobooth'
    }
  }
})
