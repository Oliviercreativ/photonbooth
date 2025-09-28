import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const photoId = getRouterParam(event, 'id')
    const query = getQuery(event)
    const email = query.email as string
    const name = query.name as string

    console.log('📸 Consultation photo:', { photoId, email, name })

    if (!photoId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de photo manquant'
      })
    }

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email manquant dans les paramètres'
      })
    }

    // Configuration Supabase
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

    // Récupérer la photo
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('id, url, guest_email, guest_session_id, created_at, is_active')
      .eq('id', photoId)
      .eq('is_active', true)
      .single()

    if (photoError) {
      console.error('❌ Erreur récupération photo:', photoError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Photo non trouvée'
      })
    }

    if (!photo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Photo non trouvée'
      })
    }

    // Vérification de sécurité : l'email doit correspondre
    if (photo.guest_email !== email) {
      console.log('❌ Email ne correspond pas:', { 
        photoEmail: photo.guest_email, 
        providedEmail: email 
      })
      throw createError({
        statusCode: 403,
        statusMessage: 'Accès non autorisé à cette photo'
      })
    }

    // Optionnel : Vérifier que l'email existe dans la table newsletters
    const { data: newsletterUser, error: newsletterError } = await supabase
      .from('newsletters')
      .select('id, full_name_nl')
      .eq('email', email)
      .eq('active', true)
      .single()

    if (newsletterError && newsletterError.code !== 'PGRST116') {
      console.error('❌ Erreur vérification newsletter:', newsletterError)
      // On continue quand même, ce n'est pas bloquant
    }

    console.log('✅ Photo consultée avec succès:', { 
      photoId: photo.id, 
      email: photo.guest_email 
    })

    return {
      success: true,
      photo: {
        id: photo.id,
        url: photo.url,
        created_at: photo.created_at,
        guest_email: photo.guest_email,
        guest_session_id: photo.guest_session_id
      },
      user: {
        email: photo.guest_email,
        fullName: newsletterUser?.full_name_nl || name || null
      }
    }

  } catch (error) {
    console.error('❌ Erreur API photo:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
