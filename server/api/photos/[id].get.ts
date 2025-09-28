export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 API photos/[id].get appelée')

    // Récupérer l'ID de la photo
    const photoId = getRouterParam(event, 'id')
    console.log('🔍 Photo ID:', photoId)

    if (!photoId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de photo manquant'
      })
    }

    // Récupérer le token d'authentification
    const authorization = getHeader(event, 'authorization')
    console.log('🔍 Authorization header:', authorization ? 'Présent' : 'Manquant')

    if (!authorization) {
      console.log('❌ Pas de token d\'authentification')
      throw createError({
        statusCode: 401,
        statusMessage: 'Token d\'authentification manquant'
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.supabaseUrl
    const supabaseAnonKey = config.supabaseAnonKey

    // Extraire le token JWT
    const token = authorization.replace('Bearer ', '')
    console.log('🔍 Token extrait:', token ? 'Présent' : 'Manquant')

    // Créer un client Supabase avec le token utilisateur
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Vérifier le token et récupérer l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    console.log('🔍 Résultat auth:', { 
      user: user?.id, 
      error: authError?.message
    })

    if (authError || !user) {
      console.log('❌ Token invalide ou utilisateur non trouvé')
      throw createError({
        statusCode: 401,
        statusMessage: 'Token invalide'
      })
    }

    console.log('✅ Utilisateur authentifié:', user.id)

    // Récupérer la photo spécifique
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (photoError) {
      console.log('❌ Erreur récupération photo:', photoError)
      if (photoError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Photo non trouvée'
        })
      }
      throw photoError
    }

    console.log('✅ Photo récupérée:', photo.id)

    return {
      success: true,
      photo
    }

  } catch (error) {
    console.error('❌ Erreur API photo:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || `Erreur récupération photo: ${error.message}`
    })
  }
})
