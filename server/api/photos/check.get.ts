import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const email = query.email as string

    console.log('🔍 Vérification photo pour email:', email)

    if (!email) {
      return {
        success: false,
        message: 'Email requis'
      }
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

    // 1. D'abord, chercher l'utilisateur dans newsletters pour récupérer son ID
    const { data: user, error: userError } = await supabase
      .from('newsletters')
      .select('id, email, full_name_nl')
      .eq('email', email)
      .eq('active', true)
      .single()

    if (userError || !user) {
      console.log('⏳ Utilisateur non trouvé dans newsletters:', email)
      return {
        success: true,
        photo: null,
        message: 'Aucune photo disponible'
      }
    }

    console.log('👤 Utilisateur trouvé:', { id: user.id, email: user.email })

    // 2. Chercher les photos pour cet utilisateur (par guest_email uniquement)
    const { data: photos, error } = await supabase
      .from('photos')
      .select('id, photo_url, created_at, guest_email, guest_session_id, photo_thumbnail, count')
      .eq('guest_email', email)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('❌ Erreur vérification photo:', error)
      return {
        success: false,
        message: 'Erreur lors de la vérification'
      }
    }

    if (!photos || photos.length === 0) {
      console.log('⏳ Aucune photo trouvée pour:', email, 'user_id:', user.id)
      return {
        success: true,
        photo: null,
        message: 'Aucune photo disponible'
      }
    }

    const photo = photos[0]
    console.log('✅ Photo trouvée:', { 
      id: photo.id, 
      user_id: photo.user_id, 
      guest_email: photo.guest_email,
      photo_url: photo.photo_url,
      photo_thumbnail: photo.photo_thumbnail
    })

    return {
      success: true,
      photo: {
        id: photo.id,
        url: photo.photo_url,
        thumbnail: photo.photo_thumbnail,
        created_at: photo.created_at,
        guest_email: photo.guest_email,
        guest_session_id: photo.guest_session_id,
        count: photo.count || 0
      }
    }

  } catch (error) {
    console.error('❌ Erreur API check photo:', error)
    
    if (error.statusCode) {
      throw error
    }

    return {
      success: false,
      message: 'Erreur interne du serveur'
    }
  }
})
