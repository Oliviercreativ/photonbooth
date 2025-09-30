// server/api/admin/generate-preview.post.ts
import { serverSupabaseServiceRole } from '#supabase/server'
import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  console.log('🚀 Endpoint generate-preview appelé')

  try {
    const body = await readBody(event)
    console.log('📦 Body reçu:', body)

    const { photoId, backgroundId, backgroundName } = body

    if (!photoId || !backgroundId) {
      console.error('❌ Paramètres manquants:', { photoId, backgroundId })
      throw createError({
        statusCode: 400,
        message: 'photoId et backgroundId requis'
      })
    }

    console.log('🎨 Génération preview:', { photoId, backgroundId, backgroundName })

    // Récupérer le client Supabase admin
    console.log('🔑 Récupération client Supabase...')
    const supabase = serverSupabaseServiceRole(event)
    console.log('✅ Client Supabase OK')

    // 1. Récupérer la photo depuis Supabase
    console.log('📸 Recherche photo dans DB, id:', photoId)
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .select('photo_url, user_id')
      .eq('id', photoId)
      .single()

    if (photoError) {
      console.error('❌ Erreur DB:', photoError)
      throw createError({
        statusCode: 500,
        message: `Erreur DB: ${photoError.message}`
      })
    }

    if (!photoData) {
      console.error('❌ Photo introuvable, id:', photoId)
      throw createError({
        statusCode: 404,
        message: 'Photo introuvable'
      })
    }

    console.log('✅ Photo trouvée:', photoData.photo_url)

    // 2. Télécharger l'image depuis l'URL Supabase
    const imageUrl = photoData.photo_url
    console.log('🌐 Téléchargement image depuis:', imageUrl)
    const imageResponse = await fetch(imageUrl)

    if (!imageResponse.ok) {
      console.error('❌ Erreur téléchargement:', imageResponse.status, imageResponse.statusText)
      throw createError({
        statusCode: 500,
        message: `Impossible de télécharger la photo: ${imageResponse.status}`
      })
    }

    console.log('✅ Image téléchargée, status:', imageResponse.status)
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    console.log('💾 Buffer créé, taille:', imageBuffer.length, 'bytes')

    // 3. Créer une thumbnail optimisée (300x200px)
    console.log('🔧 Création thumbnail avec sharp...')
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(300, 200, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 70 })
      .toBuffer()

    console.log('✅ Thumbnail créée, taille:', thumbnailBuffer.length, 'bytes')

    // 4. Upload dans le dossier public/previews/ via Supabase Storage
    const fileName = `${backgroundId}.webp`
    const filePath = `previews/${fileName}`
    console.log('📁 Upload vers:', filePath)

    // Supprimer l'ancienne preview si elle existe
    console.log('🗑️ Suppression ancienne preview si existe...')
    const { error: deleteError } = await supabase.storage
      .from('photobooth')
      .remove([filePath])

    if (deleteError) {
      console.log('⚠️ Ancienne preview non trouvée (normal si première fois):', deleteError.message)
    } else {
      console.log('✅ Ancienne preview supprimée')
    }

    // Upload la nouvelle preview
    console.log('⬆️ Upload nouvelle preview...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photobooth')
      .upload(filePath, thumbnailBuffer, {
        contentType: 'image/webp',
        upsert: true,
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('❌ Erreur upload:', uploadError)
      throw createError({
        statusCode: 500,
        message: `Erreur upload preview: ${uploadError.message}`
      })
    }

    console.log('✅ Upload réussi:', uploadData)

    // 5. Récupérer l'URL publique
    console.log('🔗 Génération URL publique...')
    const { data: publicUrlData } = supabase.storage
      .from('photobooth')
      .getPublicUrl(filePath)

    const previewUrl = publicUrlData.publicUrl

    console.log('✅ Preview générée avec succès:', previewUrl)

    return {
      success: true,
      previewUrl,
      backgroundId,
      backgroundName,
      message: `Preview créée pour ${backgroundName}`
    }

  } catch (error: any) {
    console.error('❌ ERREUR COMPLÈTE:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      name: error.name,
      error: error
    })
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erreur lors de la génération de la preview',
      data: {
        originalError: error.message,
        stack: error.stack?.split('\n')[0]
      }
    })
  }
})