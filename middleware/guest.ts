export default defineNuxtRouteMiddleware((to, from) => {
  // Vérifier l'authentification côté client
  const supabase = useSupabaseClient()
  
  // Cette fonction sera exécutée côté client uniquement
  if (process.client) {
    // Vérifier la session de manière asynchrone
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔍 Middleware guest - Vérification session:', {
        session: session ? 'Présent' : 'Absent',
        user: session?.user?.id || 'Non connecté',
        error: error?.message
      })
      
      if (session && !error) {
        console.log('✅ Middleware guest - Utilisateur déjà connecté, redirection vers /')
        navigateTo('/')
      } else {
        console.log('✅ Middleware guest - Utilisateur non connecté, accès autorisé')
      }
    }).catch((error) => {
      console.error('❌ Middleware guest - Erreur vérification session:', error)
      // En cas d'erreur, autoriser l'accès à la page guest
    })
  }
})
