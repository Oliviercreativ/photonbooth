// server/api/test/storage.get.ts
export default defineEventHandler(async (event) => {
  try {
    // Créer le client Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const config = useRuntimeConfig()
    
    const supabase = createClient(
      config.public.supabase.url || process.env.SUPABASE_URL,
      config.supabase.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Test 1: Vérifier que le bucket photobooth existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      return {
        success: false,
        error: 'Erreur lecture buckets',
        details: bucketsError
      }
    }

    const photoBucket = buckets?.find(bucket => bucket.id === 'photobooth')
    
    if (!photoBucket) {
      return {
        success: false,
        error: 'Bucket photobooth non trouvé',
        buckets: buckets?.map(b => b.id)
      }
    }

    // Test 2: Lister les fichiers du bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('photobooth')
      .list()

    if (filesError) {
      return {
        success: false,
        error: 'Erreur lecture fichiers',
        details: filesError
      }
    }

    // Test 3: Créer une image de test
    const testImageBuffer = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDX4AAA', 'base64')
    
    const testFileName = `test/test_${Date.now()}.jpg`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photobooth')
      .upload(testFileName, testImageBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      return {
        success: false,
        error: 'Erreur upload test',
        details: uploadError
      }
    }

    // Test 4: Obtenir l'URL publique
    const { data: urlData } = supabase.storage
      .from('photobooth')
      .getPublicUrl(testFileName)

    // Test 5: Nettoyer le fichier de test
    await supabase.storage
      .from('photobooth')
      .remove([testFileName])

    return {
      success: true,
      message: 'Tests Supabase Storage réussis !',
      bucket: {
        name: photoBucket.name,
        public: photoBucket.public,
        file_size_limit: photoBucket.file_size_limit,
        allowed_mime_types: photoBucket.allowed_mime_types
      },
      filesCount: files?.length || 0,
      testUpload: {
        path: uploadData.path,
        publicUrl: urlData.publicUrl
      }
    }

  } catch (error) {
    return {
      success: false,
      error: 'Erreur générale de test Storage',
      details: error.message
    }
  }
})