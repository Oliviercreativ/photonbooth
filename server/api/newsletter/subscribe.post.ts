import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, fullName, userId = null } = body

    console.log('📧 Newsletter subscription request:', { email, fullName, userId: userId ? 'Present' : 'Guest' })

    // Validation de l'email
    if (!email || !email.includes('@')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email invalide'
      })
    }

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

    // Vérifier si l'email existe déjà
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletters')
      .select('id, active, user_id, full_name_nl')
      .eq('email', email.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ Erreur vérification email existant:', checkError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la vérification de l\'email'
      })
    }

    // Si l'email existe déjà
    if (existingSubscriber) {
      if (existingSubscriber.active) {
        return {
          success: true,
          message: 'Email déjà abonné à la newsletter',
          isNewSubscriber: false
        }
      } else {
        // Réactiver l'abonnement existant
        const { error: updateError } = await supabase
          .from('newsletters')
          .update({
            active: true,
            user_id: userId,
            full_name_nl: fullName,
            created_at: new Date().toISOString()
          })
          .eq('email', email.toLowerCase())

        if (updateError) {
          console.error('❌ Erreur réactivation abonnement:', updateError)
          throw createError({
            statusCode: 500,
            statusMessage: 'Erreur lors de la réactivation de l\'abonnement'
          })
        }

        console.log('✅ Abonnement réactivé:', email)
        return {
          success: true,
          message: 'Abonnement réactivé avec succès !',
          isNewSubscriber: false
        }
      }
    }

    // Créer un nouvel abonnement
    const { data: newSubscriber, error: insertError } = await supabase
      .from('newsletters')
      .insert({
        email: email.toLowerCase(),
        full_name_nl: fullName || null,
        user_id: userId,
        active: true,
        share_email: true,
        tags: [],
        shop_favorites: []
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('❌ Erreur création abonnement:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la création de l\'abonnement'
      })
    }

    console.log('✅ Nouvel abonnement créé:', { id: newSubscriber.id, email })

    return {
      success: true,
      message: 'Abonnement à la newsletter créé avec succès !',
      isNewSubscriber: true,
      subscriberId: newSubscriber.id
    }

  } catch (error) {
    console.error('❌ Erreur newsletter subscription:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
