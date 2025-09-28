<template>
  <div class="min-h-screen bg-gray-900 p-4 pb-20">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-white">Partager votre photo</h1>
          <p class="text-white/60 mt-1">Choisissez le format adapté à votre réseau social</p>
        </div>
        <button
          @click="$router.back()"
          class="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <Icon name="heroicons:arrow-left" class="w-5 h-5" />
          <span class="hidden sm:inline">Retour</span>
        </button>
      </div>

      <!-- État de chargement -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="text-white/60 mt-4">Chargement de la photo...</p>
      </div>

      <!-- État d'erreur -->
      <div v-else-if="error" class="text-center py-12">
        <div class="text-6xl mb-4">😞</div>
        <p class="text-white/70 text-lg mb-2">{{ error }}</p>
        <button
          @click="$router.back()"
          class="text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Retour à la galerie
        </button>
      </div>

      <!-- Contenu principal -->
      <div v-else-if="photo" class="space-y-8">
        <!-- Photo originale -->
        <div class="bg-white rounded-xl p-6 shadow-xl">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Icon name="heroicons:photo" class="w-5 h-5" />
            Photo originale
          </h2>
          <div class="relative">
            <img
              :src="photo.photo_url"
              :alt="photo.background_name"
              class="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
            <div class="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
              {{ photo.background_name }}
            </div>
          </div>
        </div>

        <!-- Formats de partage -->
        <div class="space-y-6">
          <h2 class="text-xl font-bold text-white">Formats de partage</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Stories Instagram & Facebook -->
            <div class="bg-white rounded-xl p-6 shadow-xl">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Icon name="heroicons:device-phone-mobile" class="w-5 h-5" />
                Stories (9:16)
              </h3>
              <p class="text-gray-600 text-sm mb-4">
                Format vertical pour les stories Instagram et Facebook
              </p>
              
              <div class="relative mb-4">
                <canvas
                  ref="storiesCanvas"
                  width="1080"
                  height="1920"
                  class="w-32 h-56 mx-auto border border-gray-200 rounded-lg"
                ></canvas>
                <div class="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
                  Stories
                </div>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="generateFormat('stories')"
                  class="flex-1 bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm"
                >
                  <Icon name="heroicons:sparkles" class="w-4 h-4 inline mr-1" />
                  Générer
                </button>
                <button
                  @click="downloadFormat('stories')"
                  class="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  :disabled="!generatedFormats.stories"
                >
                  <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 inline mr-1" />
                  Télécharger
                </button>
              </div>
            </div>

            <!-- Post Instagram -->
            <div class="bg-white rounded-xl p-6 shadow-xl">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Icon name="heroicons:squares-2x2" class="w-5 h-5" />
                Post Instagram (1:1)
              </h3>
              <p class="text-gray-600 text-sm mb-4">
                Format carré pour les posts Instagram
              </p>
              
              <div class="relative mb-4">
                <canvas
                  ref="instagramCanvas"
                  width="1080"
                  height="1080"
                  class="w-32 h-32 mx-auto border border-gray-200 rounded-lg"
                ></canvas>
                <div class="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
                  Instagram
                </div>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="generateFormat('instagram')"
                  class="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors text-sm"
                >
                  <Icon name="heroicons:sparkles" class="w-4 h-4 inline mr-1" />
                  Générer
                </button>
                <button
                  @click="downloadFormat('instagram')"
                  class="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  :disabled="!generatedFormats.instagram"
                >
                  <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 inline mr-1" />
                  Télécharger
                </button>
              </div>
            </div>

            <!-- Post Facebook -->
            <div class="bg-white rounded-xl p-6 shadow-xl">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Icon name="heroicons:rectangle-group" class="w-5 h-5" />
                Post Facebook (1.91:1)
              </h3>
              <p class="text-gray-600 text-sm mb-4">
                Format paysage pour les posts Facebook
              </p>
              
              <div class="relative mb-4">
                <canvas
                  ref="facebookCanvas"
                  width="1200"
                  height="630"
                  class="w-40 h-21 mx-auto border border-gray-200 rounded-lg"
                ></canvas>
                <div class="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
                  Facebook
                </div>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="generateFormat('facebook')"
                  class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  <Icon name="heroicons:sparkles" class="w-4 h-4 inline mr-1" />
                  Générer
                </button>
                <button
                  @click="downloadFormat('facebook')"
                  class="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  :disabled="!generatedFormats.facebook"
                >
                  <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 inline mr-1" />
                  Télécharger
                </button>
              </div>
            </div>

            <!-- Post LinkedIn -->
            <div class="bg-white rounded-xl p-6 shadow-xl">
              <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Icon name="heroicons:briefcase" class="w-5 h-5" />
                Post LinkedIn (1.91:1)
              </h3>
              <p class="text-gray-600 text-sm mb-4">
                Format paysage pour les posts LinkedIn
              </p>
              
              <div class="relative mb-4">
                <canvas
                  ref="linkedinCanvas"
                  width="1200"
                  height="630"
                  class="w-40 h-21 mx-auto border border-gray-200 rounded-lg"
                ></canvas>
                <div class="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
                  LinkedIn
                </div>
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="generateFormat('linkedin')"
                  class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Icon name="heroicons:sparkles" class="w-4 h-4 inline mr-1" />
                  Générer
                </button>
                <button
                  @click="downloadFormat('linkedin')"
                  class="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  :disabled="!generatedFormats.linkedin"
                >
                  <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 inline mr-1" />
                  Télécharger
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions globales -->
        <div class="bg-white rounded-xl p-6 shadow-xl">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h3>
          <div class="flex flex-wrap gap-3">
            <button
              @click="generateAllFormats"
              class="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors"
            >
              <Icon name="heroicons:sparkles" class="w-5 h-5" />
              Générer tous les formats
            </button>
            <button
              @click="downloadAllFormats"
              class="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              :disabled="!hasGeneratedFormats"
            >
              <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
              Télécharger tout
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
const isGenerating = ref(false)

// Canvas refs
const storiesCanvas = ref(null)
const instagramCanvas = ref(null)
const facebookCanvas = ref(null)
const linkedinCanvas = ref(null)

// Formats générés
const generatedFormats = ref({
  stories: null,
  instagram: null,
  facebook: null,
  linkedin: null
})

// Toast
const toast = ref({
  show: false,
  message: ''
})

// Récupérer l'ID de la photo depuis l'URL
const route = useRoute()
const photoId = route.params.id

// Computed
const hasGeneratedFormats = computed(() => {
  return Object.values(generatedFormats.value).some(format => format !== null)
})

// Fonctions
const loadPhoto = async () => {
  try {
    isLoading.value = true
    error.value = null
    console.log('📸 Chargement de la photo pour partage:', photoId)

    const { data: user } = await useSupabaseUser()
    const { data: session } = await useSupabaseSession()

    if (!user.value || !session.value) {
      console.log('❌ Utilisateur non authentifié')
      await navigateTo('/auth')
      return
    }

    const response = await $fetch(`/api/photos/${photoId}`, {
      headers: {
        'Authorization': `Bearer ${session.value.access_token}`
      }
    })

    if (response.success) {
      photo.value = response.photo
      console.log('✅ Photo chargée pour partage:', photo.value.id)
      
      // Générer automatiquement tous les formats
      await nextTick()
      await generateAllFormats()
    }

  } catch (error) {
    console.error('❌ Erreur chargement photo:', error)
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

const generateFormat = async (format) => {
  if (!photo.value) return

  try {
    isGenerating.value = true
    showToast(`Génération du format ${format}...`)

    const canvas = getCanvasByFormat(format)
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // Nettoyer le canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Calculer les dimensions pour centrer et redimensionner l'image
      const canvasAspect = canvas.width / canvas.height
      const imgAspect = img.width / img.height
      
      let drawWidth, drawHeight, offsetX, offsetY
      
      if (imgAspect > canvasAspect) {
        // L'image est plus large que le canvas
        drawHeight = canvas.height
        drawWidth = drawHeight * imgAspect
        offsetX = (canvas.width - drawWidth) / 2
        offsetY = 0
      } else {
        // L'image est plus haute que le canvas
        drawWidth = canvas.width
        drawHeight = drawWidth / imgAspect
        offsetX = 0
        offsetY = (canvas.height - drawHeight) / 2
      }
      
      // Dessiner l'image
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
      
      // Ajouter un watermark subtil
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, canvas.height - 40, canvas.width, 40)
      ctx.fillStyle = 'white'
      ctx.font = '16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Made in Conflans', canvas.width / 2, canvas.height - 15)
      
      // Sauvegarder le format généré
      generatedFormats.value[format] = canvas.toDataURL('image/jpeg', 0.9)
      
      showToast(`Format ${format} généré !`)
    }
    
    img.src = photo.value.photo_url

  } catch (error) {
    console.error('❌ Erreur génération format:', error)
    showToast(`Erreur lors de la génération du format ${format}`)
  } finally {
    isGenerating.value = false
  }
}

const generateAllFormats = async () => {
  const formats = ['stories', 'instagram', 'facebook', 'linkedin']
  for (const format of formats) {
    await generateFormat(format)
    await new Promise(resolve => setTimeout(resolve, 500)) // Délai entre chaque génération
  }
}

const getCanvasByFormat = (format) => {
  switch (format) {
    case 'stories': return storiesCanvas.value
    case 'instagram': return instagramCanvas.value
    case 'facebook': return facebookCanvas.value
    case 'linkedin': return linkedinCanvas.value
    default: return null
  }
}

const downloadFormat = (format) => {
  const dataUrl = generatedFormats.value[format]
  if (!dataUrl) return

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `photobooth-${format}-${photo.value.background_name.replace(/\s+/g, '-')}-${photo.value.id}.jpg`
  link.click()
  
  showToast(`Format ${format} téléchargé !`)
}

const downloadAllFormats = () => {
  Object.keys(generatedFormats.value).forEach(format => {
    if (generatedFormats.value[format]) {
      setTimeout(() => {
        downloadFormat(format)
      }, 500) // Délai entre chaque téléchargement
    }
  })
  
  showToast('Tous les formats téléchargés !')
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
  loadPhoto()
})
</script>

<style scoped>
/* Styles pour les canvas */
canvas {
  max-width: 100%;
  height: auto;
}

/* Animation pour les boutons */
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Gradient pour les boutons */
.bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}
</style>
