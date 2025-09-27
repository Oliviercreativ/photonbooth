// server/api/sessions/[id]/photos.get.ts
export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'id')
  
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session ID requis'
    })
  }

  const supabase = serverSupabaseServiceRole(event)
  
  // ID utilisateur par défaut si pas connecté
  const DEFAULT_USER_ID = '27c2a406-65a0-421d-af06-d0ebf2f0123e'
  
  try {
    // Récupérer l'utilisateur connecté ou utiliser l'ID par défaut
    const { data: { user } } = await supabase.auth.getUser()
    const user_id = user?.id || DEFAULT_USER_ID

    // Récupérer les photos de la session
    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .eq('session_id', sessionId)
      .eq('user_id', user_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur récupération photos:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des photos'
      })
    }

    return {
      success: true,
      photos: photos || [],
      count: photos?.length || 0
    }

  } catch (error) {
    console.error('Erreur API get session photos:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})