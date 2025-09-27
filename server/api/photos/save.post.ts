// server/api/photos/save.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { photo_url, photo_thumbnail, background_id, background_name, session_id } = body

  if (!photo_url || !background_id || !background_name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'photo_url, background_id et background_name sont requis'
    })
  }

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

    // Si pas de session_id fourni, créer une nouvelle session
    let currentSessionId = session_id
    if (!currentSessionId) {
      const { data: sessionData, error: sessionError } = await supabase
        .from('photobooth_sessions')
        .insert({
          user_id: user_id,
          photos_count: 0
        })
        .select('id')
        .single()

      if (sessionError) {
        console.error('Erreur création session:', sessionError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Erreur lors de la création de la session'
        })
      }

      currentSessionId = sessionData.id
    }

    // Enregistrer la photo avec miniature
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .insert({
        user_id: user_id,
        session_id: currentSessionId,
        background_id: background_id,
        background_name: background_name,
        photo_url: photo_url,
        photo_thumbnail: photo_thumbnail || null,
        watermark_removed: false,
        is_active: true
      })
      .select('*')
      .single()

    if (photoError) {
      console.error('Erreur sauvegarde photo:', photoError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la sauvegarde de la photo'
      })
    }

    // Mettre à jour le compteur de photos dans la session
    const { error: updateError } = await supabase
      .from('photobooth_sessions')
      .update({
        photos_count: await getSessionPhotosCount(supabase, currentSessionId, user_id)
      })
      .eq('id', currentSessionId)
      .eq('user_id', user_id)

    if (updateError) {
      console.error('Erreur mise à jour compteur:', updateError)
      // Non bloquant, on continue
    }

    return {
      success: true,
      photo: photoData,
      session_id: currentSessionId,
      user_id: user_id
    }

  } catch (error) {
    console.error('Erreur API save photo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})

// Fonction utilitaire pour compter les photos d'une session
async function getSessionPhotosCount(supabase: any, sessionId: string, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    console.error('Erreur comptage photos:', error)
    return 0
  }

  return count || 0
}