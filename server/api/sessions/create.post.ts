// server/api/sessions/create.post.ts
export default defineEventHandler(async (event) => {
  // ID utilisateur par défaut si pas connecté
  const DEFAULT_USER_ID = '27c2a406-65a0-421d-af06-d0ebf2f0123e'
  
  try {
    // Créer le client Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const config = useRuntimeConfig()
    
    const supabase = createClient(
      config.public.supabase.url || process.env.SUPABASE_URL,
      config.supabase.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Utiliser l'ID par défaut pour l'instant
    const user_id = DEFAULT_USER_ID

    // Créer une nouvelle session
    const { data: sessionData, error: sessionError } = await supabase
      .from('photobooth_sessions')
      .insert({
        user_id: user_id,
        photos_count: 0
      })
      .select('*')
      .single()

    if (sessionError) {
      console.error('Erreur création session:', sessionError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la création de la session'
      })
    }

    return {
      success: true,
      session: sessionData,
      user_id: user_id
    }

  } catch (error) {
    console.error('Erreur API create session:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})