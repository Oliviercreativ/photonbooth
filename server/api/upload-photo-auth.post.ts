export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 Endpoint upload-photo-auth appelé')
    
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
    
    // Créer un client Supabase pour vérifier le token
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Créer un client Supabase avec le token utilisateur pour les opérations de base de données
    const supabaseWithAuth = createClient(supabaseUrl, supabaseAnonKey, {
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
      error: authError?.message,
      tokenLength: token.length,
      supabaseUrl: supabaseUrl ? 'OK' : 'MANQUANT',
      supabaseAnonKey: supabaseAnonKey ? 'OK' : 'MANQUANT'
    })

    if (authError || !user) {
      console.log('❌ Token invalide ou utilisateur non trouvé')
      throw createError({
        statusCode: 401,
        statusMessage: 'Token invalide'
      })
    }

    console.log('✅ Utilisateur authentifié:', user.id)

    // Compter le nombre de photos réelles dans la table photos
    const { data: existingPhotos, error: countError } = await supabaseWithAuth
      .from('photos')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (countError) {
      console.error('❌ Erreur vérification compteur photos:', countError)
    }

    const currentPhotoCount = existingPhotos?.length || 0

    // Récupérer ou créer la session active de l'utilisateur
    const { data: existingSessions, error: sessionFetchError } = await supabaseWithAuth
      .from('photobooth_sessions')
      .select('id, photos_count')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    let currentSession = existingSessions?.[0]

    // photos_count dans la session stocke la LIMITE de l'utilisateur
    const userLimit = currentSession?.photos_count || 5 // Par défaut 5 si pas de session

    console.log('📊 Photos actuelles:', currentPhotoCount, '/ Limite:', userLimit)

    // Vérifier si la limite est atteinte
    if (currentPhotoCount >= userLimit) {
      console.log(`🚫 Limite de ${userLimit} photos atteinte pour l'utilisateur:`, user.id)
      throw createError({
        statusCode: 403,
        statusMessage: `Vous avez atteint la limite de ${userLimit} photos. Contactez l'administration pour obtenir plus de crédits.`
      })
    }

    const body = await readBody(event)
    const { imageBase64, backgroundId } = body

    if (!imageBase64 || !backgroundId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Image et background requis'
      })
    }

    const supabaseServiceKey = config.supabaseServiceKey

    console.log('🔧 Configuration:', {
      supabaseUrl: supabaseUrl ? 'OK' : 'MANQUANT',
      supabaseServiceKey: supabaseServiceKey ? 'OK' : 'MANQUANT',
      bodyLength: imageBase64?.length || 0,
      backgroundId: backgroundId
    })

    // Convertir base64 en buffer
    console.log('🔄 Conversion base64 vers buffer...')
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    console.log('✅ Buffer créé:', imageBuffer.length, 'bytes')
    
    // Nom de fichier avec dossier utilisateur
    const fileName = `${user.id}/${Date.now()}_${backgroundId}.jpg`
    console.log('📁 Nom de fichier:', fileName)
    
    // 1. Upload vers Supabase Storage
    console.log('🚀 Étape 1: Upload vers Supabase Storage...')
    console.log('🔗 URL:', `${supabaseUrl}/storage/v1/object/photobooth/${fileName}`)
    
    await $fetch(`${supabaseUrl}/storage/v1/object/photobooth/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true'
      },
      body: imageBuffer
    })
    
    console.log('✅ Upload Storage réussi')
    
    // 2. Récupérer ou créer la session (SANS toucher à photos_count)
    console.log('🚀 Étape 2: Gestion session...')
    let sessionData

    if (currentSession) {
      // La session existe, on l'utilise telle quelle (SANS MODIFICATION)
      sessionData = [currentSession]
      console.log('✅ Session existante utilisée:', currentSession.id, '- Limite:', currentSession.photos_count)
    } else {
      // Créer nouvelle session UNIQUEMENT si elle n'existe pas (limite par défaut = 5)
      const sessionStartTime = new Date().toISOString()
      const sessionEndTime = new Date().toISOString()

      const { data: newSession, error: sessionError } = await supabaseWithAuth
        .from('photobooth_sessions')
        .insert({
          user_id: user.id,
          photos_count: 5, // Limite par défaut - sera modifiée UNIQUEMENT par l'admin via dashboard
          created_at: sessionStartTime,
          ended_at: sessionEndTime
        })
        .select()

      if (sessionError) {
        console.log('❌ Erreur création session:', sessionError)
        throw sessionError
      }

      sessionData = newSession
      console.log('✅ Nouvelle session créée:', sessionData[0].id, '- Limite par défaut: 5')
    }
    
    // 3. Enregistrer photo avec Supabase client
    console.log('🚀 Étape 3: Enregistrement photo...')
    const photoUrl = `${supabaseUrl}/storage/v1/object/public/photobooth/${fileName}`
    console.log('🔗 Photo URL:', photoUrl)
    
    const photoDataToInsert = {
      user_id: user.id,
      session_id: sessionData[0].id,
      background_id: backgroundId,
      background_name: backgroundId.replace(/-/g, ' '),
      photo_url: photoUrl,
      watermark_removed: false,
      is_active: true
    }
    
    console.log('📊 Données photo:', photoDataToInsert)
    
    const { data: photoData, error: photoError } = await supabaseWithAuth
      .from('photos')
      .insert(photoDataToInsert)
      .select()
    
    if (photoError) {
      console.log('❌ Erreur enregistrement photo:', photoError)
      throw photoError
    }
    
    console.log('✅ Photo enregistrée:', photoData[0].id)
    
    return {
      success: true,
      fileName,
      url: photoUrl,
      photoId: photoData[0].id,
      userId: user.id
    }
    
  } catch (error) {
    console.error('❌ Erreur upload:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Erreur upload: ${error.message}`
    })
  }
})
