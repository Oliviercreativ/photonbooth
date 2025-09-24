<template>
  <div class="live-photobooth min-h-screen bg-black">
    <!-- Header avec sélection fond -->
    <header class="bg-black/50 p-4 absolute top-0 left-0 right-0 z-10">
      <div class="flex justify-between items-center">
        <h1 class="text-white font-bold">📸 Live Photobooth</h1>
        <button
          @click="showBackgroundSelector = !showBackgroundSelector"
          class="bg-white/20 text-white px-3 py-2 rounded-full text-sm"
        >
          🌍 {{ selectedBg?.name || 'Choisir fond' }}
        </button>
      </div>

      <!-- Sélecteur de fond (slide down) -->
      <div
        v-if="showBackgroundSelector"
        class="mt-4 bg-black/80 rounded-xl p-4 backdrop-blur"
      >
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="bg in backgrounds"
            :key="bg.id"
            @click="selectBackground(bg)"
            class="relative cursor-pointer rounded-lg overflow-hidden"
            :class="selectedBg?.id === bg.id ? 'ring-2 ring-blue-400' : ''"
          >
            <img :src="bg.preview" class="w-full h-16 object-cover" />
            <div
              class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent"
            >
              <p class="text-white text-xs p-1 text-center">{{ bg.emoji }}</p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Zone de prévisualisation principale -->
    <div class="relative h-screen">
      <!-- Canvas pour traitement temps réel -->
      <canvas ref="canvas" class="hidden"></canvas>

      <!-- Affichage de la caméra avec guide -->
      <div class="relative w-full h-full bg-black">
        <!-- Caméra en direct -->
        <video
          ref="video"
          class="w-full h-full object-cover bg-black"
          autoplay
          playsinline
        ></video>

        <!-- Placeholder si pas de fond sélectionné -->
        <div
          v-if="!selectedBg"
          class="absolute inset-0 flex items-center justify-center bg-black/50"
        >
          <div class="text-center text-white/70">
            <div class="text-6xl mb-4">📸</div>
            <p>Choisissez un fond pour commencer</p>
          </div>
        </div>

        <!-- Guide de positionnement -->
        <div
          v-if="selectedBg"
          class="absolute inset-8 border-2 border-white/60 pointer-events-none"
        >
          <div
            class="absolute -top-8 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded"
          >
            Placez-vous dans le cadre
          </div>
          <div
            class="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
          >
            {{ selectedBg.name }}
          </div>
        </div>

        <!-- Indicateur de traitement -->
        <div
          v-if="capturing"
          class="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <div class="text-center text-white">
            <div class="text-4xl mb-2 animate-spin">⏳</div>
            <p class="text-sm">Traitement en cours...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Controls en bas -->
    <div class="absolute bottom-0 left-0 right-0 p-6">
      <div class="flex items-center justify-between">
        <!-- Switch Camera -->
        <button
          @click="switchCamera"
          class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl backdrop-blur"
        >
          🔄
        </button>

        <!-- Capture Button -->
        <button
          @click="capturePhoto"
          :disabled="!selectedBg || capturing"
          class="w-20 h-20 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform disabled:opacity-50"
        >
          <div
            class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span v-if="capturing" class="text-white text-xs">⏳</span>
            <span v-else class="text-white text-xl">📷</span>
          </div>
        </button>

        <!-- Gallery -->
        <button
          @click="viewGallery"
          class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl backdrop-blur"
        >
          🖼️
          <span
            v-if="capturedPhotos.length > 0"
            class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center"
            >{{ capturedPhotos.length }}</span
          >
        </button>
      </div>

      <!-- Status -->
      <div class="text-center mt-4">
        <p v-if="!selectedBg" class="text-white/60 text-sm">
          👆 Choisissez un fond d'écran
        </p>
        <p v-else-if="capturing" class="text-yellow-400 text-sm animate-pulse">
          📸 Capture en cours...
        </p>
        <p v-else class="text-green-400 text-sm">
          📸 Prêt ! Appuyez pour capturer
        </p>
        <p v-if="selectedBg" class="text-white/50 text-xs mt-1">
          Le fond sera appliqué après la capture
        </p>
      </div>
    </div>

    <!-- Photos capturées (overlay) -->
    <div v-if="showGallery" class="gallery-overlay">
      <div class="gallery-content">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-white text-lg font-semibold">
            Vos photos ({{ capturedPhotos.length }})
          </h3>
          <button @click="showGallery = false" class="text-white text-xl">
            ✕
          </button>
        </div>

        <!-- Debug: indicateur que la galerie est ouverte -->
        <div class="bg-green-500 text-white p-2 rounded mb-4 text-center">
          🎉 GALERIE OUVERTE - {{ capturedPhotos.length }} photo(s)
          disponible(s)
        </div>

        <div
          v-if="capturedPhotos.length === 0"
          class="text-center text-white/60 py-8"
        >
          <div class="text-4xl mb-2">📷</div>
          <p>Aucune photo capturée</p>
        </div>

        <div v-else class="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          <div
            v-for="(photo, index) in capturedPhotos"
            :key="index"
            class="relative"
          >
            <img
              :src="photo.url"
              class="w-full aspect-square object-cover rounded-lg"
              :class="getBackgroundFilter(photo.backgroundId)"
              @error="console.error('Erreur chargement image:', photo.url)"
              @load="console.log('Image chargée:', photo.url)"
            />
            <div class="absolute top-2 right-2 flex gap-1">
              <button
                @click="downloadPhoto(photo)"
                class="w-8 h-8 bg-blue-500 rounded-full text-white text-xs"
              >
                📥
              </button>
              <button
                @click="sharePhoto(photo)"
                class="w-8 h-8 bg-green-500 rounded-full text-white text-xs"
              >
                📤
              </button>
            </div>
            <div
              class="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
            >
              {{ photo.background }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const video = ref(null)
const canvas = ref(null)
const selectedBg = ref(null)
const processedFrame = ref('')
const processing = ref(false)
const capturing = ref(false)
const frontCamera = ref(true)
const stream = ref(null)
const showBackgroundSelector = ref(false)
const showGallery = ref(false)
const capturedPhotos = ref([])

// Intervalle pour le traitement temps réel
let processingInterval = null

const backgrounds = ref([
  {
    id: 'brussels-grand-place',
    name: 'Grand-Place Bruxelles',
    emoji: '🏛️',
    preview: '/previews/brussels.jpg',
    prompt:
      'Replace the green screen with the magnificent Grand-Place in Brussels with its ornate guild houses and cobblestone square during golden hour'
  },
  {
    id: 'paris-eiffel',
    name: 'Tour Eiffel Paris',
    emoji: '🗼',
    preview: '/previews/paris.jpg',
    prompt:
      'Replace the green background with the iconic Eiffel Tower in Paris during sunset, as if standing at Trocadéro'
  },
  {
    id: 'chimay-cathedral',
    name: 'Cathédrale Chimay',
    emoji: '⛪',
    preview: '/previews/chimay.jpg',
    prompt:
      'Replace the green screen with the beautiful Gothic Cathedral of Chimay in Belgium with natural afternoon lighting'
  },
  {
    id: 'tropical-beach',
    name: 'Plage Tropicale',
    emoji: '🏝️',
    preview: '/previews/beach.jpg',
    prompt:
      'Replace the green background with a stunning tropical beach with crystal blue water and palm trees during golden hour'
  }
])

onMounted(async () => {
  await startCamera()
})

const startCamera = async () => {
  try {
    const constraints = {
      video: {
        facingMode: frontCamera.value ? 'user' : 'environment',
        width: {ideal: 720},
        height: {ideal: 1280} // Portrait pour mobile
      }
    }

    stream.value = await navigator.mediaDevices.getUserMedia(constraints)
    video.value.srcObject = stream.value

    // Démarrer le traitement temps réel
    startLiveProcessing()
  } catch (error) {
    console.error('Erreur caméra:', error)
  }
}

const selectBackground = (bg) => {
  selectedBg.value = bg
  showBackgroundSelector.value = false
}

const startLiveProcessing = () => {
  // Mode post-production : pas de traitement en temps réel
  // On affiche juste la caméra avec un overlay pour guider l'utilisateur
  console.log('Mode post-production activé - pas de traitement en temps réel')
}

const processCurrentFrame = async () => {
  if (processing.value || !video.value || !selectedBg.value) return

  processing.value = true

  try {
    // Capturer la frame actuelle
    const context = canvas.value.getContext('2d')
    canvas.value.width = video.value.videoWidth
    canvas.value.height = video.value.videoHeight

    if (frontCamera.value) {
      context.scale(-1, 1)
      context.drawImage(video.value, -canvas.value.width, 0)
      context.scale(-1, 1) // Reset
    } else {
      context.drawImage(video.value, 0, 0)
    }

    // Convertir en blob
    canvas.value.toBlob(
      async (blob) => {
        if (!blob) return

        // Envoyer à Nano Banana
        const formData = new FormData()
        formData.append('image', blob, 'frame.jpg')
        formData.append('background', selectedBg.value.id)

        try {
          const response = await fetch('/api/photobooth-nano-banana', {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            const resultBlob = await response.blob()
            processedFrame.value = URL.createObjectURL(resultBlob)
          }
        } catch (error) {
          console.error('Erreur traitement frame:', error)
        }
      },
      'image/jpeg',
      0.8
    )
  } finally {
    processing.value = false
  }
}

const capturePhoto = async () => {
  if (!selectedBg.value || capturing.value) return

  capturing.value = true

  try {
    // Capturer une frame haute qualité
    const context = canvas.value.getContext('2d')
    canvas.value.width = video.value.videoWidth
    canvas.value.height = video.value.videoHeight

    if (frontCamera.value) {
      context.scale(-1, 1)
      context.drawImage(video.value, -canvas.value.width, 0)
      context.scale(-1, 1)
    } else {
      context.drawImage(video.value, 0, 0)
    }

    // Feedback visuel immédiat
    showCaptureFlash()

    canvas.value.toBlob(
      async (blob) => {
        const formData = new FormData()
        formData.append('image', blob, 'capture.jpg')
        formData.append('background', selectedBg.value.id)
        formData.append('high_quality', 'true') // Flag pour haute qualité

        try {
          const response = await fetch('/api/photobooth-nano-banana', {
            method: 'POST',
            body: formData
          })

          if (response.ok) {
            const resultBlob = await response.blob()
            const photoUrl = URL.createObjectURL(resultBlob)

            console.log('Blob reçu:', resultBlob.size, 'bytes')
            console.log('URL créée:', photoUrl)

            // Sauvegarder la photo avec les métadonnées du fond
            capturedPhotos.value.unshift({
              url: photoUrl,
              background: selectedBg.value.name,
              backgroundId: selectedBg.value.id,
              timestamp: Date.now()
            })

            console.log('Photo traitée et sauvegardée:', selectedBg.value.name)
            console.log('Nombre total de photos:', capturedPhotos.value.length)
            console.log('Photos dans la galerie:', capturedPhotos.value)

            // Afficher automatiquement la galerie après traitement
            showGallery.value = true
            console.log('Galerie ouverte:', showGallery.value)
          } else {
            console.error('Erreur traitement photo:', response.status)
          }
        } catch (error) {
          console.error('Erreur capture:', error)
        }
      },
      'image/jpeg',
      0.95
    ) // Haute qualité pour la capture finale
  } finally {
    capturing.value = false
  }
}

const showCaptureFlash = () => {
  // Effet flash blanc
  const flash = document.createElement('div')
  flash.className = 'fixed inset-0 bg-white z-50 pointer-events-none'
  flash.style.animation = 'flash 0.3s ease-out'
  document.body.appendChild(flash)

  setTimeout(() => {
    document.body.removeChild(flash)
  }, 300)
}

const switchCamera = async () => {
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
  }

  frontCamera.value = !frontCamera.value
  await startCamera()
}

const viewGallery = () => {
  showGallery.value = true
}

const downloadPhoto = async (photo) => {
  const a = document.createElement('a')
  a.href = photo.url
  a.download = `photobooth-${photo.background}-${photo.timestamp}.jpg`
  a.click()
}

const sharePhoto = async (photo) => {
  if (navigator.share) {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const file = new File([blob], `photo-${photo.background}.jpg`, {
        type: 'image/jpeg'
      })

      await navigator.share({
        title: `Ma photo à ${photo.background} !`,
        files: [file]
      })
    } catch (error) {
      console.error('Partage échoué:', error)
    }
  }
}

const getBackgroundFilter = (backgroundId) => {
  const filters = {
    'brussels-grand-place': 'filter-brussels',
    'paris-eiffel': 'filter-paris',
    'chimay-cathedral': 'filter-chimay',
    'tropical-beach': 'filter-beach',
    'tokyo-street': 'filter-tokyo',
    'mountain-alps': 'filter-alps'
  }
  return filters[backgroundId] || ''
}

onUnmounted(() => {
  if (processingInterval) {
    clearInterval(processingInterval)
  }
  if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop())
  }
})
</script>

<style scoped>
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

.gallery-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.9) !important;
  z-index: 9999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.gallery-content {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 12px;
  padding: 20px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  border: 2px solid rgba(255, 255, 255, 0.2);
}
</style>
