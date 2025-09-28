<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Sélection de fonds -->
    <div v-if="showBackgroundSelector" class="h-screen flex flex-col">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b border-white/20">
        <h2 class="text-white text-lg sm:text-xl font-bold">Choisir un effet</h2>
        <button @click="showBackgroundSelector = false"
          class="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-3 rounded-lg transition-colors touch-manipulation min-h-[48px] min-w-[80px] font-semibold">
          ✕ Fermer
        </button>
      </div>

      <!-- Onglets -->
      <div class="flex border-b border-white/20">
        <button @click="activeTab = 'geographic'"
          class="flex-1 px-2 py-4 text-center transition-colors touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
          :class="activeTab === 'geographic' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'">
          <span class="text-xl mb-1"><Icon name="heroicons:globe-alt" /></span>
          <span class="text-sm font-medium">Pays et Ville</span>
        </button>
        <button @click="activeTab = 'transformed'"
          class="flex-1 px-2 py-4 text-center transition-colors touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
          :class="activeTab === 'transformed' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'">
          <span class="text-xl mb-1"><Icon name="heroicons:globe-alt" /></span>
          <span class="text-sm font-medium">Monde Entier</span>
        </button>
        <button @click="activeTab = 'original'"
          class="flex-1 px-2 py-4 text-center transition-colors touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
          :class="activeTab === 'original' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'">
          <span class="text-xl mb-1"><Icon name="heroicons:camera" /></span>
          <span class="text-sm font-medium">Monde Original</span>
        </button>
      </div>

      <!-- Grille des fonds -->
      <div class="flex-1 overflow-y-auto p-3 sm:p-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          <div v-for="bg in filteredBackgrounds" :key="bg.id" @click.stop="selectBackground(bg)"
            class="relative cursor-pointer rounded-xl overflow-hidden group active:scale-95 transition-transform duration-150 touch-manipulation"
            :class="selectedBackground?.id === bg.id ? 'ring-4 ring-blue-400 shadow-xl' : 'ring-2 ring-transparent hover:ring-white/30'">
            <img :src="bg.preview" class="w-full h-28 sm:h-32 md:h-40 lg:h-48 object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent">
              <div class="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                <p class="text-white text-base sm:text-lg font-bold mb-1">{{ bg.emoji }}</p>
                <p class="text-white text-xs sm:text-sm opacity-95 leading-tight font-medium">{{ bg.name }}</p>
              </div>
            </div>

            <!-- Indicateur de sélection -->
            <div v-if="selectedBackground?.id === bg.id"
              class="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-white text-sm sm:text-base font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Caméra après sélection du fond -->
    <div v-else class="h-screen">
      <div class="bg-white/10 backdrop-blur-sm rounded-xl h-full">
        <Camera ref="cameraRef" @photo-captured="handlePhotoCaptured" @show-gallery="showGallery = true" />
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

    
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default'
})

// Vérifier l'authentification
const user = useSupabaseUser()

// Rediriger vers l'auth si pas connecté
if (!user.value) {
  await navigateTo('/auth')
}

const photos = ref([])
const isSaving = ref(false)
const showGallery = ref(false)
const cameraRef = ref(null)
const selectedBackground = ref(null)
const activeTab = ref('geographic')
const showBackgroundSelector = ref(true)

const toast = ref({
  show: false,
  message: ''
})

// Fonds disponibles
const backgrounds = ref([
  {
    id: 'brussels-grand-place',
    name: 'Grand-Place Bruxelles',
    emoji: '🏛️',
    preview: '/previews/brussels.jpg'
  },
  {
    id: 'chimay-cathedral',
    name: 'Cathédrale Chimay',
    emoji: '⛪',
    preview: '/previews/chimay.jpg'
  },
  {
    id: 'paris-eiffel',
    name: 'Tour Eiffel Paris',
    emoji: '🗼',
    preview: '/previews/paris.jpg'
  },
  {
    id: 'tropical-beach',
    name: 'Plage Tropicale',
    emoji: '🏝️',
    preview: '/previews/beach.jpg'
  },
  {
    id: 'pixar-caricature',
    name: 'Caricature Pixar 3D',
    emoji: '🎭',
    preview: '/previews/pixar.jpg'
  },
  {
    id: 'belgium-patriotic',
    name: 'Belgique Patriotique',
    emoji: '🇧🇪',
    preview: '/previews/belgium.jpg'
  },
  {
    id: 'pixar-belgium',
    name: 'Pixar Belgique 3D',
    emoji: '🎭🇧🇪',
    preview: '/previews/pixar-belgium.jpg'
  },
  {
    id: 'pixar-uk',
    name: 'Pixar Grande-Bretagne 3D',
    emoji: '🎭🇬🇧',
    preview: '/previews/pixar-uk.jpg'
  },
  {
    id: 'pixar-germany',
    name: 'Pixar Oktoberfest 3D',
    emoji: '🎭🇩🇪',
    preview: '/previews/pixar-germany.jpg'
  },
  {
    id: 'ghibli-belgium',
    name: 'Studio Ghibli Belgique',
    emoji: '🎨🇧🇪',
    preview: '/previews/ghibli-belgium.jpg'
  },
  {
    id: 'ghibli-uk',
    name: 'Studio Ghibli Grande-Bretagne',
    emoji: '🎨🇬🇧',
    preview: '/previews/ghibli-uk.jpg'
  },
  {
    id: 'ghibli-germany',
    name: 'Studio Ghibli Allemagne',
    emoji: '🎨🇩🇪',
    preview: '/previews/ghibli-germany.jpg'
  },
  {
    id: 'ghibli-france',
    name: 'Studio Ghibli France',
    emoji: '🎨🇫🇷',
    preview: '/previews/ghibli-france.jpg'
  },
  {
    id: 'ghibli-conflans',
    name: 'Studio Ghibli Conflans',
    emoji: '🎨🏘️',
    preview: '/previews/ghibli-conflans.jpg'
  },
  {
    id: 'pixar-pure',
    name: 'Pixar Caricature Pure',
    emoji: '🎭✨',
    preview: '/previews/pixar-pure.jpg'
  },
  {
    id: 'ghibli-pure',
    name: 'Studio Ghibli Pure',
    emoji: '🎨✨',
    preview: '/previews/ghibli-pure.jpg'
  },
  {
    id: 'disney-inspired',
    name: 'Classic Animation Style',
    emoji: '🏰✨',
    preview: '/previews/disney-inspired.jpg'
  },
  {
    id: 'disney-belgium',
    name: 'Classic Animation Belgique',
    emoji: '🏰🇧🇪',
    preview: '/previews/disney-belgium.jpg'
  },
  {
    id: 'disney-uk',
    name: 'Classic Animation Grande-Bretagne',
    emoji: '🏰🇬🇧',
    preview: '/previews/disney-uk.jpg'
  },
  {
    id: 'disney-germany',
    name: 'Classic Animation Allemagne',
    emoji: '🏰🇩🇪',
    preview: '/previews/disney-germany.jpg'
  },
  {
    id: 'disney-france',
    name: 'Classic Animation France',
    emoji: '🏰🇫🇷',
    preview: '/previews/disney-france.jpg'
  },
  {
    id: 'disney-conflans',
    name: 'Classic Animation Conflans',
    emoji: '🏰🏘️',
    preview: '/previews/disney-conflans.jpg'
  },
  {
    id: 'street-caricature',
    name: 'Caricature de Rue',
    emoji: '🎨✏️',
    preview: '/previews/street-caricature.jpg'
  },
  {
    id: 'street-caricature-belgium',
    name: 'Caricature Rue Belgique',
    emoji: '🎨🇧🇪',
    preview: '/previews/street-caricature-belgium.jpg'
  },
  {
    id: 'street-caricature-uk',
    name: 'Caricature Rue Grande-Bretagne',
    emoji: '🎨🇬🇧',
    preview: '/previews/street-caricature-uk.jpg'
  },
  {
    id: 'street-caricature-germany',
    name: 'Caricature Rue Allemagne',
    emoji: '🎨🇩🇪',
    preview: '/previews/street-caricature-germany.jpg'
  },
  {
    id: 'street-caricature-france',
    name: 'Caricature Rue France',
    emoji: '🎨🇫🇷',
    preview: '/previews/street-caricature-france.jpg'
  },
  {
    id: 'street-caricature-conflans',
    name: 'Caricature Rue Conflans',
    emoji: '🎨🏘️',
    preview: '/previews/street-caricature-conflans.jpg'
  },
  {
    id: 'dreamworks-inspired',
    name: 'DreamWorks 3D Style',
    emoji: '🎬✨',
    preview: '/previews/dreamworks-inspired.jpg'
  },
  {
    id: 'dreamworks-belgium',
    name: 'DreamWorks Belgique',
    emoji: '🎬🇧🇪',
    preview: '/previews/dreamworks-belgium.jpg'
  },
  {
    id: 'dreamworks-uk',
    name: 'DreamWorks Grande-Bretagne',
    emoji: '🎬🇬🇧',
    preview: '/previews/dreamworks-uk.jpg'
  },
  {
    id: 'dreamworks-germany',
    name: 'DreamWorks Allemagne',
    emoji: '🎬🇩🇪',
    preview: '/previews/dreamworks-germany.jpg'
  },
  {
    id: 'dreamworks-france',
    name: 'DreamWorks France',
    emoji: '🎬🇫🇷',
    preview: '/previews/dreamworks-france.jpg'
  },
  {
    id: 'dreamworks-conflans',
    name: 'DreamWorks Conflans',
    emoji: '🎬🏘️',
    preview: '/previews/dreamworks-conflans.jpg'
  },
  {
    id: 'pixar-pure-original',
    name: 'Pixar Fond Original',
    emoji: '🎭📷',
    preview: '/previews/pixar-pure-original.jpg'
  },
  {
    id: 'pixar-pure-transformed',
    name: 'Pixar Monde Entier',
    emoji: '🎭🌍',
    preview: '/previews/pixar-pure-transformed.jpg'
  },
  {
    id: 'ghibli-pure-original',
    name: 'Ghibli Fond Original',
    emoji: '🎨📷',
    preview: '/previews/ghibli-pure-original.jpg'
  },
  {
    id: 'ghibli-pure-transformed',
    name: 'Ghibli Monde Entier',
    emoji: '🎨🌍',
    preview: '/previews/ghibli-pure-transformed.jpg'
  },
  {
    id: 'disney-pure-original',
    name: 'Disney Fond Original',
    emoji: '🏰📷',
    preview: '/previews/disney-pure-original.jpg'
  },
  {
    id: 'disney-pure-transformed',
    name: 'Disney Monde Entier',
    emoji: '🏰🌍',
    preview: '/previews/disney-pure-transformed.jpg'
  },
  {
    id: 'caricature-pure-transformed',
    name: 'Caricature Monde Entier',
    emoji: '🎨✏️🌍',
    preview: '/previews/caricature-pure-transformed.jpg'
  },
  {
    id: 'dreamworks-pure-original',
    name: 'DreamWorks Fond Original',
    emoji: '🎬📷',
    preview: '/previews/dreamworks-pure-original.jpg'
  },
  {
    id: 'aura-glow-pure-original',
    name: 'Aura Lumineuse Fond Original',
    emoji: '✨📷',
    preview: '/previews/aura-glow-pure-original.jpg'
  },
  {
    id: 'aura-glow-dreamworks-transformed',
    name: 'Aura DreamWorks Monde Entier',
    emoji: '✨🎬🌍',
    preview: '/previews/aura-glow-dreamworks-transformed.jpg'
  },
  {
    id: 'aura-glow-pixar-transformed',
    name: 'Aura Pixar Monde Entier',
    emoji: '✨🎭🌍',
    preview: '/previews/aura-glow-pixar-transformed.jpg'
  },
  {
    id: 'captain-future-transformed',
    name: 'Capitaine Flam Monde Entier',
    emoji: '🚀👨‍🚀🌍',
    preview: '/previews/captain-future-transformed.jpg'
  },
  {
    id: 'captain-future-original',
    name: 'Capitaine Flam Fond Original',
    emoji: '🚀👨‍🚀📷',
    preview: '/previews/captain-future-original.jpg'
  },
  {
    id: 'cites-or-transformed',
    name: 'Cités d\'Or Monde Entier',
    emoji: '🏛️✨🌍',
    preview: '/previews/cites-or-transformed.jpg'
  },
  {
    id: 'frozen-transformed',
    name: 'Reine des Neiges Monde Entier',
    emoji: '❄️👑🌍',
    preview: '/previews/frozen-transformed.jpg'
  },
  {
    id: 'kpop-pure-original',
    name: 'K-pop Demon Hunter Fond Original',
    emoji: '👹📷',
    preview: '/previews/kpop-pure-original.jpg'
  },
  {
    id: 'kpop-pure-transformed',
    name: 'K-pop Demon Hunter Monde Entier',
    emoji: '👹🌍',
    preview: '/previews/kpop-pure-transformed.jpg'
  }
])

// Filtrage des fonds par onglet
const filteredBackgrounds = computed(() => {
  switch (activeTab.value) {
    case 'geographic':
      // Fonds géographiques (pays et villes)
      return backgrounds.value.filter(bg =>
        bg.id.includes('belgium') ||
        bg.id.includes('uk') ||
        bg.id.includes('germany') ||
        bg.id.includes('france') ||
        bg.id.includes('conflans') ||
        bg.id.includes('beach') ||
        bg.id.includes('brussels') ||
        bg.id.includes('chimay') ||
        bg.id.includes('paris')
      )
    case 'transformed':
      // Fonds "Monde Entier" (transformation complète)
      return backgrounds.value.filter(bg =>
        bg.id.includes('pure-transformed') ||
        bg.id.includes('monde-entier') ||
        bg.name.includes('Monde Entier') ||
        bg.id.includes('aura-glow-dreamworks-transformed') ||
        bg.id.includes('aura-glow-pixar-transformed') ||
        bg.id.includes('captain-future-transformed') ||
        bg.id.includes('kpop-pure-transformed')
      )
    case 'original':
      // Fonds "Monde Original" (fond original conservé)
      return backgrounds.value.filter(bg =>
        bg.id.includes('pure-original') ||
        bg.id.includes('fond-original') ||
        bg.name.includes('Fond Original') ||
        bg.id.includes('captain-future-original') ||
        bg.id.includes('kpop-pure-original')
      )
    default:
      return backgrounds.value
  }
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

const selectBackground = (background) => {
  // Si le fond n'est pas dans l'onglet actuel, changer d'onglet d'abord
  if (!filteredBackgrounds.value.some(bg => bg.id === background.id)) {
    // Trouver dans quel onglet se trouve ce fond
    if (background.id.includes('belgium') || background.id.includes('uk') || background.id.includes('germany') || 
        background.id.includes('france') || background.id.includes('conflans') || background.id.includes('beach') || 
        background.id.includes('brussels') || background.id.includes('chimay') || background.id.includes('paris')) {
      activeTab.value = 'geographic'
    } else if (background.id.includes('pure-transformed') || background.id.includes('monde-entier') || 
               background.name.includes('Monde Entier') || background.id.includes('aura-glow-dreamworks-transformed') || 
               background.id.includes('aura-glow-pixar-transformed') || background.id.includes('captain-future-transformed') || 
               background.id.includes('kpop-pure-transformed')) {
      activeTab.value = 'transformed'
    } else if (background.id.includes('pure-original') || background.id.includes('fond-original') || 
               background.name.includes('Fond Original') || background.id.includes('captain-future-original') || 
               background.id.includes('kpop-pure-original')) {
      activeTab.value = 'original'
    }
    
    // Attendre un tick pour que l'onglet se mette à jour, puis sélectionner
    nextTick(() => {
      selectedBackground.value = background
      console.log('🎬 Fond sélectionné:', background.name)
      // Fermer la modal après sélection
      showBackgroundSelector.value = false
    })
  } else {
    // Le fond est dans l'onglet actuel, le sélectionner directement
    selectedBackground.value = background
    console.log('🎬 Fond sélectionné:', background.name)
    // Fermer la modal après sélection
    showBackgroundSelector.value = false
  }
}

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
