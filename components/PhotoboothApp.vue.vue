<template>
  <div class="photobooth-app min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
    <!-- Header -->
    <PhotoboothHeader :current-step="currentStep" :selected-background="selectedBackground"
      :show-background-selector="showBackgroundSelector"
      @toggle-background-selector="showBackgroundSelector = !showBackgroundSelector" />

    <!-- Background Selector Overlay -->
    <BackgroundSelector v-if="showBackgroundSelector" :selected-background="selectedBackground"
      @select-background="selectBackground" @close="showBackgroundSelector = false" />

    <!-- Camera View -->
    <CameraView v-if="currentStep === 'camera'" ref="cameraComponent" :selected-background="selectedBackground"
      :is-live-preview="isLivePreview" @photo-captured="handlePhotoCapture" @switch-camera="handleSwitchCamera"
      @open-gallery="showGallery = true" />

    <!-- Edit View -->
    <EditView v-if="currentStep === 'edit'" :captured-image="capturedImage" :selected-background="selectedBackground"
      :is-processing="isProcessing" :processing-step="processingStep" @retake-photo="retakePhoto"
      @process-photo="processCurrentPhoto" @select-background="selectBackground" />

    <!-- Result View -->
    <ResultView v-if="currentStep === 'result'" :processed-image="processedImage"
      :selected-background="selectedBackground" @download="downloadCurrentPhoto" @share="shareCurrentPhoto"
      @new-photo="startNewPhoto" @try-another-background="tryAnotherBackground" />

    <!-- Loading Overlay -->
    <LoadingOverlay v-if="isProcessing" :message="processingStep" />

    <!-- Photo Gallery Modal -->
    <PhotoGallery v-if="showGallery" :photos="capturedPhotos" @close="showGallery = false" @download="downloadPhoto"
      @share="sharePhoto" @delete="deletePhoto" />

    <!-- Error Toast -->
    <ErrorToast v-if="error" :message="error" @dismiss="error = null" />
  </div>
</template>

<script setup lang="ts">
const {
  currentStep,
  isProcessing,
  processingStep,
  error,
  capturedImage,
  processedImage,
  capturedPhotos,
  selectedBackground,
  processPhoto,
  downloadPhoto,
  sharePhoto,
  deletePhoto,
  resetSession,
  startNewPhoto,
  setCapturedImage,
  setCurrentStep
} = usePhotobooth()

const cameraComponent = ref()
const showBackgroundSelector = ref(false)
const showGallery = ref(false)
const isLivePreview = ref(true)

const selectBackground = (background: any) => {
  selectedBackground.value = background
  showBackgroundSelector.value = false
}

const handlePhotoCapture = (imageData: string) => {
  setCapturedImage(imageData)
  setCurrentStep('edit')
}

const handleSwitchCamera = () => {
  if (cameraComponent.value?.switchCamera) {
    cameraComponent.value.switchCamera()
  }
}

const retakePhoto = () => {
  setCurrentStep('camera')
}

const processCurrentPhoto = async () => {
  if (!capturedImage.value || !selectedBackground.value) return

  try {
    // Convertir dataURL en blob
    const response = await fetch(capturedImage.value)
    const blob = await response.blob()

    await processPhoto(blob, selectedBackground.value.id, true)
  } catch (err) {
    console.error('Erreur traitement:', err)
  }
}

const downloadCurrentPhoto = () => {
  if (processedImage.value) {
    downloadPhoto(processedImage.value, `photobooth-${selectedBackground.value?.id}-${Date.now()}.png`)
  }
}

const shareCurrentPhoto = () => {
  if (processedImage.value) {
    sharePhoto(processedImage.value, {
      backgroundName: selectedBackground.value?.name
    })
  }
}

const tryAnotherBackground = () => {
  setCurrentStep('edit')
}

// Configuration PWA
useHead({
  title: 'Mon Photobooth - Créez vos photos avec des fonds personnalisés',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
  ]
})
</script>