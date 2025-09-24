<template>
  <div class="camera-container">
    <!-- Sélecteur de fond -->
    <div class="absolute top-4 left-4 right-4 z-20">
      <div v-if="!showBackgroundSelector" class="flex justify-center">
        <button
          @click="showBackgroundSelector = true"
          class="bg-black/50 text-white px-4 py-2 rounded-full text-sm backdrop-blur"
        >
          🌍 {{ selectedBackground?.name || 'Choisir fond' }}
        </button>
      </div>

      <!-- Sélecteur de fond -->
      <div
        v-if="showBackgroundSelector"
        class="fixed inset-0 bg-black/95 backdrop-blur z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex justify-between items-center p-4 border-b border-white/20">
          <h2 class="text-white text-xl font-bold">🌍 Choisir un fond</h2>
          <button
            @click="showBackgroundSelector = false"
            class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ✕ Fermer
          </button>
        </div>

        <!-- Grille des fonds -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            <div
              v-for="bg in backgrounds"
              :key="bg.id"
              @click="selectBackground(bg)"
              class="relative cursor-pointer rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-200"
              :class="
                selectedBackground?.id === bg.id ? 'ring-4 ring-blue-400 shadow-lg' : 'ring-2 ring-transparent hover:ring-white/30'
              "
            >
              <img :src="bg.preview" class="w-full h-32 sm:h-40 md:h-48 object-cover" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
              >
                <div class="absolute bottom-0 left-0 right-0 p-3">
                  <p class="text-white text-lg font-semibold mb-1">{{ bg.emoji }}</p>
                  <p class="text-white text-xs opacity-90 leading-tight">{{ bg.name }}</p>
                </div>
              </div>
              
              <!-- Indicateur de sélection -->
              <div
                v-if="selectedBackground?.id === bg.id"
                class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <span class="text-white text-xs">✓</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer avec info -->
        <div class="border-t border-white/20 p-4">
          <p class="text-white/70 text-center text-sm">
            {{ backgrounds.length }} fonds disponibles • Cliquez sur un fond pour le sélectionner
          </p>
        </div>
      </div>
    </div>

    <!-- Vidéo avec contraintes de résolution -->
    <video
      ref="videoElement"
      autoplay
      playsinline
      muted
      class="w-full h-full object-cover rounded-lg"
      :class="{mirror: frontCamera}"
    ></video>

    <canvas ref="canvasElement" class="hidden"></canvas>

    <!-- Guide de positionnement -->
    <div
      v-if="selectedBackground"
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
    <div class="absolute bottom-4 left-0 right-0 px-4">
      <div class="flex items-center justify-between">
        <!-- Switch Camera -->
        <button
          @click="switchCamera"
          class="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white text-xl backdrop-blur"
          :disabled="!isReady || isProcessing"
        >
          🔄
        </button>

        <!-- Capture Button -->
        <button
          @click="capturePhoto"
          class="w-20 h-20 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-transform"
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

const emit = defineEmits(['photo-captured', 'show-gallery'])

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
  }
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
</style>
