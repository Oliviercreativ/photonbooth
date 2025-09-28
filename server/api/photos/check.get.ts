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

    // Chercher la photo la plus récente pour cet email
    const { data: photos, error } = await supabase
      .from('photos')
      .select('id, url, created_at, guest_email, guest_session_id')
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
      console.log('⏳ Aucune photo trouvée pour:', email)
      return {
        success: true,
        photo: null,
        message: 'Aucune photo disponible'
      }
    }

    const photo = photos[0]
    console.log('✅ Photo trouvée:', { id: photo.id, email: photo.guest_email })

    return {
      success: true,
      photo: {
        id: photo.id,
        url: photo.url,
        created_at: photo.created_at,
        guest_email: photo.guest_email,
        guest_session_id: photo.guest_session_id
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
