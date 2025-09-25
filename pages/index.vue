<template>
  <div class="min-h-screen bg-gray-900 p-4">
    <div class="container mx-auto">

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Caméra principale -->
        <div class="xl:col-span-2">
          <div class="bg-white/10 backdrop-blur-sm rounded-xl">
            <Camera ref="cameraRef" @photo-captured="handlePhotoCaptured" @show-gallery="showGallery = true" />
          </div>
        </div>

        <!-- Galerie et contrôles -->
        <div class="space-y-6 xl:col-span-2">
          <!-- Photos récentes -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold text-white">
                Photos ({{ photos.length }})
              </h2>
              <button @click="showGallery = true" class="text-white/70 hover:text-white transition-colors">
                <Icon name="heroicons:photo" />
              </button>
            </div>

            <!-- Aperçu des dernières photos -->
            <div v-if="photos.length === 0" class="text-center py-8">
              <div class="text-4xl mb-2">📸</div>
              <p class="text-white/60">Aucune photo prise</p>
              <p class="text-white/40 text-sm mt-2">
                Choisissez un fond et capturez votre première photo !
              </p>
            </div>

            <div v-else class="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              <div v-for="(photo, index) in photos.slice(0, 6)" :key="photo.id" class="relative group cursor-pointer"
                @click="previewPhoto(photo)">
                <img :src="photo.url" :alt="`Photo ${index + 1}`" class="w-full aspect-square object-cover rounded-lg"
                  :class="photo.processed
                      ? 'ring-2 ring-green-400'
                      : 'ring-2 ring-yellow-400'
                    " />

                <!-- Badge de statut -->
                <div class="absolute top-1 left-1">
                  <span v-if="photo.processed" class="bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                    ✨ IA
                  </span>
                  <span v-else-if="photo.error" class="bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                    ⚠️
                  </span>
                </div>

                <!-- Actions au hover -->
                <div
                  class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div class="flex gap-2">
                    <button @click.stop="downloadPhoto(photo)"
                      class="bg-blue-500 text-white w-8 h-8 rounded-full text-xs flex items-center justify-center">
                      📥
                    </button>
                    <button @click.stop="removePhoto(index)"
                      class="bg-red-500 text-white w-8 h-8 rounded-full text-xs flex items-center justify-center">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 class="text-lg font-semibold text-white mb-4">⚡ Actions</h3>
            <div class="space-y-3">
              <button @click="downloadAllPhotos"
                class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                :disabled="photos.length === 0">
                📥 Télécharger tout ({{ photos.length }})
              </button>

              <button @click="saveToSupabase"
                class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                :disabled="isSaving || photos.length === 0">
                {{
                isSaving
                ? '💾 Sauvegarde...'
                : `☁️ Sauvegarder (${photos.length})`
                }}
              </button>

              <button @click="clearAllPhotos"
                class="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                :disabled="photos.length === 0">
                🗑️ Tout effacer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Galerie plein écran -->
    <div v-if="showGallery" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      @click="showGallery = false">
      <div class="bg-gray-900 rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto m-4" @click.stop>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-white">
            Galerie de photos ({{ photos.length }})
          </h3>
          <button @click="showGallery = false" class="text-white text-2xl hover:text-red-400 transition-colors">
            ✕
          </button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="(photo, index) in photos" :key="photo.id" class="relative group">
            <img :src="photo.url" :alt="`Photo ${index + 1}`"
              class="w-full aspect-square object-cover rounded-lg cursor-pointer" @click="previewPhoto(photo)" />

            <!-- Infos photo -->
            <div
              class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg">
              <p class="text-white text-xs">{{ photo.background }}</p>
              <p class="text-white/60 text-xs">{{ photo.timestamp }}</p>
            </div>

            <!-- Actions -->
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex gap-1">
                <button @click="downloadPhoto(photo)"
                  class="bg-blue-500 text-white w-8 h-8 rounded-full text-xs flex items-center justify-center">

                </button>
                <button @click="removePhoto(photos.indexOf(photo))"
                  class="bg-red-500 text-white w-8 h-8 rounded-full text-xs flex items-center justify-center">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notification -->
    <div v-if="toast.show" class="fixed bottom-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-40">
      {{ toast.message }}
    </div>

    <!-- Watermark Logo -->
    <WatermarkLogo />
  </div>
</template>

<script setup>
const photos = ref([])
const isSaving = ref(false)
const showGallery = ref(false)
const cameraRef = ref(null)

const toast = ref({
  show: false,
  message: ''
})

// Statistiques calculées
const processedCount = computed(() => {
  return photos.value.filter((photo) => photo.processed).length
})

const favoriteBackground = computed(() => {
  if (photos.value.length === 0) return 'Aucune'

  const backgrounds = {}
  photos.value.forEach((photo) => {
    if (photo.background && photo.background !== 'Photo originale') {
      backgrounds[photo.background] = (backgrounds[photo.background] || 0) + 1
    }
  })

  const favorite = Object.keys(backgrounds).reduce(
    (a, b) => (backgrounds[a] > backgrounds[b] ? a : b),
    Object.keys(backgrounds)[0]
  )

  return favorite || 'Aucune'
})

const handlePhotoCaptured = (photoData) => {
  photos.value.unshift(photoData)
  showToast(
    `Photo ${photoData.processed ? 'traitée par Gemini' : 'capturée'} !`
  )
}

const previewPhoto = (photo) => {
  // Ouvrir la photo en grand
  const link = document.createElement('a')
  link.href = photo.url
  link.target = '_blank'
  link.click()
}

const downloadPhoto = (photo) => {
  const link = document.createElement('a')
  link.href = photo.url
  link.download = `photobooth-${photo.backgroundId}-${photo.id}.jpg`
  link.click()

  showToast('Photo téléchargée !')
}

const removePhoto = (index) => {
  if (confirm('Supprimer cette photo ?')) {
    const photo = photos.value[index]

    // Libérer l'URL si c'est un blob
    if (photo.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url)
    }

    photos.value.splice(index, 1)
    showToast('Photo supprimée')
  }
}

const downloadAllPhotos = async () => {
  if (photos.value.length === 0) return

  showToast('Préparation du téléchargement...')

  // Télécharger chaque photo avec un délai
  for (let i = 0; i < photos.value.length; i++) {
    const photo = photos.value[i]
    setTimeout(() => {
      downloadPhoto(photo)
    }, i * 500) // 500ms de délai entre chaque téléchargement
  }

  showToast(`${photos.value.length} photos téléchargées !`)
}

const clearAllPhotos = () => {
  if (confirm(`Supprimer toutes les ${photos.value.length} photos ?`)) {
    // Libérer les URLs
    photos.value.forEach((photo) => {
      if (photo.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url)
      }
    })

    photos.value = []
    showToast('Toutes les photos supprimées')
  }
}

const saveToSupabase = async () => {
  if (photos.value.length === 0) return

  isSaving.value = true
  try {
    showToast('Sauvegarde en cours...')

    // TODO: Implémenter la sauvegarde vers Supabase
    console.log('Sauvegarde de', photos.value.length, 'photos vers Supabase')
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulation

    showToast('Photos sauvegardées avec succès!')
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
    showToast('Erreur lors de la sauvegarde')
  } finally {
    isSaving.value = false
  }
}

const showToast = (message) => {
  toast.value.message = message
  toast.value.show = true

  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Nettoyage au démontage
onUnmounted(() => {
  photos.value.forEach((photo) => {
    if (photo.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url)
    }
  })
})

definePageMeta({
  title: 'Session Photobooth - IA Gemini'
})
</script>

<style scoped>
/* Animations personnalisées */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid>div {
  animation: slideIn 0.3s ease-out;
}

/* Scrollbar personnalisée */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
