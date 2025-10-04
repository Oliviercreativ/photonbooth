import { createError, defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { imageBase64, backgroundId, userId } = body
    
    // Vérifier que l'utilisateur est authentifié
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Utilisateur non authentifié'
      })
    }
    
    if (!imageBase64 || !backgroundId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Image et background requis'
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceKey
    const supabaseAnonKey = config.supabaseAnonKey
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configuration Supabase manquante'
      })
    }

    // Convertir base64 en buffer
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    
    // Nom de fichier unique
    const fileName = `generated_${Date.now()}_${Math.random().toString(36).substring(7)}.png`
    
    // Déterminer l'ID utilisateur (connecté ou par défaut)
    const finalUserId = userId || '27c2a406-65a0-421d-af06-d0ebf2f0123e'
    
    console.log('Upload vers bucket photobooth:', fileName)
    console.log('Utilisateur:', finalUserId)
    
    // Upload vers Supabase Storage
    const uploadResponse = await $fetch(`${supabaseUrl}/storage/v1/object/photobooth/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'image/png',
        'x-upsert': 'true'
      },
      body: imageBuffer
    })
    
    console.log('✅ Upload réussi')

    // Étape 1: Récupérer ou créer une session (SANS toucher à photos_count si elle existe)
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Vérifier si une session existe déjà
    const { data: existingSessions } = await supabase
      .from('photobooth_sessions')
      .select('id, photos_count')
      .eq('user_id', finalUserId)
      .order('created_at', { ascending: false })
      .limit(1)

    let sessionData

    if (existingSessions && existingSessions.length > 0) {
      // Utiliser la session existante SANS MODIFICATION
      sessionData = existingSessions
      console.log('✅ Session existante utilisée:', sessionData[0].id, '- Limite:', sessionData[0].photos_count)
    } else {
      // Créer nouvelle session UNIQUEMENT si elle n'existe pas
      const { data: newSession, error: sessionError } = await supabase
        .from('photobooth_sessions')
        .insert({
          user_id: finalUserId,
          photos_count: 5 // Limite par défaut
        })
        .select()

      if (sessionError) {
        console.error('❌ Erreur création session:', sessionError)
        throw createError({
          statusCode: 500,
          statusMessage: `Erreur création session: ${sessionError.message}`
        })
      }

      sessionData = newSession
      console.log('✅ Nouvelle session créée:', sessionData[0].id, '- Limite par défaut: 5')
    }
    
    // Étape 2: Enregistrer la photo avec le session_id
    const photoUrl = `${supabaseUrl}/storage/v1/object/public/photobooth/${fileName}`
    
    const { data: photoData, error: photoError } = await $fetch(`${supabaseUrl}/rest/v1/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: {
        user_id: finalUserId,
        session_id: sessionData[0].id,
        background_id: backgroundId,
        background_name: backgroundId.replace(/-/g, ' '),
        photo_url: photoUrl,
        photo_thumbnail: null,
        watermark_removed: false,
        is_active: true
      }
    })
    
    if (photoError) {
      console.error('❌ Erreur enregistrement photo:', photoError)
      throw createError({
        statusCode: 500,
        statusMessage: `Erreur enregistrement photo: ${photoError.message}`
      })
    }
    
    console.log('✅ Photo enregistrée avec ID:', photoData[0].id)
    
    return {
      success: true,
      fileName: fileName,
      url: photoUrl,
      photoId: photoData[0].id
    }
    
  } catch (error) {
    console.error('❌ Erreur upload:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Erreur upload: ${error.message}`
    })
  }
})
