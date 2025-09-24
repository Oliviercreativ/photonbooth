// composables/useCamera.js
export const useCamera = () => {
  const video = ref(null)
  const canvas = ref(null)
  const isActive = ref(false)
  const frontCamera = ref(true)
  const error = ref(null)
  const currentStream = ref(null)

  // Contraintes optimisées pour éviter le zoom
  const getCameraConstraints = (facingMode = 'user') => {
    return {
      video: {
        facingMode: facingMode,
        width: {
          min: 640,
          ideal: 1280,
          max: 1920
        },
        height: {
          min: 480,
          ideal: 720,
          max: 1080
        },
        aspectRatio: { ideal: 16 / 9 },
        frameRate: { ideal: 30, max: 60 },
        // Contraintes supplémentaires pour éviter le zoom
        zoom: false,
        focusMode: 'continuous',
        exposureMode: 'continuous',
        whiteBalanceMode: 'continuous'
      }
    }
  }

  const startCamera = async () => {
    try {
      error.value = null

      // Arrêter le stream précédent s'il existe
      if (currentStream.value) {
        currentStream.value.getTracks().forEach(track => track.stop())
      }

      const constraints = getCameraConstraints(
        frontCamera.value ? 'user' : 'environment'
      )

      console.log('Démarrage caméra avec contraintes:', constraints)

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      currentStream.value = stream

      if (video.value) {
        video.value.srcObject = stream

        // Attendre que la vidéo soit prête
        return new Promise((resolve) => {
          video.value.onloadedmetadata = () => {
            isActive.value = true
            console.log(
              `Caméra démarrée: ${video.value.videoWidth}x${video.value.videoHeight}`
            )
            resolve(true)
          }
        })
      }

      return true
    } catch (err) {
      console.error('Erreur démarrage caméra:', err)
      error.value = `Impossible d'accéder à la caméra: ${err.message}`
      isActive.value = false
      return false
    }
  }

  const stopCamera = () => {
    if (currentStream.value) {
      currentStream.value.getTracks().forEach(track => track.stop())
      currentStream.value = null
    }

    if (video.value) {
      video.value.srcObject = null
    }

    isActive.value = false
    error.value = null
  }

  const switchCamera = async () => {
    if (!isActive.value) return false

    frontCamera.value = !frontCamera.value
    isActive.value = false

    const success = await startCamera()
    return success
  }

  const capturePhoto = (quality = 0.9) => {
    if (!video.value || !canvas.value || !isActive.value) {
      console.error('Caméra non prête pour la capture')
      return null
    }

    try {
      const context = canvas.value.getContext('2d')

      // Ajuster la taille du canvas à la vidéo
      canvas.value.width = video.value.videoWidth
      canvas.value.height = video.value.videoHeight

      // Dessiner l'image avec effet miroir si caméra frontale
      if (frontCamera.value) {
        context.scale(-1, 1)
        context.drawImage(video.value, -canvas.value.width, 0)
        context.scale(-1, 1) // Reset
      } else {
        context.drawImage(video.value, 0, 0)
      }

      // Convertir en dataURL
      const dataUrl = canvas.value.toDataURL('image/jpeg', quality)

      console.log('Photo capturée:', {
        width: canvas.value.width,
        height: canvas.value.height,
        quality,
        frontCamera: frontCamera.value
      })

      return dataUrl
    } catch (err) {
      console.error('Erreur capture photo:', err)
      error.value = `Erreur lors de la capture: ${err.message}`
      return null
    }
  }

  // Obtenir les capacités de la caméra
  const getCameraCapabilities = async () => {
    if (!currentStream.value) return null

    try {
      const videoTrack = currentStream.value.getVideoTracks()[0]
      const capabilities = videoTrack.getCapabilities()

      console.log('Capacités caméra:', capabilities)
      return capabilities
    } catch (err) {
      console.error('Erreur obtention capacités:', err)
      return null
    }
  }

  // Ajuster les paramètres de la caméra
  const adjustCameraSettings = async (settings = {}) => {
    if (!currentStream.value) return false

    try {
      const videoTrack = currentStream.value.getVideoTracks()[0]
      await videoTrack.applyConstraints({
        video: {
          ...getCameraConstraints(frontCamera.value ? 'user' : 'environment').video,
          ...settings
        }
      })

      console.log('Paramètres caméra ajustés:', settings)
      return true
    } catch (err) {
      console.error('Erreur ajustement paramètres:', err)
      return false
    }
  }

  // Obtenir les informations du stream actuel
  const getStreamInfo = () => {
    if (!video.value || !isActive.value) return null

    return {
      width: video.value.videoWidth,
      height: video.value.videoHeight,
      aspectRatio: video.value.videoWidth / video.value.videoHeight,
      frontCamera: frontCamera.value,
      isActive: isActive.value
    }
  }

  // Nettoyage automatique
  onUnmounted(() => {
    stopCamera()
  })

  return {
    // Refs
    video,
    canvas,
    isActive: readonly(isActive),
    frontCamera: readonly(frontCamera),
    error: readonly(error),

    // Méthodes
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
    getCameraCapabilities,
    adjustCameraSettings,
    getStreamInfo
  }
}
