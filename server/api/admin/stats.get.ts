import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
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

    // Créer le client Supabase avec la clé service
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer les statistiques
    const [newslettersResult, photosResult] = await Promise.all([
      // Nombre d'utilisateurs actifs
      supabase
        .from('newsletters')
        .select('id', { count: 'exact' })
        .eq('active', true),
      
      // Nombre de photos
      supabase
        .from('photos')
        .select('id', { count: 'exact' })
        .eq('is_active', true)
    ])

    if (newslettersResult.error) {
      console.error('❌ Erreur stats newsletters:', newslettersResult.error)
    }

    if (photosResult.error) {
      console.error('❌ Erreur stats photos:', photosResult.error)
    }

    const totalUsers = newslettersResult.count || 0
    const totalPhotos = photosResult.count || 0
    const emailsSent = totalPhotos // Pour l'instant, on considère qu'un email = une photo

    return {
      success: true,
      totalUsers,
      totalPhotos,
      emailsSent
    }

  } catch (error) {
    console.error('❌ Erreur API admin stats:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
