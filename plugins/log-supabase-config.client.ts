export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  console.log('🔑 Configuration Supabase:')
  console.log('📍 SUPABASE_URL:', config.public.supabaseUrl)
  console.log('🔐 SUPABASE_ANON_KEY:', config.public.supabaseAnonKey ? '✅ Définie' : '❌ Manquante')
})
