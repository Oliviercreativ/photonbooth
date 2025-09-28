<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Votre Photo Photobooth</h1>
            <p class="text-gray-600">Made in Conflans</p>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="sharePhoto"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Icon name="heroicons:share" class="w-4 h-4" />
              <span>Partager</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Message de chargement -->
      <div v-if="isLoading" class="text-center py-12">
        <Icon name="heroicons:arrow-path" class="w-12 h-12 mx-auto animate-spin text-gray-400" />
        <p class="mt-4 text-gray-500">Chargement de votre photo...</p>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="text-center py-12">
        <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 mx-auto text-red-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Photo non trouvée</h3>
        <p class="mt-2 text-gray-500">{{ error }}</p>
        <div class="mt-6">
          <button
            @click="goHome"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Icon name="heroicons:home" class="w-4 h-4 mr-2" />
            Retour à l'accueil
          </button>
        </div>
      </div>

      <!-- Photo -->
      <div v-else-if="photo" class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ userFullName || 'Votre photo' }}
          </h2>
          <p class="text-sm text-gray-500">
            Créée le {{ formatDate(photo.created_at) }}
          </p>
        </div>

        <div class="p-6">
          <div class="relative">
            <img
              :src="photo.url"
              :alt="userFullName || 'Photo photobooth'"
              class="w-full h-auto rounded-lg shadow-lg"
              @error="handleImageError"
            />
            
            <!-- Overlay avec actions -->
            <div class="absolute top-4 right-4 flex space-x-2">
              <button
                @click="downloadPhoto"
                class="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors"
                title="Télécharger"
              >
                <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
              </button>
              <button
                @click="sharePhoto"
                class="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-colors"
                title="Partager"
              >
                <Icon name="heroicons:share" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Informations utilisateur -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Informations</h3>
            <div class="text-sm text-gray-600 space-y-1">
              <p><strong>Email :</strong> {{ userEmail }}</p>
              <p v-if="userFullName"><strong>Nom :</strong> {{ userFullName }}</p>
              <p><strong>ID Photo :</strong> {{ photo.id }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex justify-center space-x-4">
            <button
              @click="sharePhoto"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Icon name="heroicons:share" class="w-5 h-5 mr-2" />
              Partager cette photo
            </button>
            
            <button
              @click="downloadPhoto"
              class="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Icon name="heroicons:arrow-down-tray" class="w-5 h-5 mr-2" />
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const photoId = route.params.id
const photo = ref(null)
const isLoading = ref(true)
const error = ref('')
const userEmail = ref('')
const userFullName = ref('')

// Récupérer les paramètres de l'URL
const email = route.query.email
const name = route.query.name

onMounted(async () => {
  try {
    // Vérifier que les paramètres requis sont présents
    if (!email) {
      error.value = 'Email manquant dans l\'URL'
      isLoading.value = false
      return
    }

    userEmail.value = email
    userFullName.value = name || ''

    // Récupérer la photo
    const response = await $fetch(`/api/photo/${photoId}`, {
      query: { email }
    })

    if (response.success && response.photo) {
      photo.value = response.photo
    } else {
      error.value = response.message || 'Photo non trouvée'
    }
  } catch (err) {
    console.error('Erreur chargement photo:', err)
    error.value = 'Erreur lors du chargement de la photo'
  } finally {
    isLoading.value = false
  }
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const downloadPhoto = async () => {
  if (!photo.value?.url) return

  try {
    const response = await fetch(photo.value.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `photobooth-${photo.value.id}.jpg`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Erreur téléchargement:', error)
    alert('Erreur lors du téléchargement')
  }
}

const sharePhoto = async () => {
  if (!photo.value?.url) return

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Ma photo photobooth - Made in Conflans',
        text: 'Découvrez ma photo créée avec le photobooth !',
        url: window.location.href
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erreur partage:', error)
      }
    }
  } else {
    // Fallback : copier le lien
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papiers !')
    } catch (error) {
      console.error('Erreur copie:', error)
      alert('Impossible de copier le lien')
    }
  }
}

const handleImageError = () => {
  error.value = 'Erreur lors du chargement de l\'image'
}

const goHome = () => {
  navigateTo('/')
}

definePageMeta({
  layout: false,
  title: 'Ma Photo - Made in Conflans'
})
</script>
