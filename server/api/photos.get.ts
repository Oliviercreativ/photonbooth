export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 API photos.get appelée')

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

    // Récupérer les paramètres de pagination
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 20
    const offset = (page - 1) * limit

    console.log('📊 Paramètres:', { page, limit, offset })

    // Récupérer les photos de l'utilisateur
    const { data: photos, error: photosError, count } = await supabase
      .from('photos')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (photosError) {
      console.log('❌ Erreur récupération photos:', photosError)
      throw photosError
    }

    console.log('✅ Photos récupérées:', photos?.length || 0, 'sur', count)

    // Calculer les informations de pagination
    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      success: true,
      photos: photos || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    }

  } catch (error) {
    console.error('❌ Erreur API photos:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Erreur récupération photos: ${error.message}`
    })
  }
})
