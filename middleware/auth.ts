export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('🔍 Middleware auth - Route:', to.path)
  
  // Vérifier l'authentification côté client
  if (process.client) {
    const supabase = useSupabaseClient()
    
    try {
      // Vérifier la session de manière synchrone
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('🔍 Middleware auth - Vérification session:', {
        session: session ? 'Présent' : 'Absent',
        user: session?.user?.id || 'Non connecté',
        error: error?.message
      })
      
      if (!session || error) {
        console.log('❌ Middleware auth - Utilisateur non authentifié, redirection vers /auth')
        return navigateTo('/auth')
      } else {
        console.log('✅ Middleware auth - Utilisateur authentifié:', session.user.id)
      }
    } catch (error) {
      console.error('❌ Middleware auth - Erreur vérification session:', error)
      return navigateTo('/auth')
    }
  }
})
