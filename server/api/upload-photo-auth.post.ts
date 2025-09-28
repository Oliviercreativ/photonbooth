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
    
    // 2. Créer session avec Supabase client
    console.log('🚀 Étape 2: Création session...')
    const sessionStartTime = new Date().toISOString()
    const sessionEndTime = new Date().toISOString()
    
    console.log('📊 Données session:', { 
      user_id: user.id, 
      photos_count: 1,
      created_at: sessionStartTime,
      ended_at: sessionEndTime
    })
    
    const { data: sessionData, error: sessionError } = await supabaseWithAuth
      .from('photobooth_sessions')
      .insert({
        user_id: user.id,
        photos_count: 1,
        created_at: sessionStartTime,
        ended_at: sessionEndTime
      })
      .select()
    
    if (sessionError) {
      console.log('❌ Erreur création session:', sessionError)
      throw sessionError
    }
    
    console.log('✅ Session créée:', sessionData[0].id)
    
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
