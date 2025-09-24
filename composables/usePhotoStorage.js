// composables/usePhotoStorage.js
export const usePhotoStorage = () => {
  const photos = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const storageStats = ref({
    totalPhotos: 0,
    localStorageSize: 0,
    supabasePhotos: 0
  })

  // Configuration du stockage
  const STORAGE_CONFIG = {
    localStorage: {
      key: 'photobooth_photos',
      maxPhotos: 50, // Limite pour éviter le débordement
      maxSizePerPhoto: 2 * 1024 * 1024 // 2MB par photo
    },
    supabase: {
      bucket: 'photobooth-photos',
      enabled: false // Sera activé plus tard
    }
  }

  // Utilitaires de conversion
  const dataURLToBlob = (dataURL) => {
    try {
      const arr = dataURL.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], {type: mime})
    } catch (error) {
      console.error('Erreur conversion dataURL vers Blob:', error)
      return null
    }
  }

  const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const calculatePhotoSize = (photo) => {
    const baseSize = photo.url ? photo.url.length * 0.75 : 0 // Approximation base64
    const metaSize = JSON.stringify({
      id: photo.id,
      background: photo.background,
      timestamp: photo.timestamp,
      processed: photo.processed
    }).length
    return baseSize + metaSize
  }

  // Gestion du LocalStorage
  const saveToLocalStorage = (photosArray) => {
    try {
      const photosToStore = photosArray.map(photo => ({
        id: photo.id,
        url: photo.url,
        originalUrl: photo.originalUrl,
        background: photo.background,
        backgroundId: photo.backgroundId,
        timestamp: photo.timestamp,
        processed: photo.processed,
        error: photo.error,
        size: photo.size,
        storageType: 'localStorage'
      }))

      localStorage.setItem(STORAGE_CONFIG.localStorage.key, JSON.stringify(photosToStore))
      updateStorageStats()
      return true
    } catch (error) {
      console.error('Erreur sauvegarde LocalStorage:', error)

      // Si quota dépassé, supprimer les anciennes photos
      if (error.name === 'QuotaExceededError') {
        cleanOldPhotos()
        return saveToLocalStorage(photosArray) // Retry
      }

      return false
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_CONFIG.localStorage.key)
      if (stored) {
        const parsedPhotos = JSON.parse(stored)
        return parsedPhotos.map(photo => ({
          ...photo,
          storageType: 'localStorage'
        }))
      }
      return []
    } catch (error) {
      console.error('Erreur chargement LocalStorage:', error)
      return []
    }
  }

  const cleanOldPhotos = () => {
    const currentPhotos = loadFromLocalStorage()
    const maxPhotos = STORAGE_CONFIG.localStorage.maxPhotos

    if (currentPhotos.length > maxPhotos) {
      // Garder seulement les plus récentes
      const sortedPhotos = currentPhotos.sort((a, b) => b.timestamp - a.timestamp)
      const photosToKeep = sortedPhotos.slice(0, maxPhotos)

      // Libérer les URLs des photos supprimées
      const photosToRemove = sortedPhotos.slice(maxPhotos)
      photosToRemove.forEach(photo => {
        if (photo.url && photo.url.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url)
        }
        if (photo.originalUrl && photo.originalUrl.startsWith('blob:')) {
          URL.revokeObjectURL(photo.originalUrl)
        }
      })

      saveToLocalStorage(photosToKeep)
      console.log(`🧹 Nettoyage: ${photosToRemove.length} anciennes photos supprimées`)
    }
  }

  // Gestion des statistiques de stockage
  const updateStorageStats = () => {
    const localPhotos = loadFromLocalStorage()
    const localStorageSize = new Blob([localStorage.getItem(STORAGE_CONFIG.localStorage.key) || '']).size

    storageStats.value = {
      totalPhotos: localPhotos.length,
      localStorageSize: localStorageSize,
      supabasePhotos: 0, // À implémenter plus tard
      localStorageSizeMB: (localStorageSize / (1024 * 1024)).toFixed(2),
      quotaUsedPercent: Math.round((localStorageSize / (5 * 1024 * 1024)) * 100) // Approximation 5MB quota
    }
  }

  // API publique - Sauvegarder une photo
  const savePhoto = async (photo) => {
    isLoading.value = true
    error.value = null

    try {
      // Validation
      if (!photo || !photo.url) {
        throw new Error('Photo invalide')
      }

      // Vérifier la taille
      const photoSize = calculatePhotoSize(photo)
      if (photoSize > STORAGE_CONFIG.localStorage.maxSizePerPhoto) {
        throw new Error('Photo trop volumineuse')
      }

      // Préparer la photo pour le stockage
      const photoToSave = {
        id: photo.id || Date.now(),
        url: photo.url,
        originalUrl: photo.originalUrl,
        background: photo.background || 'Inconnu',
        backgroundId: photo.backgroundId || 'unknown',
        timestamp: photo.timestamp || new Date().toISOString(),
        processed: photo.processed || false,
        error: photo.error || false,
        size: photoSize,
        createdAt: new Date().toISOString(),
        storageType: 'localStorage'
      }

      // Ajouter à la collection en cours
      const currentPhotos = [...photos.value]
      currentPhotos.unshift(photoToSave) // Ajouter en premier

      // Sauvegarder en LocalStorage
      const saved = saveToLocalStorage(currentPhotos)

      if (saved) {
        photos.value = currentPhotos
        console.log('📸 Photo sauvegardée:', photoToSave.background)

        // TODO: Plus tard - Sauvegarder aussi en Supabase si activé
        // if (STORAGE_CONFIG.supabase.enabled) {
        //   await saveToSupabase(photoToSave)
        // }

        return photoToSave
      } else {
        throw new Error('Échec sauvegarde LocalStorage')
      }

    } catch (err) {
      error.value = err.message
      console.error('Erreur sauvegarde photo:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // API publique - Charger toutes les photos
  const loadPhotos = async () => {
    isLoading.value = true
    error.value = null

    try {
      const localPhotos = loadFromLocalStorage()

      // TODO: Plus tard - Charger aussi depuis Supabase
      // if (STORAGE_CONFIG.supabase.enabled) {
      //   const supabasePhotos = await loadFromSupabase()
      //   allPhotos = [...localPhotos, ...supabasePhotos]
      // }

      photos.value = localPhotos.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      )

      updateStorageStats()
      console.log(`📚 ${photos.value.length} photos chargées depuis LocalStorage`)

      return photos.value
    } catch (err) {
      error.value = err.message
      console.error('Erreur chargement photos:', err)
      return []
    } finally {
      isLoading.value = false
    }
  }

  // API publique - Supprimer une photo
  const deletePhoto = async (photoId) => {
    isLoading.value = true
    error.value = null

    try {
      const photoIndex = photos.value.findIndex(p => p.id === photoId)
      if (photoIndex === -1) {
        throw new Error('Photo introuvable')
      }

      const photo = photos.value[photoIndex]

      // Libérer les URLs blob
      if (photo.url && photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url)
      }
      if (photo.originalUrl && photo.originalUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photo.originalUrl)
      }

      // Supprimer de la collection
      const updatedPhotos = photos.value.filter(p => p.id !== photoId)
      photos.value = updatedPhotos

      // Sauvegarder les modifications
      saveToLocalStorage(updatedPhotos)

      // TODO: Plus tard - Supprimer aussi de Supabase
      // if (STORAGE_CONFIG.supabase.enabled && photo.supabaseId) {
      //   await deleteFromSupabase(photo.supabaseId)
      // }

      console.log('🗑️ Photo supprimée:', photoId)
      return true

    } catch (err) {
      error.value = err.message
      console.error('Erreur suppression photo:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // API publique - Vider le stockage
  const clearAllPhotos = async () => {
    isLoading.value = true
    error.value = null

    try {
      // Libérer toutes les URLs blob
      photos.value.forEach(photo => {
        if (photo.url && photo.url.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url)
        }
        if (photo.originalUrl && photo.originalUrl.startsWith('blob:')) {
          URL.revokeObjectURL(photo.originalUrl)
        }
      })

      // Vider LocalStorage
      localStorage.removeItem(STORAGE_CONFIG.localStorage.key)
      photos.value = []

      // TODO: Plus tard - Vider aussi Supabase
      // if (STORAGE_CONFIG.supabase.enabled) {
      //   await clearSupabasePhotos()
      // }

      updateStorageStats()
      console.log('🧹 Toutes les photos supprimées')

      return true
    } catch (err) {
      error.value = err.message
      console.error('Erreur vidage photos:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // API publique - Exporter toutes les photos
  const exportPhotos = async (format = 'json') => {
    try {
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        totalPhotos: photos.value.length,
        photos: photos.value.map(photo => ({
          id: photo.id,
          background: photo.background,
          backgroundId: photo.backgroundId,
          timestamp: photo.timestamp,
          processed: photo.processed,
          size: photo.size,
          // Ne pas inclure les URLs blob pour l'export
          hasImage: Boolean(photo.url)
        }))
      }

      if (format === 'json') {
        return JSON.stringify(exportData, null, 2)
      } else if (format === 'csv') {
        const csvHeaders = 'ID,Background,Timestamp,Processed,Size\n'
        const csvRows = exportData.photos.map(p =>
          `${p.id},"${p.background}","${p.timestamp}",${p.processed},${p.size}`
        ).join('\n')
        return csvHeaders + csvRows
      }

      return exportData
    } catch (err) {
      console.error('Erreur export photos:', err)
      throw err
    }
  }

  // Initialisation automatique
  onMounted(() => {
    loadPhotos()
  })

  // Nettoyage automatique
  onUnmounted(() => {
    photos.value.forEach(photo => {
      if (photo.url && photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url)
      }
      if (photo.originalUrl && photo.originalUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photo.originalUrl)
      }
    })
  })

  // API publique
  return {
    // État réactif
    photos: readonly(photos),
    isLoading: readonly(isLoading),
    error: readonly(error),
    storageStats: readonly(storageStats),

    // Actions principales
    savePhoto,
    loadPhotos,
    deletePhoto,
    clearAllPhotos,
    exportPhotos,

    // Utilitaires
    updateStorageStats,
    cleanOldPhotos,

    // Configuration (readonly)
    STORAGE_CONFIG: readonly(STORAGE_CONFIG)
  }
}
