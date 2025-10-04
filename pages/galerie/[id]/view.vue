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
          <div class="mt-6 bg-white rounded-xl p-6 text-center">
            <Icon name="heroicons:trophy" class="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <h3 class="text-lg font-bold text-gray-800 mb-2">🎉 Participe au jeu concours !</h3>
            <p class="text-gray-700 leading-relaxed mb-4">
              Follow et tag <strong class="text-[#33cccc]">@madeinconflans</strong> dans ta story pour gagner un bon d'achat dans une boutique partenaire de la fidélité.
            </p>
            <div class="flex flex-col gap-3 justify-center mb-4">
              <a
                href="https://www.instagram.com/madeinconflans"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 bg-pink-500 text-white px-5 py-2 rounded-lg hover:bg-pink-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <a
                href="https://www.facebook.com/madeinconflans"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
            </div>
            <p class="text-sm text-gray-600 flex justify-center items-center gap-2">
              <Icon name="heroicons:calendar" class="w-4 h-4" />
              Tirage au sort le <strong>8 octobre 2025</strong>
            </p>
          </div>
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
