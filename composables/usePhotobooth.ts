// composables/usePhotobooth.ts
export const usePhotobooth = () => {
  const currentSessionId = ref<string | null>(null)
  const isConnected = ref(false)

  // Initialiser une session au démarrage
  const initSession = async () => {
    try {
      const { data } = await $fetch('/api/sessions/create', {
        method: 'POST'
      })
      
      if (data?.session?.id) {
        currentSessionId.value = data.session.id
        isConnected.value = true
        console.log('Session initialisée:', data.session.id)
      }
    } catch (error) {
      console.error('Erreur initialisation session:', error)
    }
  }

  // Sauvegarder une photo
  const savePhoto = async (photoData: {
    photo_url: string
    background_id: string
    background_name: string
  }) => {
    try {
      const { data } = await $fetch('/api/photos/save', {
        method: 'POST',
        body: {
          ...photoData,
          session_id: currentSessionId.value
        }
      })

      // Mettre à jour l'ID de session si c'était la première photo
      if (data?.session_id && !currentSessionId.value) {
        currentSessionId.value = data.session_id
      }

      return data
    } catch (error) {
      console.error('Erreur sauvegarde photo:', error)
      throw error
    }
  }

  // Récupérer les photos de la session
  const getSessionPhotos = async () => {
    if (!currentSessionId.value) return []

    try {
      const { data } = await $fetch(`/api/sessions/${currentSessionId.value}/photos`)
      return data?.photos || []
    } catch (error) {
      console.error('Erreur récupération photos:', error)
      return []
    }
  }

  return {
    currentSessionId: readonly(currentSessionId),
    isConnected: readonly(isConnected),
    initSession,
    savePhoto,
    getSessionPhotos
  }
}