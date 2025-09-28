import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {

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

    // Créer le client Supabase avec la clé service
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Récupérer tous les utilisateurs de la table newsletters
    const { data: users, error } = await supabase
      .from('newsletters')
      .select('id, email, full_name_nl, active, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erreur récupération utilisateurs:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des utilisateurs'
      })
    }

    console.log(`✅ ${users.length} utilisateurs récupérés`)

    return {
      success: true,
      users: users || []
    }

  } catch (error) {
    console.error('❌ Erreur API admin users:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
