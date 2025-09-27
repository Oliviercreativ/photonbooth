// server/api/photos/upload.post.ts
export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  
  const imageFile = formData?.find(field => field.name === 'image')
  const thumbnailFile = formData?.find(field => field.name === 'thumbnail')
  const backgroundId = formData?.find(field => field.name === 'background_id')?.data.toString()
  const backgroundName = formData?.find(field => field.name === 'background_name')?.data.toString()
  const sessionId = formData?.find(field => field.name === 'session_id')?.data.toString()

  if (!imageFile || !backgroundId || !backgroundName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'image, background_id et background_name sont requis'
    })
  }

  // ID utilisateur par défaut si pas connecté
  const DEFAULT_USER_ID = '27c2a406-65a0-421d-af06-d0ebf2f0123e'
  
  try {
    // Créer le client Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const config = useRuntimeConfig()
    
    const supabase = createClient(
      config.public.supabase.url || process.env.SUPABASE_URL,
      config.supabase.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const user_id = DEFAULT_USER_ID

    // Créer une session si nécessaire
    let currentSessionId = sessionId
    if (!currentSessionId) {
      const { data: sessionData, error: sessionError } = await supabase
        .from('photobooth_sessions')
        .insert({
          user_id: user_id,
          photos_count: 0
        })
        .select('id')
        .single()

      if (sessionError) {
        console.error('Erreur création session:', sessionError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Erreur lors de la création de la session'
        })
      }

      currentSessionId = sessionData.id
    }

    // Générer des noms de fichiers uniques
    const timestamp = Date.now()
    const photoFileName = `${user_id}/${timestamp}_${backgroundId}.jpg`
    const thumbnailFileName = `${user_id}/${timestamp}_${backgroundId}_thumb.jpg`

    // Upload de l'image principale vers Supabase Storage
    const { data: photoUpload, error: photoUploadError } = await supabase.storage
      .from('photobooth')
      .upload(photoFileName, imageFile.data, {
        contentType: imageFile.type || 'image/jpeg',
        upsert: false
      })

    if (photoUploadError) {
      console.error('Erreur upload photo:', photoUploadError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de l\'upload de la photo'
      })
    }

    // Upload de la miniature si fournie
    let thumbnailUrl = null
    if (thumbnailFile) {
      const { data: thumbnailUpload, error: thumbnailUploadError } = await supabase.storage
        .from('photobooth')
        .upload(thumbnailFileName, thumbnailFile.data, {
          contentType: thumbnailFile.type || 'image/jpeg',
          upsert: false
        })

      if (!thumbnailUploadError) {
        const { data: thumbnailUrlData } = supabase.storage
          .from('photobooth')
          .getPublicUrl(thumbnailFileName)
        
        thumbnailUrl = thumbnailUrlData.publicUrl
      }
    }

    // Obtenir l'URL publique de la photo
    const { data: photoUrlData } = supabase.storage
      .from('photobooth')
      .getPublicUrl(photoFileName)

    // Enregistrer les métadonnées en base de données
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .insert({
        user_id: user_id,
        session_id: currentSessionId,
        background_id: backgroundId,
        background_name: backgroundName,
        photo_url: photoUrlData.publicUrl,
        photo_thumbnail: thumbnailUrl,
        watermark_removed: false,
        is_active: true
      })
      .select('*')
      .single()

    if (photoError) {
      // Nettoyer les fichiers uploadés en cas d'erreur DB
      await supabase.storage.from('photobooth').remove([photoFileName])
      if (thumbnailUrl) {
        await supabase.storage.from('photobooth').remove([thumbnailFileName])
      }
      
      console.error('Erreur sauvegarde métadonnées photo:', photoError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la sauvegarde des métadonnées'
      })
    }

    // Mettre à jour le compteur de photos dans la session
    await supabase
      .from('photobooth_sessions')
      .update({
        photos_count: await getSessionPhotosCount(supabase, currentSessionId, user_id)
      })
      .eq('id', currentSessionId)
      .eq('user_id', user_id)

    return {
      success: true,
      photo: photoData,
      session_id: currentSessionId,
      user_id: user_id,
      storage_path: photoFileName,
      thumbnail_path: thumbnailFileName
    }

  } catch (error) {
    console.error('Erreur API upload photo:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})

// Fonction utilitaire pour compter les photos d'une session
async function getSessionPhotosCount(supabase: any, sessionId: string, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .eq('is_active', true)

  if (error) {
    console.error('Erreur comptage photos:', error)
    return 0
  }

  return count || 0
}