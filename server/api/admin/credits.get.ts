import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const userId = query.userId as string

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'userId requis'
      })
    }

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

    // Récupérer les crédits de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('newsletter_subscribers')
      .select('credits')
      .eq('id', userId)
      .single()

    if (userError) {
      console.error('❌ Erreur récupération crédits:', userError)
      return {
        success: false,
        credits: 0
      }
    }

    return {
      success: true,
      credits: userData?.credits || 0
    }

  } catch (error) {
    console.error('❌ Erreur récupération crédits:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur: ' + error.message
    })
  }
})
