export default defineNuxtRouteMiddleware((to) => {
  // Vérifier si on accède à une route admin
  if (to.path.startsWith('/admin')) {
    // Récupérer l'ID depuis les paramètres de requête
    const adminId = to.query.id as string
    
    // ID admin autorisé
    const authorizedAdminId = '262af476-2407-4d63-9641-fb03ce4b784f'
    
    if (adminId !== authorizedAdminId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Accès non autorisé - ID admin requis'
      })
    }
    
    console.log('✅ Accès admin autorisé avec ID:', adminId)
  }
})
