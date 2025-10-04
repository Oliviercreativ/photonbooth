import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { userId, credits } = body

    if (!userId || credits === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId et credits requis'
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabase.url
    const supabaseServiceKey = config.supabaseServiceKey

    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configuration Supabase manquante'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer la session la plus récente avec son ID
    const { data: currentSession, error: fetchError } = await supabase
      .from('photobooth_sessions')
      .select('id, photos_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!currentSession) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Aucune session trouvée pour cet utilisateur'
      })
    }

    const oldLimit = currentSession.photos_count || 5
    const oldCredits = oldLimit - 5

    // Nouvelle limite = ancienne limite + crédits ajoutés
    const newLimit = oldLimit + credits

    // Mettre à jour photos_count UNIQUEMENT pour la session la plus récente (par ID)
    const { data: sessionData, error: sessionError } = await supabase
      .from('photobooth_sessions')
      .update({ photos_count: newLimit })
      .eq('id', currentSession.id)
      .select()

    if (sessionError) {
      console.error('❌ Erreur mise à jour limite session:', sessionError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la mise à jour de la limite: ' + sessionError.message
      })
    }

    if (sessionData && sessionData.length > 0) {
      console.log('✅ Limite session mise à jour:', {
        userId,
        old_limit: oldLimit,
        new_limit: newLimit,
        credits: credits,
        sessions_updated: sessionData.length
      })
    } else {
      console.log('ℹ️ Aucune session trouvée pour l\'utilisateur:', userId)
    }

    return {
      success: true,
      message: 'Limite mise à jour avec succès',
      data: {
        old_credits: oldCredits,
        old_limit: oldLimit,
        credits_added: credits,
        new_credits: newLimit - 5,
        new_limit: newLimit
      }
    }

  } catch (error) {
    console.error('❌ Erreur mise à jour crédits:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur: ' + error.message
    })
  }
})
