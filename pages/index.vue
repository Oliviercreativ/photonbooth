<template>
  <div class="min-h-screen bg-[#f7f5f2] pb-24">
    <!-- Sélection de fonds -->
    <BackgroundSelector 
      v-if="showBackgroundSelector" 
      @select="selectBackground"
      @close="showBackgroundSelector = false"
    />

    <!-- Caméra après sélection du fond -->
    <div v-else class="h-screen max-w-6xl mx-auto">
      <!-- Message limite atteinte -->
      <div v-if="isPhotoLimitReached" class="p-8 flex flex-col items-center justify-center">
        <div class="text-6xl mb-4"><Icon name="heroicons:photo" /></div>
        <h2 class="text-2xl font-bold text-[#33cccc] mb-2 text-center">Super vous avez utilisé vos photo gratuites !</h2>
        <p class="text-gray-700 mb-4  text-center">Vous souhaitez participer au jeu concous pour gagner un bon d'achat de 20€ à utiliser dans un commerce partenaire de notre appli de fidélité</p>

        <div class="bg-white/80 backdrop-blur rounded-lg p-4 mb-6">
          <p class="text-gray-800 font-semibold mb-6 flex items-center justify-center gap-2">
            <Icon name="heroicons:light-bulb" class="w-5 h-5" />
            Vous souhaitez plus de photos ?
          </p>
          <div class="grid grid-cols-2 gap-3 mb-2">
            <div class="bg-[#33cccc]/10 border border-[#33cccc] rounded-lg p-3 flex flex-col items-center">
              <span class="text-lg font-bold text-[#33cccc]">5 photos</span>
              <span class="text-gray-700 font-semibold mt-1">3€</span>
            </div>
            <div class="bg-[#33cccc]/10 border border-[#33cccc] rounded-lg p-3 flex flex-col items-center">
              <span class="text-lg font-bold text-[#33cccc]">10 photos</span>
              <span class="text-gray-700 font-semibold mt-1">5</span>
            </div>
            <div class="bg-[#33cccc]/10 border border-[#33cccc] rounded-lg p-3 flex flex-col items-center">
              <span class="text-lg font-bold text-[#33cccc]">15 photos</span>
              <span class="text-gray-700 font-semibold mt-1">7,50€</span>
            </div>
            <div class="bg-[#33cccc]/10 border border-[#33cccc] rounded-lg p-3 flex flex-col items-center">
              <span class="text-lg font-bold text-[#33cccc]">20 photos</span>
              <span class="text-gray-700 font-semibold mt-1">10€</span>
            </div>
          </div>
          <p class="text-gray-600 text-sm text-center pt-2">Choisissez le pack qui vous convient et venez payer sur le stand de made in Conflans & l'atelier de la  fête</p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <NuxtLink to="/galerie" class="inline-block bg-[#33cccc] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
            <Icon name="heroicons:folder" class="w-5 h-5" />
            Voir ma galerie
          </NuxtLink>
        </div>
        <ContestPromo />
      </div>

      <!-- Caméra normale -->
      <div v-else class="bg-white/10 backdrop-blur-sm rounded-xl h-full">
        <Camera
          ref="cameraRef"
          :initialBackground="selectedBackground"
          :isPhotoLimitReached="isPhotoLimitReached"
          @photo-captured="handlePhotoCaptured"
          @show-gallery="showGallery = true"
        />
      </div>
    </div>

    <!-- Galerie plein écran -->
    <div v-if="showGallery" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      @click="showGallery = false">
      <div class="bg-gray-900 rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto m-4" @click.stop>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-gray-800">
            Galerie de photos ({{ photos.length }})
          </h3>
          <button @click="showGallery = false" class="text-gray-800 text-2xl hover:text-red-400 transition-colors">
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
              <p class="text-gray-800 text-xs">{{ photo.background }}</p>
              <p class="text-gray-800/60 text-xs">{{ photo.timestamp }}</p>
            </div>

            <!-- Actions -->
            <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div class="flex gap-1">
                <button @click="downloadPhoto(photo)"
                  class="bg-blue-500 text-gray-800 w-8 h-8 rounded-full text-xs flex items-center justify-center">

                </button>
                <button @click="removePhoto(photos.indexOf(photo))"
                  class="bg-red-500 text-gray-800 w-8 h-8 rounded-full text-xs flex items-center justify-center">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notification -->
    <div v-if="toast.show" class="fixed bottom-20 right-4 bg-green-600 text-gray-800 px-6 py-3 rounded-lg shadow-lg z-40">
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
const showBackgroundSelector = ref(true)
const userPhotosCount = ref(0)
const isLoadingPhotosCount = ref(true)
const userCredits = ref(0)
const photoLimit = ref(5) // Valeur par défaut

const toast = ref({
  show: false,
  message: ''
})

// Computed pour vérifier si la limite est atteinte
const isPhotoLimitReached = computed(() => {
  return userPhotosCount.value >= photoLimit.value
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
  selectedBackground.value = background
  console.log('🎬 Fond sélectionné:', background.name)
  // Fermer la modal après sélection
  showBackgroundSelector.value = false
}

const handlePhotoCaptured = (photoData) => {
  photos.value.unshift(photoData)
  showToast(
    `Photo ${photoData.processed ? 'traitée' : 'capturée'} !`
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

// Charger le nombre de photos de l'utilisateur
const loadUserPhotosCount = async () => {
  try {
    isLoadingPhotosCount.value = true
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      // Charger la limite depuis photobooth_sessions
      try {
        const supabase = useSupabaseClient()
        const { data: sessionData, error: sessionError } = await supabase
          .from('photobooth_sessions')
          .select('photos_count')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (!sessionError && sessionData) {
          photoLimit.value = sessionData.photos_count || 5
          console.log('📊 Limite photos depuis session:', photoLimit.value)
        }
      } catch (error) {
        console.log('❌ Erreur chargement limite:', error)
        photoLimit.value = 5
      }

      // Charger les crédits de l'utilisateur (pour affichage du badge si besoin)
      try {
        const creditsResponse = await $fetch('/api/user/credits')
        if (creditsResponse.success) {
          userCredits.value = creditsResponse.credits || 0
          console.log('💳 Crédits utilisateur:', userCredits.value)
        }
      } catch (error) {
        console.log('❌ Erreur chargement crédits:', error)
        userCredits.value = 0
      }

      const response = await $fetch('/api/photos', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        query: {
          page: 1,
          limit: 1
        }
      })

      if (response.success && response.pagination) {
        userPhotosCount.value = response.pagination.total
        console.log('📊 Nombre de photos utilisateur:', userPhotosCount.value, '/ Limite:', photoLimit.value)
      }
    }
  } catch (error) {
    console.error('❌ Erreur chargement compteur photos:', error)
  } finally {
    isLoadingPhotosCount.value = false
  }
}

// Nettoyage au démontage
onUnmounted(() => {
  photos.value.forEach((photo) => {
    if (photo.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url)
    }
  })
})

// Charger le compteur au montage
onMounted(() => {
  loadUserPhotosCount()
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
