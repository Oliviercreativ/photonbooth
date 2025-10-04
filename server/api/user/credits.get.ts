import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Récupérer le token d'authentification
    const authHeader = getRequestHeader(event, 'authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Pas d'auth header, essayer de récupérer depuis les cookies
      const config = useRuntimeConfig()
      const supabase = createClient(
        config.public.supabase.url,
        config.public.supabase.anonKey
      )

      const cookieHeader = getRequestHeader(event, 'cookie')
      if (!cookieHeader) {
        return {
          success: true,
          credits: 0
        }
      }

      // Récupérer l'utilisateur depuis la session
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return {
          success: true,
          credits: 0
        }
      }

      // Récupérer les crédits de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('newsletter_subscribers')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.log('❌ Erreur récupération crédits:', userError)
        return {
          success: true,
          credits: 0
        }
      }

      return {
        success: true,
        credits: userData?.credits || 0
      }
    }

    const token = authHeader.replace('Bearer ', '')
    const config = useRuntimeConfig()
    const supabase = createClient(
      config.public.supabase.url,
      config.public.supabase.anonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    // Récupérer l'utilisateur authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('❌ Utilisateur non authentifié:', authError)
      return {
        success: true,
        credits: 0
      }
    }

    // Récupérer les crédits de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('newsletter_subscribers')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.log('❌ Erreur récupération crédits:', userError)
      return {
        success: true,
        credits: 0
      }
    }

    return {
      success: true,
      credits: userData?.credits || 0
    }

  } catch (error) {
    console.error('❌ Erreur récupération crédits:', error)

    return {
      success: true,
      credits: 0
    }
  }
})
