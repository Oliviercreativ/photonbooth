import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { adminId, password } = body

    console.log('🔐 Tentative de connexion admin:', { adminId })

    // Configuration
    const config = useRuntimeConfig()
    
    // Vérifier les identifiants admin
    const expectedAdminId = config.adminId
    const expectedPassword = config.adminPassword

    if (!expectedAdminId || !expectedPassword) {
      console.error('❌ Configuration admin manquante')
      throw createError({
        statusCode: 500,
        statusMessage: 'Configuration administrateur manquante'
      })
    }

    // Vérifier les identifiants
    if (adminId !== expectedAdminId || password !== expectedPassword) {
      console.log('❌ Identifiants admin incorrects')
      return {
        success: false,
        message: 'Identifiants incorrects'
      }
    }

    // Générer un token simple (dans un vrai projet, utilisez JWT)
    const token = Buffer.from(`${adminId}:${Date.now()}`).toString('base64')

    console.log('✅ Connexion admin réussie')

    return {
      success: true,
      message: 'Connexion réussie',
      token
    }

  } catch (error) {
    console.error('❌ Erreur connexion admin:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur interne du serveur'
    })
  }
})
