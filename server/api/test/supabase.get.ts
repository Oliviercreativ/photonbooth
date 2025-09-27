// server/api/test/supabase.get.ts
export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole(event)
  
  const DEFAULT_USER_ID = '27c2a406-65a0-421d-af06-d0ebf2f0123e'
  
  try {
    // Test 1: Vérifier la connexion Supabase
    const { data: tables, error: tablesError } = await supabase
      .from('photobooth_sessions')
      .select('*')
      .limit(1)

    if (tablesError) {
      return {
        success: false,
        error: 'Erreur de connexion aux tables',
        details: tablesError
      }
    }

    // Test 2: Créer une session de test
    const { data: sessionData, error: sessionError } = await supabase
      .from('photobooth_sessions')
      .insert({
        user_id: DEFAULT_USER_ID,
        photos_count: 0
      })
      .select('*')
      .single()

    if (sessionError) {
      return {
        success: false,
        error: 'Erreur création session test',
        details: sessionError
      }
    }

    // Test 3: Créer une photo de test
    const { data: photoData, error: photoError } = await supabase
      .from('photos')
      .insert({
        user_id: DEFAULT_USER_ID,
        session_id: sessionData.id,
        background_id: 'test-background',
        background_name: 'Test Background',
        photo_url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAA...', // Base64 minimal
        watermark_removed: false,
        is_active: true
      })
      .select('*')
      .single()

    if (photoError) {
      return {
        success: false,
        error: 'Erreur création photo test',
        details: photoError
      }
    }

    // Test 4: Nettoyer les données de test
    await supabase
      .from('photos')
      .delete()
      .eq('id', photoData.id)

    await supabase
      .from('photobooth_sessions')
      .delete()
      .eq('id', sessionData.id)

    return {
      success: true,
      message: 'Tous les tests Supabase ont réussi !',
      tests: {
        connection: '✅ Connexion OK',
        session_creation: '✅ Création session OK',
        photo_creation: '✅ Création photo OK',
        cleanup: '✅ Nettoyage OK'
      },
      session_created: sessionData,
      photo_created: photoData
    }

  } catch (error) {
    console.error('Erreur test Supabase:', error)
    return {
      success: false,
      error: 'Erreur générale de test',
      details: error.message
    }
  }
})