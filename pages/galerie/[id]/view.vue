<template>
  <div class="min-h-screen">
    <!-- Header fixe -->
    <div class="sticky top-0 z-50 bg-white shadow-sm">
      <div class="flex justify-between items-center p-4">
        <button
          @click="$router.push('/galerie')"
          class="flex items-center gap-2 text-gray-800 hover:text-gray-800/70 transition-colors"
        >
          <Icon name="heroicons:arrow-left" class="w-6 h-6" />
          <span class="hidden sm:inline">Retour</span>
        </button>

        <div class="text-gray-800 text-sm font-medium">
          {{ photo?.background_name || `Photo ${photoId}` }}
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="downloadPhotoWithWatermark"
            class="p-2 text-gray-800 transition-colors"
          >
            <Icon name="heroicons:arrow-down-tray" class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="">
      <!-- État de chargement -->
      <div v-if="isLoading" class="flex items-center justify-center">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p class="text-gray-800/60 mt-4">Chargement de la photo...</p>
        </div>
      </div>

      <!-- État d'erreur -->
      <div v-else-if="error" class="flex items-center justify-center">
        <div class="text-center">
          <div class="text-6xl mb-4">😞</div>
          <p class="text-gray-800/70 text-lg mb-2">{{ error }}</p>
          <button
            @click="$router.back()"
            class="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Retour à la galerie
          </button>
        </div>
      </div>

      <!-- Photo -->
      <div v-else-if="photo" class="flex items-start justify-center min-h-screen p-4">
        <div class="max-w-4xl w-full">
          <!-- Image principale -->
          <div class="relative bg-white rounded-xl overflow-hidden">
            <img
              :src="photo.photo_url"
              :alt="photo.background_name"
              class="w-full h-auto max-h-[80vh] object-contain"
              @load="imageLoaded = true"
            />
            
            <!-- Overlay d'informations -->
            <div class="text-gray-800 p-3 rounded-lg backdrop-blur">
              <div class="flex items-center gap-2 mb-1">
                <Icon name="heroicons:map-pin" class="w-4 h-4" />
                <span class="font-medium">{{ photo.background_name }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-800/70">
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
                <p class="text-gray-800/60 mt-2">Chargement...</p>
              </div>
            </div>
          </div>

          <!-- Actions en bas -->
          <div class="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              @click="sharePhoto"
              class="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              <Icon name="heroicons:share" class="w-5 h-5" />
              Partager
            </button>
            <button
              @click="downloadPhotoWithWatermark"
              class="flex items-center justify-center gap-2 bg-[#33cccc] text-white px-6 py-3 rounded-lg"
            >
              <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
              Télécharger
            </button>
          </div>

          <!-- Message jeu concours -->
          <ContestPromo />
        </div>
      </div>
    </div>

    <!-- Toast de notification -->
    <div
      v-if="toast.show"
      class="fixed bottom-4 right-4 bg-green-600 text-gray-800 px-6 py-3 rounded-lg shadow-lg z-40"
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

const sharePhoto = async () => {
  if (!photo.value) return

  try {
    // Utiliser l'API Web Share native
    if (navigator.share) {
      await navigator.share({
        title: 'Ma photo Made in Conflans',
        text: `Photo - ${photo.value.background_name}`,
        url: window.location.href
      })
      showToast('Photo partagée !')
    } else {
      // Fallback : copier le lien
      await navigator.clipboard.writeText(window.location.href)
      showToast('Lien copié dans le presse-papier !')
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('❌ Erreur partage:', error)
      showToast('Erreur lors du partage')
    }
  }
}

const downloadPhotoWithWatermark = async () => {
  if (!photo.value) return

  try {
    showToast('Génération du watermark...')

    // Créer un canvas temporaire
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      console.log('✅ Image chargée:', img.width, 'x', img.height)

      // Définir la taille du canvas
      canvas.width = img.width
      canvas.height = img.height

      // Dessiner l'image
      ctx.drawImage(img, 0, 0)

      // Ajouter la barre de watermark
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50)

      // Ajouter le texte
      const text = 'Made in Conflans - Oktoberfest 2025'
      ctx.fillStyle = 'white'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, canvas.width / 2, canvas.height - 25)

      // Télécharger
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('❌ Blob null')
          showToast('Erreur lors de la génération')
          return
        }

        console.log('✅ Blob créé:', blob.size, 'bytes')
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `photobooth-${photo.value.background_name.replace(/\s+/g, '-')}-${photo.value.id}.jpg`
        document.body.appendChild(link)
        console.log('🔗 Clic sur le lien de téléchargement')
        link.click()
        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        showToast('Photo téléchargée !')
      }, 'image/jpeg', 0.95)
    }

    img.onerror = () => {
      console.error('❌ Erreur chargement image pour watermark')
      showToast('Erreur lors du chargement de l\'image')
    }

    img.src = photo.value.photo_url
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
