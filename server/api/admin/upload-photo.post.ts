import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Récupérer le FormData
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Aucun fichier fourni'
      })
    }

    // Extraire les données du formulaire
    const photoFile = formData.find(field => field.name === 'photo')
    const userId = formData.find(field => field.name === 'userId')?.data?.toString()
    const email = formData.find(field => field.name === 'email')?.data?.toString()
    const fullName = formData.find(field => field.name === 'fullName')?.data?.toString()

    if (!photoFile || !userId || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Données manquantes (photo, userId, email)'
      })
    }

    console.log('📸 Upload photo admin:', { 
      userId, 
      email, 
      fullName, 
      fileName: photoFile.filename,
      fileSize: photoFile.data.length,
      fileType: photoFile.type
    })

    // Configuration Supabase avec service key
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

    // Générer un nom de fichier unique
    const fileExtension = photoFile.filename?.split('.').pop() || 'jpg'
    const timestamp = Date.now()
    const fileName = `admin-${userId}-${timestamp}.${fileExtension}`
    const thumbnailName = `admin-${userId}-${timestamp}-thumb.${fileExtension}`
    
    // Chemin dans le bucket
    const filePath = `admin-photos/${fileName}`
    const thumbnailPath = `admin-photos/thumbnails/${thumbnailName}`

    console.log('📁 Chemins de fichiers:')
    console.log('  📸 Photo originale:', filePath)
    console.log('  🖼️ Thumbnail:', thumbnailPath)

    // 1. Upload de la photo originale
    console.log('🚀 Début upload photo originale...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photobooth')
      .upload(filePath, photoFile.data, {
        contentType: photoFile.type || 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Erreur upload photo:', uploadError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de l\'upload de la photo: ' + uploadError.message
      })
    }

    console.log('✅ Photo originale uploadée:', {
      path: filePath,
      size: photoFile.data.length,
      contentType: photoFile.type
    })

    // 2. Créer une thumbnail (redimensionner l'image)
    console.log('🖼️ Création de la thumbnail...')
    const thumbnailBuffer = await createThumbnail(photoFile.data, 300, 300)
    console.log('✅ Thumbnail créée:', {
      originalSize: photoFile.data.length,
      thumbnailSize: thumbnailBuffer.length,
      compressionRatio: Math.round((1 - thumbnailBuffer.length / photoFile.data.length) * 100) + '%'
    })
    
    // 3. Upload de la thumbnail
    console.log('🚀 Début upload thumbnail...')
    const { data: thumbnailUploadData, error: thumbnailError } = await supabase.storage
      .from('photobooth')
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: photoFile.type || 'image/jpeg',
        upsert: false
      })

    if (thumbnailError) {
      console.error('❌ Erreur upload thumbnail:', thumbnailError)
      // Pas bloquant, on continue
    } else {
      console.log('✅ Thumbnail uploadée:', {
        path: thumbnailPath,
        size: thumbnailBuffer.length
      })
    }

    // 4. Récupérer les URLs publiques
    console.log('🔗 Génération des URLs publiques...')
    const { data: urlData } = supabase.storage
      .from('photobooth')
      .getPublicUrl(filePath)
    
    const { data: thumbnailUrlData } = supabase.storage
      .from('photobooth')
      .getPublicUrl(thumbnailPath)

    const photoUrl = urlData.publicUrl
    const thumbnailUrl = thumbnailUrlData.publicUrl

    console.log('🔗 URLs générées:')
    console.log('  📸 Photo originale:', photoUrl)
    console.log('  🖼️ Thumbnail:', thumbnailUrl)

    // 5. Vérifier si l'utilisateur guest a déjà une photo
    if (guestEmail && guestEmail !== 'anonyme@photobooth.local') {
      console.log('🔍 Vérification photo existante pour guest:', guestEmail)
      
      const { data: existingPhoto, error: checkError } = await supabase
        .from('photos')
        .select('id, photo_url')
        .eq('guest_email', guestEmail)
        .eq('is_active', true)
        .limit(1)
      
      if (checkError) {
        console.error('❌ Erreur vérification photo existante:', checkError)
      } else if (existingPhoto && existingPhoto.length > 0) {
        console.log('🚫 Guest a déjà une photo:', guestEmail)
        throw createError({
          statusCode: 403,
          statusMessage: `Cet utilisateur invité (${guestEmail}) a déjà une photo. Les utilisateurs invités sont limités à une seule photo.`
        })
      }
    }

    // 6. Insérer dans la table photos
    console.log('💾 Sauvegarde en base de données...')
    const { data: photoRecord, error: insertError } = await supabase
      .from('photos')
      .insert({
        photo_url: photoUrl,
        photo_thumbnail: thumbnailUrl,
        user_id: null, // Pas d'utilisateur connecté, utiliser guest_email
        guest_email: email,
        guest_session_id: `admin-${userId}`,
        background_id: 'default', // Valeur par défaut pour les photos admin
        background_name: 'Photo admin', // Nom par défaut
        is_active: true,
        count: 1, // Compter comme 1 photo
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('❌ Erreur insertion photo:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la sauvegarde de la photo: ' + insertError.message
      })
    }

    console.log('✅ Photo uploadée avec succès:', {
      photoId: photoRecord.id,
      url: photoUrl,
      thumbnailUrl: thumbnailUrl,
      email: email,
      userId: userId,
      user_id: userId,
      guest_email: email,
      guest_session_id: `admin-${userId}`
    })

    return {
      success: true,
      message: 'Photo envoyée avec succès',
      photoId: photoRecord.id,
      photoUrl,
      thumbnailUrl,
      email,
      userId
    }

  } catch (error) {
    console.error('❌ Erreur upload photo admin:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur: ' + error.message
    })
  }
})

// Fonction pour créer une thumbnail côté serveur
async function createThumbnail(buffer, maxWidth, maxHeight) {
  // Import dynamique de sharp (si disponible) ou fallback
  try {
    const sharp = await import('sharp')
    
    const image = sharp.default(buffer)
    const metadata = await image.metadata()
    
    let { width, height } = metadata
    
    // Calculer les nouvelles dimensions en gardant les proportions
    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height)
        height = maxHeight
      }
    }
    
    return await image
      .resize(width, height)
      .jpeg({ quality: 80 })
      .toBuffer()
      
  } catch (error) {
    console.warn('Sharp non disponible, retour du buffer original')
    return buffer // Fallback si sharp n'est pas installé
  }
}
