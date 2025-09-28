<template>
  <div class="min-h-screen bg-gradient-to-br from-[#f7f5f2] to-[#e8e5e1] py-12 px-4">

    <!-- Header -->
    <div class=" backdrop-blur-sm rounded-xl p-4 mb-4">
      <div class="flex justify-between items-center flex-col">
        <div class="flex items-center space-x-2 flex-col">
          <NuxtLink to="https://madeinconflans.fr/fidelite"><img src="/logo-mic.svg" alt="Made in Conflans"
              class="w-24" /></NuxtLink>
          <div class="flex flex-col items-center justify-center">
            <h1 class="text-2xl font-bold text-gray-900">Photobooth de l'Oktoberfest 2025</h1>
            <p class="text-gray-900/70">Samedi 4 octobre 2025</p>
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
          <button @click="goHome"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            <Icon name="heroicons:home" class="w-4 h-4 mr-2" />
            Retour à l'accueil
          </button>
        </div>
      </div>

      <!-- Photo -->
      <div v-else-if="photo" class="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden">
        <!-- Header de la photo -->
        <div class="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-white/90 to-white/70">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              🎉 {{ userFullName || 'Votre photo' }} 🎉
            </h2>
            <p class="text-gray-600">
              Créée le {{ formatDate(photo.created_at) }}
            </p>
            <div
              class="mt-3 inline-flex items-center px-4 py-2 bg-[#33cccc]/10 text-[#33cccc] rounded-full text-sm font-medium">
              <Icon name="heroicons:camera" class="w-4 h-4 mr-2" />
              Photobooth Oktoberfest 2025
            </div>
          </div>
        </div>

        <!-- Contenu principal -->
        <div class="p-8">
          <!-- Photo avec fond décoratif -->
          <div class="relative max-w-4xl mx-auto">
            <!-- Fond décoratif -->
            <div
              class="absolute inset-0 bg-gradient-to-br from-[#33cccc]/20 via-transparent to-[#f7f5f2]/50 rounded-3xl transform rotate-1 scale-105">
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-tl from-white/30 via-transparent to-[#33cccc]/10 rounded-3xl transform -rotate-1 scale-105">
            </div>

            <!-- Conteneur de la photo -->
            <div class="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
              <div class="relative overflow-hidden rounded-2xl">
                <!-- Photo en background avec protection, comme dans photobooth.vue -->
                <div 
                  class="relative w-full max-w-xl h-[500px] mx-auto mb-6 rounded-lg shadow-lg overflow-hidden"
                  :style="{ 
                    backgroundImage: `url(${photo.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }"
                  @contextmenu.prevent
                  @dragstart.prevent
                  @selectstart.prevent
                >
                  <!-- Overlay de protection -->
                  <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div class="text-white text-center">
                      <p class="text-sm opacity-80">Votre photo de l'Oktoberfest</p>
                    </div>
                  </div>
                </div>

                <!-- Overlay avec actions -->
                <div class="absolute top-4 right-4 flex space-x-2">
                  <button @click="changeBgPhoto"
                    class="bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    title="Changer le fond">
                    <Icon name="heroicons:sparkles" class="w-5 h-5" />
                  </button>
                  <button @click="downloadPhoto"
                    class="bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    title="Télécharger">
                    <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
                  </button>
                  <button @click="sharePhoto"
                    class="bg-white/95 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    title="Partager">
                    <Icon name="heroicons:share" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button @click="changeBgPhoto"
              :disabled="isChangingBg"
              class="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-[#33cccc] to-[#2bb3b3] hover:from-[#2bb3b3] hover:to-[#26a0a0] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
              <Icon name="heroicons:sparkles" class="w-6 h-6 mr-3" :class="{ 'animate-spin': isChangingBg }" />
              {{ isChangingBg ? 'Génération...' : 'Changer le fond' }}
            </button>

            <button @click="sharePhoto"
              class="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <Icon name="heroicons:share" class="w-6 h-6 mr-3" />
              Partager cette photo
            </button>

            <button @click="downloadPhoto"
              class="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-lg font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <Icon name="heroicons:arrow-down-tray" class="w-6 h-6 mr-3" />
              Télécharger
            </button>
          </div>

          <!-- Informations utilisateur -->
          <div class="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/50">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 text-center">Informations</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:envelope" class="w-4 h-4 text-gray-500" />
                <span class="text-gray-700"><strong>Email :</strong> {{ userEmail }}</span>
              </div>
              <div v-if="userFullName" class="flex items-center space-x-2">
                <Icon name="heroicons:user" class="w-4 h-4 text-gray-500" />
                <span class="text-gray-700"><strong>Nom :</strong> {{ userFullName }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:tag" class="w-4 h-4 text-gray-500" />
                <span class="text-gray-700"><strong>ID Photo :</strong> {{ photo.id }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:calendar" class="w-4 h-4 text-gray-500" />
                <span class="text-gray-700"><strong>Date :</strong> {{ formatDate(photo.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sélecteur de fonds -->
    <BackgroundSelector 
      v-if="showBgSelector" 
      @select="applyBackground" 
      @close="closeBgSelector" 
    />
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
const isChangingBg = ref(false)
const showBgSelector = ref(false)

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


const changeBgPhoto = () => {
  showBgSelector.value = true
}

const applyBackground = async (background) => {
  if (!photo.value?.url) return
  
  isChangingBg.value = true
  showBgSelector.value = false
  
  try {
    console.log('🎨 Début changement de fond pour photo:', photo.value.id, 'Background:', background.name)
    
    // Créer le prompt basé sur le background
    let prompt = ''
    
    // Mapping des prompts pour les fonds géographiques
    const promptMapping = {
      'brussels-grand-place': 'Transform this photo with Grand-Place Brussels background, UNESCO heritage architecture, guild houses, cobblestone square, Belgian historical atmosphere',
      'chimay-cathedral': 'Transform this photo with Chimay Cathedral background, Gothic architecture, Belgian religious monument, medieval stone work, spiritual atmosphere',
      'paris-eiffel': 'Transform this photo with Eiffel Tower background, Parisian atmosphere, romantic lighting, French elegance, iconic monument',
      'tropical-beach': 'Transform this photo with tropical beach background, crystal clear turquoise water, white sand, palm trees, paradise atmosphere',
      'belgium-patriotic': 'Transform this photo with patriotic Belgium background, Belgian flag colors, traditional Belgian specialties, national pride atmosphere',
      'pixar-belgium': 'Transform this photo in Pixar 3D style with Belgian background, Brussels architecture, Belgian culture, animated 3D character style',
      'pixar-uk': 'Transform this photo in Pixar 3D style with British background, London landmarks, UK culture, animated 3D character style',
      'pixar-germany': 'Transform this photo in Pixar 3D style with Oktoberfest background, German beer hall, Bavarian culture, animated 3D character style',
      'ghibli-belgium': 'Transform this photo in Studio Ghibli style with Belgian background, magical realism, Belgian architecture, anime art style',
      'ghibli-uk': 'Transform this photo in Studio Ghibli style with British background, magical realism, UK architecture, anime art style',
      'ghibli-germany': 'Transform this photo in Studio Ghibli style with German Oktoberfest background, magical realism, Bavarian culture, anime art style',
      'ghibli-france': 'Transform this photo in Studio Ghibli style with French background, magical realism, French architecture, anime art style',
      'ghibli-conflans': 'Transform this photo in Studio Ghibli style with Conflans Sainte Honorine background, magical realism, French town atmosphere, anime art style',
      'disney-belgium': 'Transform this photo in classic Disney animation style with Belgian background, fairy tale atmosphere, Belgian culture, traditional animation',
      'disney-uk': 'Transform this photo in classic Disney animation style with British background, fairy tale atmosphere, UK culture, traditional animation',
      'disney-germany': 'Transform this photo in classic Disney animation style with German Oktoberfest background, fairy tale atmosphere, Bavarian culture, traditional animation',
      'disney-france': 'Transform this photo in classic Disney animation style with French background, fairy tale atmosphere, French culture, traditional animation',
      'disney-conflans': 'Transform this photo in classic Disney animation style with Conflans Sainte Honorine background, fairy tale atmosphere, French town, traditional animation',
      'street-caricature-belgium': 'Transform this photo in street caricature style with Belgian background, artistic sketch, Belgian culture, hand-drawn illustration',
      'street-caricature-uk': 'Transform this photo in street caricature style with British background, artistic sketch, UK culture, hand-drawn illustration',
      'street-caricature-germany': 'Transform this photo in street caricature style with German Oktoberfest background, artistic sketch, Bavarian culture, hand-drawn illustration',
      'street-caricature-france': 'Transform this photo in street caricature style with French background, artistic sketch, French culture, hand-drawn illustration',
      'street-caricature-conflans': 'Transform this photo in street caricature style with Conflans Sainte Honorine background, artistic sketch, French town, hand-drawn illustration',
      'dreamworks-belgium': 'Transform this photo in DreamWorks 3D style with Belgian background, modern 3D animation, Belgian culture, cinematic quality',
      'dreamworks-uk': 'Transform this photo in DreamWorks 3D style with British background, modern 3D animation, UK culture, cinematic quality',
      'dreamworks-germany': 'Transform this photo in DreamWorks 3D style with German Oktoberfest background, modern 3D animation, Bavarian culture, cinematic quality',
      'dreamworks-france': 'Transform this photo in DreamWorks 3D style with French background, modern 3D animation, French culture, cinematic quality',
      'dreamworks-conflans': 'Transform this photo in DreamWorks 3D style with Conflans Sainte Honorine background, modern 3D animation, French town, cinematic quality'
    }
    
    prompt = promptMapping[background.id] || `Transform this photo with ${background.name} background, artistic style`
    
    // Appeler l'API Nano Banana pour changer le fond
    const response = await $fetch('/api/photobooth-nano-banana', {
      method: 'POST',
      body: {
        imageUrl: photo.value.url,
        prompt: prompt
      }
    })

    if (response.success && response.generatedImageUrl) {
      // Mettre à jour la photo avec la nouvelle image générée
      photo.value.url = response.generatedImageUrl
      photo.value.background_name = background.name
      
      console.log('✅ Fond changé avec succès:', response.generatedImageUrl)
      
      // Afficher un message de succès
      alert(`🎉 Fond changé avec succès ! Votre photo a été transformée avec ${background.emoji} ${background.name} !`)
    } else {
      throw new Error(response.message || 'Erreur lors de la génération du nouveau fond')
    }
  } catch (error) {
    console.error('❌ Erreur changement de fond:', error)
    alert('❌ Erreur lors du changement de fond. Veuillez réessayer.')
  } finally {
    isChangingBg.value = false
  }
}

const closeBgSelector = () => {
  showBgSelector.value = false
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
