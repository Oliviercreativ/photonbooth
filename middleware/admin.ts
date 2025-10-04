export default defineNuxtRouteMiddleware(async (to) => {
  // Vérifier si on accède à une route admin
  if (to.path.startsWith('/admin')) {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Vérifier si l'utilisateur est connecté
    if (!user) {
      console.log('❌ Utilisateur non connecté - redirection vers /auth')
      return navigateTo('/auth')
    }

    // IDs admin autorisés
    const authorizedAdminIds = [
      'd04dad76-47de-468b-ba95-b5269b1d5385',
      'd56db8f1-aa15-4394-b872-5ee566c919f7'
    ]

    // Vérifier si l'utilisateur connecté est un admin
    if (!authorizedAdminIds.includes(user.id)) {
      console.log('❌ Accès refusé - utilisateur non admin:', user.id)
      throw createError({
        statusCode: 403,
        statusMessage: 'Accès non autorisé - Vous devez être administrateur'
      })
    }

    console.log('✅ Accès admin autorisé pour:', user.id)
  }
})
