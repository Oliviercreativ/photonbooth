<template>
  <div class="camera-container">
    <!-- Menu mobile -->
    <div class="fixed bottom-0 left-0 right-0 z-30 bg-black/90 backdrop-blur border-t border-white/20">
      <div class="flex">
        <button
          @click="activeMobileTab = 'camera'"
          class="flex-1 flex flex-col items-center py-3 touch-manipulation"
          :class="activeMobileTab === 'camera' ? 'text-blue-400' : 'text-white/70'"
        >
          <span class="text-2xl mb-1">📷</span>
          <span class="text-xs font-medium">Caméra</span>
        </button>
        <button
          @click="activeMobileTab = 'photos'"
          class="flex-1 flex flex-col items-center py-3 touch-manipulation"
          :class="activeMobileTab === 'photos' ? 'text-blue-400' : 'text-white/70'"
        >
          <span class="text-2xl mb-1">🖼️</span>
          <span class="text-xs font-medium">Photos</span>
        </button>
      </div>
    </div>

    <!-- Onglet Caméra -->
    <div v-if="activeMobileTab === 'camera'" class="h-full w-full relative pb-20">
      <!-- Bouton choisir fond en haut -->
    <div class="absolute top-4 left-4 right-4 z-20">
        <button
          @click="openBackgroundSelector"
          class="w-full bg-black/70 text-white px-6 py-4 rounded-full text-lg font-semibold backdrop-blur shadow-lg border border-white/20 min-h-[56px] touch-manipulation"
        >
          🌍 {{ selectedBackground?.name || 'Choisir un fond' }}
        </button>
      </div>

      <!-- Sélecteur de fond -->
      <div
        v-if="showBackgroundSelector"
        class="fixed inset-0 bg-black/95 backdrop-blur z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b border-white/20">
          <h2 class="text-white text-lg sm:text-xl font-bold">🌍 Choisir un fond</h2>
          <button
            @click="showBackgroundSelector = false"
            class="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-3 rounded-lg transition-colors touch-manipulation min-h-[48px] min-w-[80px] font-semibold"
          >
            ✕ Fermer
          </button>
        </div>

        <!-- Onglets -->
        <div class="flex border-b border-white/20">
          <button
            @click="activeTab = 'geographic'"
            class="flex-1 px-2 py-4 text-center transition-colors touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
            :class="activeTab === 'geographic' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'"
          >
            <span class="text-xl mb-1">🌍</span>
            <span class="text-sm font-medium">Pays et Ville</span>
          </button>
          <button
            @click="activeTab = 'transformed'"
            class="flex-1 px-2 py-4 text-center transition-colors touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
            :class="activeTab === 'transformed' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'"
          >
            <span class="text-xl mb-1">🌎</span>
            <span class="text-sm font-medium">Monde Entier</span>
          </button>
          <button
            @click="activeTab = 'original'"
            class="flex-1 px-2 py-4 text-center transition-colors touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
            :class="activeTab === 'original' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'"
          >
            <span class="text-xl mb-1">📷</span>
            <span class="text-sm font-medium">Monde Original</span>
          </button>
        </div>

        <!-- Grille des fonds -->
        <div class="flex-1 overflow-y-auto p-3 sm:p-4">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            <div
              v-for="bg in filteredBackgrounds"
              :key="bg.id"
              @click="selectBackground(bg)"
              class="relative cursor-pointer rounded-xl overflow-hidden group active:scale-95 transition-transform duration-150 touch-manipulation"
              :class="
                selectedBackground?.id === bg.id ? 'ring-4 ring-blue-400 shadow-xl' : 'ring-2 ring-transparent hover:ring-white/30'
              "
            >
              <img :src="bg.preview" class="w-full h-28 sm:h-32 md:h-40 lg:h-48 object-cover" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"
              >
                <div class="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                  <p class="text-white text-base sm:text-lg font-bold mb-1">{{ bg.emoji }}</p>
                  <p class="text-white text-xs sm:text-sm opacity-95 leading-tight font-medium">{{ bg.name }}</p>
                </div>
              </div>
              
              <!-- Indicateur de sélection -->
              <div
                v-if="selectedBackground?.id === bg.id"
                class="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <span class="text-white text-sm sm:text-base font-bold">✓</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Onglet Photos -->
    <div v-if="activeMobileTab === 'photos'" class="h-full w-full relative pb-20">
      <div class="p-4 pt-16">
        <h2 class="text-white text-2xl font-bold mb-6 text-center">📸 Mes Photos</h2>
        
        <!-- Galerie des photos -->
        <div v-if="capturedPhotos.length > 0" class="grid grid-cols-2 gap-4">
          <div
            v-for="(photo, index) in capturedPhotos"
            :key="index"
            class="relative aspect-square rounded-xl overflow-hidden shadow-lg"
          >
            <img :src="photo.processedImage" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <div class="absolute bottom-2 left-2 right-2">
                <p class="text-white text-sm font-medium truncate">{{ photo.backgroundName }}</p>
                <p class="text-white/80 text-xs">{{ new Date(photo.timestamp).toLocaleTimeString() }}</p>
              </div>
            </div>
            <!-- Bouton de téléchargement -->
        <button
              @click="downloadPhoto(photo)"
              class="absolute top-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg touch-manipulation"
        >
              <span class="text-white text-sm">⬇️</span>
        </button>
          </div>
        </div>
        
        <!-- Message si pas de photos -->
        <div v-else class="flex flex-col items-center justify-center h-64 text-white/70">
          <span class="text-6xl mb-4">📷</span>
          <p class="text-lg font-medium">Aucune photo prise</p>
          <p class="text-sm text-center mt-2">Prenez votre première photo avec la caméra !</p>
        </div>
      </div>
    </div>

    <!-- Vidéo avec contraintes de résolution -->
    <div v-if="activeMobileTab === 'camera'" class="fixed inset-0 z-0">
    <video
      ref="videoElement"
      autoplay
      playsinline
      muted
        class="w-full h-full object-cover"
      :class="{mirror: frontCamera}"
    ></video>
    </div>

    <canvas ref="canvasElement" class="hidden"></canvas>

    <!-- Guide de positionnement -->
    <div
      v-if="selectedBackground && activeMobileTab === 'camera'"
      class="absolute inset-8 border-2 border-white/60 pointer-events-none rounded-lg"
    >
      <div
        class="absolute -top-8 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded"
      >
        Placez-vous dans le cadre
      </div>
    </div>

    <!-- Instructions si pas de fond sélectionné -->
    <div
      v-if="!selectedBackground"
      class="absolute inset-0 flex items-center justify-center bg-black/30"
    >
      <div class="text-center text-white bg-black/70 p-4 rounded-xl">
        <div class="text-3xl mb-2">📸</div>
        <p class="text-sm">Choisissez un fond pour commencer</p>
      </div>
    </div>

    <!-- État de traitement -->
    <div
      v-if="isProcessing"
      class="absolute inset-0 bg-black/50 flex items-center justify-center"
    >
      <div class="text-center text-white bg-black/80 p-6 rounded-xl">
        <div class="text-4xl mb-3 animate-spin">⏳</div>
        <p class="text-lg font-medium">{{ processingStep }}</p>
        <p class="text-sm opacity-75 mt-2">Gemini analyse votre photo...</p>
      </div>
    </div>

    <!-- Contrôles -->
    <div v-if="activeMobileTab === 'camera'" class="absolute bottom-24 left-0 right-0 px-4">
      <div class="flex items-center justify-between">
        <!-- Switch Camera -->
        <button
          @click="switchCamera"
          class="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white text-xl backdrop-blur touch-manipulation"
          :disabled="!isReady || isProcessing"
        >
          🔄
        </button>

        <!-- Capture Button -->
        <button
          @click="capturePhoto"
          class="w-24 h-24 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-xl transition-transform touch-manipulation"
          :disabled="!isReady || !selectedBackground || isProcessing"
          :class="isProcessing ? 'animate-pulse' : 'active:scale-95'"
        >
          <div
            class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span v-if="isProcessing" class="text-white text-xs">⏳</span>
            <span v-else class="text-white text-2xl">📷</span>
          </div>
        </button>

        <!-- Photos prises -->
        <div class="relative">
          <button
            @click="$emit('show-gallery')"
            class="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white text-xl backdrop-blur"
          >
            🖼️
          </button>
          <span
            v-if="capturedPhotos.length > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center"
          >
            {{ capturedPhotos.length }}
          </span>
        </div>
      </div>

      <!-- Status -->
      <div class="text-center mt-3">
        <p v-if="!selectedBackground" class="text-white/70 text-sm">
          👆 Choisissez un fond d'écran
        </p>
        <p
          v-else-if="isProcessing"
          class="text-yellow-400 text-sm animate-pulse"
        >
          ✨ {{ processingStep }}
        </p>
        <p v-else-if="selectedBackground" class="text-green-400 text-sm">
          📸 Prêt ! Appuyez pour capturer
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const videoElement = ref(null)
const canvasElement = ref(null)
const isReady = ref(false)
const isProcessing = ref(false)
const processingStep = ref('')
const selectedBackground = ref(null)
const showBackgroundSelector = ref(false)
const frontCamera = ref(true)
const capturedPhotos = ref([])
const activeTab = ref('geographic')
const activeMobileTab = ref('camera')

const emit = defineEmits(['photo-captured', 'show-gallery'])

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
        bg.id.includes('aura-glow-pure-original') ||
        bg.id.includes('captain-future-transformed')
      )
    case 'original':
      // Fonds "Monde Original" (fond original conservé)
      return backgrounds.value.filter(bg => 
        bg.id.includes('pure-original') ||
        bg.id.includes('fond-original') ||
        bg.name.includes('Fond Original') ||
        bg.id.includes('captain-future-original')
      )
    default:
      return backgrounds.value
  }
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
])

onMounted(async () => {
  await startCamera()
})

const startCamera = async () => {
  try {
    // Contraintes optimisées pour éviter le zoom
    const constraints = {
      video: {
        facingMode: frontCamera.value ? 'user' : 'environment',
        width: {
          min: 640,
          ideal: 1280,
          max: 1920
        },
        height: {
          min: 480,
          ideal: 720,
          max: 1080
        },
        aspectRatio: {ideal: 16 / 9},
        frameRate: {ideal: 30, max: 60}
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)

    if (videoElement.value) {
      videoElement.value.srcObject = stream

      // Attendre que la vidéo soit chargée
      videoElement.value.onloadedmetadata = () => {
        isReady.value = true
        console.log(
          `Caméra initialisée: ${videoElement.value.videoWidth}x${videoElement.value.videoHeight}`
        )
      }
    }
  } catch (error) {
    console.error('Erreur accès caméra:', error)
    alert("Impossible d'accéder à la caméra. Vérifiez les permissions.")
  }
}

const switchCamera = async () => {
  if (videoElement.value?.srcObject) {
    const tracks = videoElement.value.srcObject.getTracks()
    tracks.forEach((track) => track.stop())
  }

  frontCamera.value = !frontCamera.value
  isReady.value = false
  await startCamera()
}

const selectBackground = (background) => {
  selectedBackground.value = background
  showBackgroundSelector.value = false
}

const openBackgroundSelector = () => {
  activeTab.value = 'geographic' // Réinitialiser à l'onglet géographique
  showBackgroundSelector.value = true
}

const downloadPhoto = (photo) => {
  const link = document.createElement('a')
  link.href = photo.processedImage
  link.download = `photobooth-${photo.timestamp}.jpg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const capturePhoto = async () => {
  if (!selectedBackground.value || !isReady.value || isProcessing.value) return

  const video = videoElement.value
  const canvas = canvasElement.value

  if (!video || !canvas) return

  isProcessing.value = true
  processingStep.value = 'Capture en cours...'

  try {
    // Effet flash
    showFlash()

    // Capturer l'image
    const context = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Dessiner l'image (miroir si caméra frontale)
    if (frontCamera.value) {
      context.scale(-1, 1)
      context.drawImage(video, -canvas.width, 0)
      context.scale(-1, 1)
    } else {
      context.drawImage(video, 0, 0)
    }

    // Convertir en blob pour l'envoi
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          isProcessing.value = false
          return
        }

        try {
          processingStep.value = 'Gemini analyse la photo...'

          // Envoyer à l'API Nano Banana pour traitement Gemini
          const formData = new FormData()
          formData.append('image', blob, 'photo.jpg')
          formData.append('background', selectedBackground.value.id)
          formData.append('high_quality', 'true')

          const response = await fetch('/api/photobooth-nano-banana', {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            processingStep.value = 'Finalisation...'

            const resultBlob = await response.blob()
            const photoUrl = URL.createObjectURL(resultBlob)

            // Sauvegarder la photo traitée
            const processedPhoto = {
              id: Date.now(),
              url: photoUrl,
              originalUrl: canvas.toDataURL('image/jpeg', 0.8),
              background: selectedBackground.value.name,
              backgroundId: selectedBackground.value.id,
              timestamp: new Date().toLocaleString(),
              processed: true
            }

            capturedPhotos.value.unshift(processedPhoto)

            console.log(
              'Photo traitée avec succès par Gemini 2.5:',
              selectedBackground.value.name
            )

            // Émettre l'événement avec la photo traitée
            emit('photo-captured', processedPhoto)

            // Succès!
            processingStep.value = 'Photo terminée !'
            setTimeout(() => {
              isProcessing.value = false
              processingStep.value = ''
            }, 1000)
          } else {
            throw new Error(`Erreur API: ${response.status}`)
          }
        } catch (error) {
          console.error('Erreur traitement Gemini:', error)

          // Fallback: sauvegarder la photo originale
          const originalPhoto = {
            id: Date.now(),
            url: canvas.toDataURL('image/jpeg', 0.8),
            background: 'Photo originale',
            backgroundId: 'original',
            timestamp: new Date().toLocaleString(),
            processed: false,
            error: true
          }

          capturedPhotos.value.unshift(originalPhoto)
          emit('photo-captured', originalPhoto)

          alert('Erreur lors du traitement IA. Photo originale sauvegardée.')
          isProcessing.value = false
          processingStep.value = ''
        }
      },
      'image/jpeg',
      0.95
    )
  } catch (error) {
    console.error('Erreur capture:', error)
    isProcessing.value = false
    processingStep.value = ''
  }
}

const showFlash = () => {
  const flash = document.createElement('div')
  flash.className = 'fixed inset-0 bg-white z-50 pointer-events-none'
  flash.style.animation = 'flash 0.3s ease-out'
  document.body.appendChild(flash)

  setTimeout(() => {
    document.body.removeChild(flash)
  }, 300)
}

// Nettoyer les ressources
onUnmounted(() => {
  if (videoElement.value?.srcObject) {
    const tracks = videoElement.value.srcObject.getTracks()
    tracks.forEach((track) => track.stop())
  }

  // Libérer les URLs des objets
  capturedPhotos.value.forEach((photo) => {
    if (photo.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url)
    }
  })
})

// Exposer les photos pour le parent
defineExpose({
  capturedPhotos
})
</script>

<style scoped>
.camera-container {
  position: relative;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 0.75rem;
  overflow: hidden;
  max-height: 70vh;
}

.mirror {
  transform: scaleX(-1);
}

@keyframes flash {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .camera-container {
    aspect-ratio: 4/3;
    max-height: 60vh;
  }
}

/* Animations pour le sélecteur de fonds */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group:hover img {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

/* Scrollbar personnalisée pour le sélecteur */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Optimisations mobile pour événements extérieurs */
@media (max-width: 768px) {
  /* Améliorer la visibilité en plein soleil */
  .camera-container {
    filter: contrast(1.1) brightness(1.05);
  }
  
  /* Boutons plus gros pour usage tactile */
  button {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Texte plus lisible */
  .text-sm {
    font-size: 0.95rem;
  }
  
  /* Espacement optimisé pour les doigts */
  .gap-3 {
    gap: 0.75rem;
  }
}

/* Amélioration de la visibilité extérieure */
@media (max-width: 480px) {
  /* Contraste renforcé pour usage extérieur */
  .bg-black\/70 {
    background-color: rgba(0, 0, 0, 0.85);
  }
  
  .bg-black\/95 {
    background-color: rgba(0, 0, 0, 0.98);
  }
  
  /* Ombres plus prononcées */
  .shadow-xl {
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  }
  
  /* Bordures plus visibles */
  .border-white\/20 {
    border-color: rgba(255, 255, 255, 0.4);
  }
}

/* Feedback tactile pour mobile */
.touch-manipulation {
  touch-action: manipulation;
}

/* Prévention du zoom sur double-tap */
button, input, select, textarea {
  touch-action: manipulation;
}

/* Amélioration des transitions pour mobile */
@media (prefers-reduced-motion: no-preference) {
  .transition-transform {
    transition-duration: 150ms;
  }
}
</style>
