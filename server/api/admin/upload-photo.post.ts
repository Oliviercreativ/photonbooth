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

    console.log('📸 Upload photo admin:', { userId, email, fullName, fileName: photoFile.filename })

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

    // Générer un nom de fichier unique
    const fileExtension = photoFile.filename?.split('.').pop() || 'jpg'
    const fileName = `admin-${userId}-${Date.now()}.${fileExtension}`
    const filePath = `admin-photos/${fileName}`

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photobooth-images')
      .upload(filePath, photoFile.data, {
        contentType: photoFile.type || 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('❌ Erreur upload storage:', uploadError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de l\'upload de la photo'
      })
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from('photobooth-images')
      .getPublicUrl(filePath)

    const photoUrl = urlData.publicUrl

    // Insérer dans la table photos
    const { data: photoRecord, error: insertError } = await supabase
      .from('photos')
      .insert({
        url: photoUrl,
        user_id: null, // Pas d'utilisateur connecté
        guest_email: email,
        guest_session_id: `admin-${userId}`,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('❌ Erreur insertion photo:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la sauvegarde de la photo'
      })
    }

    console.log('✅ Photo uploadée avec succès:', { photoId: photoRecord.id, url: photoUrl })

    // TODO: Envoyer l'email avec la photo et le lien
    // Pour l'instant, on simule l'envoi d'email
    console.log('📧 Email à envoyer à:', email)
    console.log('🔗 Lien de consultation: /photo/' + photoRecord.id + '?email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(fullName || ''))

    return {
      success: true,
      message: 'Photo uploadée avec succès',
      photoId: photoRecord.id,
      photoUrl,
      emailSent: false // TODO: Mettre à true quand l'email sera envoyé
    }

  } catch (error) {
    console.error('❌ Erreur upload photo admin:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
