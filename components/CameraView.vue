<template>
  <div class="camera-view relative h-screen flex items-center justify-center bg-black">
    <!-- Video caché pour capture -->
    <video ref="video" :class="{ 'mirror': frontCamera }" class="hidden" autoplay playsinline muted />

    <!-- Canvas pour traitement -->
    <canvas ref="canvas" class="hidden" />

    <!-- Affichage principal -->
    <div class="relative w-full h-full max-w-sm mx-auto">
      <!-- Live Preview ou Video normale -->
      <div class="w-full h-full relative overflow-hidden rounded-xl">
        <img v-if="livePreviewImage && selectedBackground && isLivePreview" :src="livePreviewImage"
          class="w-full h-full object-cover" alt="Live preview avec fond" />
        <video v-else ref="displayVideo" :class="{ 'mirror': frontCamera }" class="w-full h-full object-cover" autoplay
          playsinline muted />
      </div>

      <!-- Guide de positionnement -->
      <div v-if="selectedBackground" class="absolute inset-4 border-2 border-white/40 rounded-xl pointer-events-none">
        <div class="absolute -top-8 left-0 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
          {{ selectedBackground ? 'Parfait ! Prêt à capturer' : 'Placez-vous dans le cadre' }}
        </div>
      </div>

      <!-- Instructions -->
      <div v-if="!selectedBackground" class="absolute inset-0 flex items-center justify-center">
        <div class="text-center text-white bg-black/50 p-6 rounded-xl backdrop-blur">
          <div class="text-4xl mb-3">📸</div>
          <p class="text-lg font-medium mb-2">Bienvenue !</p>
          <p class="text-sm opacity-80">Choisissez un fond d'écran en haut pour commencer</p>
        </div>
      </div>
    </div>

    <!-- Controls en bas -->
    <div class="absolute bottom-6 left-0 right-0 px-6">
      <div class="flex items-center justify-between max-w-sm mx-auto">
        <!-- Switch Camera -->
        <button @click="$emit('switch-camera')" :disabled="!isActive"
          class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl backdrop-blur disabled:opacity-50 transition-all active:scale-95">
          🔄
        </button>

        <!-- Capture Button -->
        <button @click="capturePhoto" :disabled="!selectedBackground || capturing"
          class="w-20 h-20 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-transform disabled:opacity-50"
          :class="capturing ? 'animate-pulse' : 'active:scale-95'">
          <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <span v-if="capturing" class="text-white text-xs animate-spin">⏳</span>
            <span v-else class="text-white text-2xl">📷</span>
          </div>
        </button>

        <!-- Gallery -->
        <button @click="$emit('open-gallery')"
          class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl backdrop-blur transition-all active:scale-95">
          🖼️
        </button>
      </div>

      <!-- Status -->
      <div class="text-center mt-4 max-w-sm mx-auto">
        <p v-if="!selectedBackground" class="text-white/70 text-sm">
          👆 Choisissez un fond d'écran
        </p>
        <p v-else-if="error" class="text-red-400 text-sm">
          ⚠️ {{ error }}
        </p>
        <p v-else-if="isLiveProcessing" class="text-yellow-400 text-sm animate-pulse">
          ✨ Traitement en cours...
        </p>
        <p v-else class="text-green-400 text-sm">
          📸 Prêt ! Appuyez pour capturer
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  selectedBackground?: any
  isLivePreview?: boolean
}>()

const emit = defineEmits<{
  'photo-captured': [imageData: string]
  'switch-camera': []
  'open-gallery': []
}>()

const {
  video,
  canvas,
  isActive,
  frontCamera,
  error,
  startCamera,
  stopCamera,
  switchCamera,
  capturePhoto: captureCameraPhoto
} = useCamera()

const { processLiveFrame } = usePhotobooth()

const displayVideo = ref<HTMLVideoElement>()
const livePreviewImage = ref<string>('')
const capturing = ref(false)
const isLiveProcessing = ref(false)

let liveProcessingInterval: NodeJS.Timeout | null = null

// Démarrer la caméra au montage
onMounted(async () => {
  const started = await startCamera()
  if (started && video.value && displayVideo.value) {
    displayVideo.value.srcObject = video.value.srcObject
  }

  if (props.isLivePreview) {
    startLiveProcessing()
  }
})

// Démarrer le traitement live
const startLiveProcessing = () => {
  if (liveProcessingInterval) return

  liveProcessingInterval = setInterval(async () => {
    if (props.selectedBackground && !isLiveProcessing.value && isActive.value) {
      await processLiveFrame()
    }
  }, 1000) // 1 FPS pour économiser les ressources
}

// Arrêter le traitement live
const stopLiveProcessing = () => {
  if (liveProcessingInterval) {
    clearInterval(liveProcessingInterval)
    liveProcessingInterval = null
  }
}

// Traitement d'une frame live
const processLiveFrame = async () => {
  if (!video.value || isLiveProcessing.value) return

  isLiveProcessing.value = true

  try {
    // Capturer frame actuelle
    const context = canvas.value?.getContext('2d')
    if (!context || !canvas.value) return

    canvas.value.width = video.value.videoWidth || 640
    canvas.value.height = video.value.videoHeight || 480

    if (frontCamera.value) {
      context.scale(-1, 1)
      context.drawImage(video.value, -canvas.value.width, 0)
      context.scale(-1, 1)
    } else {
      context.drawImage(video.value, 0, 0)
    }

    canvas.value.toBlob(async (blob) => {
      if (blob && props.selectedBackground) {
        const resultUrl = await processLiveFrame(blob, props.selectedBackground.id)
        if (resultUrl) {
          // Libérer l'ancienne URL
          if (livePreviewImage.value) {
            URL.revokeObjectURL(livePreviewImage.value)
          }
          livePreviewImage.value = resultUrl
        }
      }
    }, 'image/jpeg', 0.7)
  } finally {
    isLiveProcessing.value = false
  }
}

// Capturer une photo haute qualité
const capturePhoto = async () => {
  if (!props.selectedBackground || capturing.value) return

  capturing.value = true

  try {
    const imageData = captureCameraPhoto(0.95)
    if (imageData) {
      emit('photo-captured', imageData)

      // Effet flash
      showCaptureFlash()
    }
  } catch (err) {
    console.error('Erreur capture:', err)
  } finally {
    capturing.value = false
  }
}

// Effet flash de capture
const showCaptureFlash = () => {
  const flash = document.createElement('div')
  flash.className = 'fixed inset-0 bg-white z-50 pointer-events-none'
  flash.style.animation = 'flash 0.3s ease-out'
  document.body.appendChild(flash)

  setTimeout(() => {
    document.body.removeChild(flash)
  }, 300)
}

// Réagir aux changements de fond
watch(() => props.selectedBackground, (newBg, oldBg) => {
  if (newBg && !oldBg && props.isLivePreview) {
    startLiveProcessing()
  } else if (!newBg && oldBg) {
    stopLiveProcessing()
    if (livePreviewImage.value) {
      URL.revokeObjectURL(livePreviewImage.value)
      livePreviewImage.value = ''
    }
  }
})

// Exposer des méthodes
defineExpose({
  switchCamera: async () => {
    await switchCamera()
    if (video.value && displayVideo.value) {
      displayVideo.value.srcObject = video.value.srcObject
    }
  }
})

// Nettoyage
onUnmounted(() => {
  stopLiveProcessing()
  stopCamera()
  if (livePreviewImage.value) {
    URL.revokeObjectURL(livePreviewImage.value)
  }
})
</script>

<style scoped>
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
</style>