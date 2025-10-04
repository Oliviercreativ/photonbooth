export default defineNuxtRouteMiddleware((to) => {
  // Vérifier si on accède à une route admin
  if (to.path.startsWith('/admin')) {
    // Récupérer l'ID depuis les paramètres de requête
    const adminId = to.query.id as string

    // IDs admin autorisés
    const authorizedAdminIds = [
      'd04dad76-47de-468b-ba95-b5269b1d5385',
      'd56db8f1-aa15-4394-b872-5ee566c919f7'
    ]

    if (!authorizedAdminIds.includes(adminId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Accès non autorisé - ID admin requis'
      })
    }

    console.log('✅ Accès admin autorisé avec ID:', adminId)
  }
})
