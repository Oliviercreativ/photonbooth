// composables/usePhotobooth.js
export const usePhotobooth = () => {
  const currentStep = ref('camera') // 'camera', 'edit', 'result'
  const isProcessing = ref(false)
  const processingStep = ref('')
  const error = ref(null)

  const capturedImage = ref(null)
  const processedImage = ref(null)
  const capturedPhotos = ref([])
  const selectedBackground = ref(null)

  // Traiter une photo avec Gemini Nano Banana
  const processPhoto = async (imageBlob, backgroundId, highQuality = true) => {
    if (!imageBlob || !backgroundId) {
      throw new Error('Image et background requis')
    }

    isProcessing.value = true
    error.value = null

    try {
      processingStep.value = "Préparation de l'image..."

      // Préparer les données
      const formData = new FormData()
      formData.append('image', imageBlob, 'photo.jpg')
      formData.append('background', backgroundId)
      formData.append('high_quality', highQuality.toString())

      processingStep.value = 'Gemini 2.5 analyse votre photo...'

      // Appeler l'API Nano Banana
      const response = await fetch('/api/photobooth-nano-banana', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Erreur API (${response.status}): ${errorText}`)
      }

      processingStep.value = 'Finalisation du traitement...'

      const resultBlob = await response.blob()
      const processedUrl = URL.createObjectURL(resultBlob)

      processedImage.value = processedUrl

      // Sauvegarder dans l'historique
      const photoData = {
        id: Date.now(),
        url: processedUrl,
        backgroundId,
        background: selectedBackground.value?.name || 'Fond personnalisé',
        timestamp: new Date().toLocaleString(),
        processed: true,
        size: resultBlob.size
      }

      capturedPhotos.value.unshift(photoData)

      processingStep.value = 'Photo terminée !'

      // Passer à l'étape résultat
      currentStep.value = 'result'

      setTimeout(() => {
        processingStep.value = ''
        isProcessing.value = false
      }, 1000)

      return processedUrl
    } catch (err) {
      console.error('Erreur traitement Gemini:', err)
      error.value = err.message
      isProcessing.value = false
      processingStep.value = ''
      throw err
    }
  }

  // Traitement live (plus rapide, moins de qualité)
  const processLiveFrame = async (imageBlob, backgroundId) => {
    if (!imageBlob || !backgroundId) return null

    try {
      const formData = new FormData()
      formData.append('image', imageBlob, 'frame.jpg')
      formData.append('background', backgroundId)

      const response = await fetch('/api/photobooth-nano-banana', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const resultBlob = await response.blob()
        return URL.createObjectURL(resultBlob)
      }

      return null
    } catch (err) {
      console.error('Erreur traitement live:', err)
      return null
    }
  }

  // Télécharger une photo
  const downloadPhoto = (photoUrl, filename) => {
    try {
      const link = document.createElement('a')
      link.href = photoUrl
      link.download = filename || `photobooth-${Date.now()}.png`
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log('Photo téléchargée:', filename)
    } catch (err) {
      console.error('Erreur téléchargement:', err)
      error.value = 'Erreur lors du téléchargement'
    }
  }

  // Partager une photo
  const sharePhoto = async (photoUrl, metadata = {}) => {
    try {
      if (navigator.share) {
        // API Web Share si disponible
        const response = await fetch(photoUrl)
        const blob = await response.blob()
        const file = new File([blob], `photobooth-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })

        await navigator.share({
          title: `Ma photo à ${metadata.backgroundName || 'destination inconnue'} !`,
          text: 'Découvrez ma photo créée avec le photobooth IA !',
          files: [file]
        })
      } else {
        // Fallback: copier l'URL
        await navigator.clipboard.writeText(photoUrl)
        alert('Lien copié dans le presse-papiers !')
      }
    } catch (err) {
      console.error('Erreur partage:', err)
      error.value = 'Erreur lors du partage'
    }
  }

  // Supprimer une photo
  const deletePhoto = (photoId) => {
    const index = capturedPhotos.value.findIndex((p) => p.id === photoId)
    if (index > -1) {
      const photo = capturedPhotos.value[index]

      // Libérer l'URL si c'est un blob
      if (photo.url && photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url)
      }

      capturedPhotos.value.splice(index, 1)
      console.log('Photo supprimée:', photoId)
    }
  }

  // Réinitialiser la session
  const resetSession = () => {
    // Libérer les URLs des blobs
    capturedPhotos.value.forEach((photo) => {
      if (photo.url && photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url)
      }
    })

    if (processedImage.value && processedImage.value.startsWith('blob:')) {
      URL.revokeObjectURL(processedImage.value)
    }

    // Réinitialiser l'état
    currentStep.value = 'camera'
    isProcessing.value = false
    processingStep.value = ''
    error.value = null
    capturedImage.value = null
    processedImage.value = null
    capturedPhotos.value = []
    selectedBackground.value = null
  }

  // Démarrer une nouvelle photo
  const startNewPhoto = () => {
    if (processedImage.value && processedImage.value.startsWith('blob:')) {
      URL.revokeObjectURL(processedImage.value)
    }

    capturedImage.value = null
    processedImage.value = null
    currentStep.value = 'camera'
    error.value = null
  }

  // Setters pour l'état
  const setCapturedImage = (imageData) => {
    capturedImage.value = imageData
  }

  const setCurrentStep = (step) => {
    currentStep.value = step
  }

  const setSelectedBackground = (background) => {
    selectedBackground.value = background
  }

  // Getters calculés
  const totalPhotos = computed(() => capturedPhotos.value.length)
  const processedCount = computed(
    () => capturedPhotos.value.filter((p) => p.processed).length
  )
  const totalSize = computed(() =>
    capturedPhotos.value.reduce((total, photo) => total + (photo.size || 0), 0)
  )

  // Statistiques
  const getStats = () => {
    const backgrounds = {}
    capturedPhotos.value.forEach((photo) => {
      if (photo.background && photo.processed) {
        backgrounds[photo.background] = (backgrounds[photo.background] || 0) + 1
      }
    })

    const favoriteBackground = Object.keys(backgrounds).reduce(
      (a, b) => (backgrounds[a] > backgrounds[b] ? a : b),
      Object.keys(backgrounds)[0]
    )

    return {
      totalPhotos: totalPhotos.value,
      processedCount: processedCount.value,
      totalSize: totalSize.value,
      favoriteBackground: favoriteBackground || 'Aucune',
      backgrounds
    }
  }

  // Nettoyage automatique
  onUnmounted(() => {
    resetSession()
  })

  return {
    // État réactif
    currentStep: readonly(currentStep),
    isProcessing: readonly(isProcessing),
    processingStep: readonly(processingStep),
    error: readonly(error),
    capturedImage: readonly(capturedImage),
    processedImage: readonly(processedImage),
    capturedPhotos: readonly(capturedPhotos),
    selectedBackground,

    // Statistiques
    totalPhotos,
    processedCount,
    totalSize,

    // Actions
    processPhoto,
    processLiveFrame,
    downloadPhoto,
    sharePhoto,
    deletePhoto,
    resetSession,
    startNewPhoto,
    setCapturedImage,
    setCurrentStep,
    setSelectedBackground,
    getStats
  }
}
