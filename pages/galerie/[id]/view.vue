<template>
  <div class="min-h-screen bg-black">
    <!-- Header fixe -->
    <div class="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <div class="flex justify-between items-center p-4">
        <button
          @click="$router.push('/galerie')"
          class="flex items-center gap-2 text-white hover:text-white/70 transition-colors"
        >
          <Icon name="heroicons:arrow-left" class="w-6 h-6" />
          <span class="hidden sm:inline">Retour</span>
        </button>
        
        <div class="text-white text-sm">
          {{ photo?.background_name || `Photo ${photoId}` }}
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="sharePhoto"
            class="p-2 text-white hover:text-white/70 transition-colors"
          >
            <Icon name="heroicons:share" class="w-6 h-6" />
          </button>
          <button
            @click="downloadPhoto"
            class="p-2 text-white hover:text-white/70 transition-colors"
          >
            <Icon name="heroicons:arrow-down-tray" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="pt-16">
      <!-- État de chargement -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p class="text-white/60 mt-4">Chargement de la photo...</p>
        </div>
      </div>

      <!-- État d'erreur -->
      <div v-else-if="error" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="text-6xl mb-4">😞</div>
          <p class="text-white/70 text-lg mb-2">{{ error }}</p>
          <button
            @click="$router.back()"
            class="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Retour à la galerie
          </button>
        </div>
      </div>

      <!-- Photo -->
      <div v-else-if="photo" class="flex items-center justify-center min-h-screen p-4">
        <div class="max-w-4xl w-full">
          <!-- Image principale -->
          <div class="relative bg-white rounded-xl overflow-hidden shadow-2xl">
            <img
              :src="photo.photo_url"
              :alt="photo.background_name"
              class="w-full h-auto max-h-[80vh] object-contain"
              @load="imageLoaded = true"
            />
            
            <!-- Overlay d'informations -->
            <div class="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-lg backdrop-blur">
              <div class="flex items-center gap-2 mb-1">
                <Icon name="heroicons:map-pin" class="w-4 h-4" />
                <span class="font-medium">{{ photo.background_name }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-white/70">
                <Icon name="heroicons:calendar" class="w-4 h-4" />
                <span>{{ formatDate(photo.created_at) }}</span>
              </div>
            </div>

            <!-- Indicateur de chargement sur l'image -->
            <div
              v-if="!imageLoaded"
              class="absolute inset-0 bg-gray-900 flex items-center justify-center"
            >
              <div class="text-center">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p class="text-white/60 mt-2">Chargement...</p>
              </div>
            </div>
          </div>

          <!-- Actions en bas -->
          <div class="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              @click="sharePhoto"
              class="flex items-center justify-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Icon name="heroicons:share" class="w-5 h-5" />
              Partager
            </button>
            <button
              @click="downloadPhoto"
              class="flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notification -->
    <div
      v-if="toast.show"
      class="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-40"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
// Meta de la page
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// État réactif
const photo = ref(null)
const isLoading = ref(true)
const error = ref(null)
const imageLoaded = ref(false)

// Toast
const toast = ref({
  show: false,
  message: ''
})

// Récupérer l'ID de la photo depuis l'URL
const route = useRoute()
const photoId = route.params.id

// Fonctions
const loadPhoto = async () => {
  try {
    isLoading.value = true
    error.value = null
    console.log('📸 Chargement de la photo:', photoId)

    // Récupérer la session actuelle (le middleware garantit qu'on est connecté)
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      console.log('❌ Session manquante - redirection vers /auth')
      await navigateTo('/auth')
      return
    }

    console.log('✅ Utilisateur authentifié, chargement de la photo...')

    const response = await $fetch(`/api/photos/${photoId}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    console.log('📊 Réponse API photo:', {
      success: response.success,
      photoId: response.photo?.id,
      photoUrl: response.photo?.photo_url ? 'Présent' : 'Manquant'
    })

    if (response.success) {
      photo.value = response.photo
      console.log('✅ Photo chargée:', photo.value.id)
      console.log('🔗 URL complète:', photo.value.photo_url)
      
      // Tester si l'image est accessible
      const img = new Image()
      img.onload = () => console.log('✅ Image accessible et chargée')
      img.onerror = (e) => console.error('❌ Erreur chargement image:', e)
      img.src = photo.value.photo_url
    }

  } catch (error) {
    console.error('❌ Erreur chargement photo:', error)
    
    // Si erreur 401, rediriger vers auth
    if (error.statusCode === 401) {
      console.log('🔐 Token expiré - redirection vers /auth')
      await navigateTo('/auth')
      return
    }
    
    if (error.statusCode === 404) {
      error.value = 'Photo non trouvée'
    } else if (error.statusCode === 401) {
      error.value = 'Accès non autorisé'
    } else {
      error.value = 'Erreur lors du chargement de la photo'
    }
  } finally {
    isLoading.value = false
  }
}

const sharePhoto = () => {
  if (photo.value) {
    navigateTo(`/galerie/${photo.value.id}/share`)
  }
}

const downloadPhoto = async () => {
  if (!photo.value) return

  try {
    showToast('Téléchargement en cours...')
    
    const link = document.createElement('a')
    link.href = photo.value.photo_url
    link.download = `photobooth-${photo.value.background_name.replace(/\s+/g, '-')}-${photo.value.id}.jpg`
    link.target = '_blank'
    link.click()
    
    showToast('Photo téléchargée !')
  } catch (error) {
    console.error('❌ Erreur téléchargement:', error)
    showToast('Erreur lors du téléchargement')
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showToast = (message) => {
  toast.value.message = message
  toast.value.show = true
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// Lifecycle
onMounted(() => {
  console.log('🔍 Page view montée, ID photo:', photoId)
  loadPhoto()
})

// Gestion des touches clavier
onMounted(() => {
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      $router.back()
    }
  }
  document.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped>
/* Styles pour l'image */
img {
  max-height: 80vh;
  width: auto;
  height: auto;
}

/* Animation pour l'overlay */
.absolute {
  transition: opacity 0.3s ease;
}
</style>
