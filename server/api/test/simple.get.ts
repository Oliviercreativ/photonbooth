// server/api/test/simple.get.ts
export default defineEventHandler(async (event) => {
  try {
    // Test simple de création de client Supabase
    const { createClient } = await import('@supabase/supabase-js')
    
    const config = useRuntimeConfig()
    
    const supabase = createClient(
      config.public.supabase.url || process.env.SUPABASE_URL,
      config.supabase.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Test simple
    const { data, error } = await supabase
      .from('photobooth_sessions')
      .select('*')
      .limit(1)

    if (error) {
      return {
        success: false,
        error: 'Erreur Supabase',
        details: error,
        config: {
          url: config.public?.supabase?.url || 'non défini',
          hasServiceKey: !!(config.supabase?.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY)
        }
      }
    }

    return {
      success: true,
      message: 'Connexion Supabase OK',
      sessionCount: data?.length || 0
    }

  } catch (error) {
    return {
      success: false,
      error: 'Erreur de test',
      details: error.message
    }
  }
})