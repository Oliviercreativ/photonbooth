// server/api/admin/update-count.post.ts
export default defineEventHandler(async (event) => {
  try {
    console.log('🔢 Endpoint update-count appelé')
    
    const body = await readBody(event)
    const { photoId, newCount } = body
    
    if (!photoId || newCount === undefined || newCount === null) {
      throw createError({
        statusCode: 400,
        statusMessage: 'photoId et newCount requis'
      })
    }
    
    if (typeof newCount !== 'number' || newCount < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'newCount doit être un nombre positif ou zéro'
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceKey
    
    if (!supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Clé de service Supabase manquante'
      })
    }
    
    // Créer un client Supabase avec la clé de service
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Vérifier que la photo existe
    const { data: existingPhoto, error: searchError } = await supabase
      .from('photos')
      .select('id, guest_email, count')
      .eq('id', photoId)
      .single()
    
    if (searchError) {
      console.error('❌ Erreur recherche photo:', searchError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Photo non trouvée'
      })
    }
    
    if (!existingPhoto) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Photo non trouvée'
      })
    }
    
    console.log('📸 Photo trouvée:', {
      id: existingPhoto.id,
      guest_email: existingPhoto.guest_email,
      current_count: existingPhoto.count
    })
    
    // Mettre à jour le count
    const { data: updatedPhoto, error: updateError } = await supabase
      .from('photos')
      .update({ count: newCount })
      .eq('id', photoId)
      .select('id, guest_email, count')
      .single()
    
    if (updateError) {
      console.error('❌ Erreur mise à jour count:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la mise à jour du count: ' + updateError.message
      })
    }
    
    console.log('✅ Count mis à jour avec succès:', {
      photo_id: updatedPhoto.id,
      guest_email: updatedPhoto.guest_email,
      old_count: existingPhoto.count,
      new_count: updatedPhoto.count
    })
    
    return {
      success: true,
      message: `Count mis à jour avec succès pour ${updatedPhoto.guest_email}`,
      data: {
        photo_id: updatedPhoto.id,
        guest_email: updatedPhoto.guest_email,
        old_count: existingPhoto.count,
        new_count: updatedPhoto.count
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur endpoint update-count:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: `Erreur serveur: ${error.message}`
    })
  }
})
