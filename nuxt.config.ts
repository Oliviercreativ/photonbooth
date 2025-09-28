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

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', 'nuxt-icon'],

  app: {
    head: {
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap'
        }
      ]
    }
  },

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
    strict: false,
    shim: false
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

  // Désactiver la génération automatique des types
  hooks: {
    'prepare:types': () => {}
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
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    // Configuration admin
    adminId: process.env.ADMIN_ID,
    adminPassword: process.env.ADMIN_PASSWORD,
    // Côté client aussi
    public: {
      appName: 'Mon Photobooth',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    }
  }
})