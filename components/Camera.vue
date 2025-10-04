<template>
  <div class="camera-container">

    <!-- Onglet Caméra -->
    <div v-if="activeMobileTab === 'camera'" class="h-full w-full relative pb-20">
      <!-- Bouton choisir fond en haut -->
    <div class="absolute top-4 left-4 right-4 z-20">
        <button @click="openBackgroundSelector"
          class="w-full bg-white/50 text-gray-900 px-6 py-2 rounded-full text-lg font-semibold backdrop-blur shadow-lg min-h-[56px] touch-manipulation">
          {{ selectedBackground?.name || 'Choisir un effet' }}
        </button>
      </div>

      <!-- Sélecteur de fond -->
      <BackgroundSelector 
        v-if="showBackgroundSelector"
        @select="handleBackgroundSelect"
        @close="showBackgroundSelector = false"
      />
    </div>

    <!-- Onglet Photos -->
    <div v-if="activeMobileTab === 'photos'" class="h-full w-full relative pb-20">
      <div class="p-4 pt-16">
        <h2 class="text-gray-800 text-2xl font-bold mb-6 text-center">Mes Photos</h2>

        <!-- Galerie des photos -->
        <div v-if="capturedPhotos.length > 0" class="grid grid-cols-2 gap-4">
          <div v-for="(photo, index) in capturedPhotos" :key="index"
            class="relative aspect-square rounded-xl overflow-hidden shadow-lg">
            <img :src="photo.processedImage" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
              <div class="absolute bottom-2 left-2 right-2">
                <p class="text-gray-800 text-sm font-medium truncate">{{ photo.backgroundName }}</p>
                <p class="text-gray-800/80 text-xs">{{ new Date(photo.timestamp).toLocaleTimeString() }}</p>
              </div>
            </div>
            <!-- Bouton de téléchargement -->
            <button @click="downloadPhoto(photo)"
              class="absolute top-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg touch-manipulation">
              <span class="text-gray-800 text-sm">⬇️</span>
        </button>
          </div>
        </div>

        <!-- Message si pas de photos -->
        <div v-else class="flex flex-col items-center justify-center h-64 text-white">
          <span class="text-6xl mb-4">📷</span>
          <p class="text-lg font-medium">Aucune photo prise</p>
          <p class="text-sm text-center mt-2">Prenez votre première photo avec la caméra !</p>
        </div>
      </div>
    </div>

    <!-- Vidéo avec contraintes de résolution -->
    <div v-if="activeMobileTab === 'camera'" class="fixed inset-0 z-0">
      <!-- Caméra active -->
      <video v-if="isCameraActive" ref="videoElement" autoplay playsinline muted class="w-full h-full object-contain"
        :class="{ mirror: frontCamera }"></video>
      
      <!-- Caméra éteinte -->
      <div v-else class="w-full h-full bg-gray-900 flex items-center justify-center">
        <div class="text-center text-white">
          <p class="text-lg font-medium mb-2">Caméra éteinte</p>
          <p class="text-sm opacity-75">Sélectionnez un fond pour activer la caméra</p>
        </div>
      </div>
    </div>

    <canvas ref="canvasElement" class="hidden"></canvas>

    <!-- Guide de positionnement -->
    <div v-if="selectedBackground && activeMobileTab === 'camera' && isCameraActive"
      class="absolute inset-8 border-2 border-white/60 pointer-events-none rounded-lg">
      <div class="absolute -top-8 left-0 bg-black/70 text-gray-800 text-xs px-2 py-1 rounded">
      </div>
    </div>

    <!-- État de traitement -->
    <div v-if="isProcessing" class="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div class="text-center text-gray-800 bg-black/80 p-6 rounded-xl">
        <p class="text-lg font-medium">{{ processingStep }}</p>
        <p class="text-sm opacity-75 mt-2">Analyse votre photo...</p>
      </div>
    </div>

    <!-- Contrôles -->
    <div v-if="activeMobileTab === 'camera'" class="absolute bottom-24 left-0 right-0 px-4">
      <div class="flex items-center justify-between">
        <!-- Switch Camera -->
        <button @click="switchCamera"
          class="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-gray-800 text-xl backdrop-blur touch-manipulation"
          :disabled="!isReady || isProcessing || !isCameraActive">
          <Icon name="heroicons:arrow-path" />
        </button>

        <!-- Capture Button -->
        <button @click="capturePhoto"
          class="w-24 h-24 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center shadow-xl transition-transform touch-manipulation"
          :disabled="!isReady || !selectedBackground || isProcessing || !isCameraActive || isPhotoLimitReached"
          :class="[
            isProcessing ? 'animate-pulse' : 'active:scale-95',
            isPhotoLimitReached ? 'opacity-50 cursor-not-allowed' : ''
          ]">
          <div class="w-16 h-16 rounded-full flex items-center justify-center"
            :class="isPhotoLimitReached ? 'bg-gray-400' : 'bg-red-500'">
            <Icon
              v-if="isProcessing"
              name="heroicons:clock"
              class="text-gray-800 text-sm"
            />
            <Icon
              v-else-if="isPhotoLimitReached"
              name="heroicons:x-mark"
              class="text-gray-800 text-2xl"
            />
            <Icon
              v-else
              name="heroicons:camera"
              class="text-gray-800 text-2xl"
            />
          </div>
        </button>
        <!-- Photos prises -->
        <div class="relative">
          <span v-if="capturedPhotos.length > 0"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-gray-800 flex items-center justify-center">
            {{ capturedPhotos.length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const props = defineProps({
  initialBackground: {
    type: Object,
    default: null
  },
  isPhotoLimitReached: {
    type: Boolean,
    default: false
  }
})

const videoElement = ref(null)
const canvasElement = ref(null)
const isReady = ref(false)
const isProcessing = ref(false)
const processingStep = ref('')
const selectedBackground = ref(null)
const isCameraActive = ref(false)
const showBackgroundSelector = ref(false)
const frontCamera = ref(true)
const capturedPhotos = ref([])
const activeMobileTab = ref('camera')
const currentSessionId = ref(null)

const emit = defineEmits(['photo-captured', 'show-gallery'])


onMounted(async () => {
  // Apply initial background if provided
  if (props.initialBackground) {
    selectedBackground.value = props.initialBackground
    console.log('🎬 Initial background applied:', props.initialBackground.name)
    // Activate camera when background is selected
    if (!isCameraActive.value) {
      console.log('🎬 Activating camera - initial background selected')
      isCameraActive.value = true
    }
  }
  // Do not start camera automatically if no background
})

// Watcher to start camera when activated
watch(isCameraActive, async (newValue) => {
  if (newValue && !isReady.value) {
    console.log('👀 Watcher: isCameraActive = true, starting camera')
    await nextTick() // Ensure video element is in DOM
  await startCamera()
  }
})

const startCamera = async () => {
  try {
    console.log('🎬 Démarrage de la caméra...', {
      frontCamera: frontCamera.value,
      videoElement: videoElement.value ? 'Présent' : 'Manquant'
    })

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
        aspectRatio: { ideal: 16 / 9 },
        frameRate: { ideal: 30, max: 60 }
      }
    }

    console.log('📹 Contraintes caméra:', constraints)
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    console.log('✅ Stream obtenu:', {
      active: stream.active,
      tracks: stream.getVideoTracks().length
    })

    if (videoElement.value) {
      console.log('📺 Assignation du stream à l\'élément vidéo')
      videoElement.value.srcObject = stream
      console.log('✅ Stream assigné:', videoElement.value.srcObject)

      // Marquer la caméra comme active immédiatement
      isCameraActive.value = true
      console.log('✅ Caméra marquée comme active')

      // Forcer la lecture de la vidéo
      videoElement.value.play().then(() => {
        console.log('▶️ Vidéo en cours de lecture')
      }).catch((playError) => {
        console.error('❌ Erreur lecture vidéo:', playError)
      })

      // Attendre que la vidéo soit chargée
      videoElement.value.onloadedmetadata = () => {
        isReady.value = true
        console.log(
          `✅ Caméra initialisée: ${videoElement.value.videoWidth}x${videoElement.value.videoHeight}`
        )
      }

      // Gérer les erreurs de lecture
      videoElement.value.onerror = (error) => {
        console.error('❌ Erreur vidéo:', error)
      }

      // Vérifier l'état de la vidéo après un délai
      setTimeout(() => {
        console.log('🔍 État vidéo après 500ms:', {
          readyState: videoElement.value.readyState,
          paused: videoElement.value.paused,
          ended: videoElement.value.ended,
          srcObject: videoElement.value.srcObject ? 'Présent' : 'Absent'
        })
      }, 500)
    } else {
      console.error('❌ Élément vidéo non trouvé lors de l\'assignation du stream')
    }
  } catch (error) {
    console.error('Erreur accès caméra:', error)
    alert("Impossible d'accéder à la caméra. Vérifiez les permissions.")
  }
}

const stopCamera = () => {
  if (videoElement.value?.srcObject) {
    const tracks = videoElement.value.srcObject.getTracks()
    tracks.forEach((track) => track.stop())
    videoElement.value.srcObject = null
  }
  isReady.value = false
  isCameraActive.value = false
  console.log('📹 Caméra arrêtée')
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

const handleBackgroundSelect = (background) => {
  selectedBackground.value = background
  showBackgroundSelector.value = false
  
  // Activer la caméra quand un fond est sélectionné
  if (!isCameraActive.value) {
    console.log('🎬 Activation de la caméra - fond sélectionné:', background.name)
    isCameraActive.value = true
  }
}

const openBackgroundSelector = () => {
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
          processingStep.value = 'Analyse la photo...'

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
            processingStep.value = 'Sauvegarde...'

            const resultBlob = await response.blob()
            const photoUrl = URL.createObjectURL(resultBlob)

            // Créer une miniature
            let thumbnailBlob = null
            try {
              // Créer un canvas pour la miniature
              const thumbnailCanvas = document.createElement('canvas')
              const thumbnailCtx = thumbnailCanvas.getContext('2d')

              // Calculer les dimensions pour 200x200 max
              const maxSize = 200
              const ratio = Math.min(maxSize / canvas.width, maxSize / canvas.height)
              thumbnailCanvas.width = canvas.width * ratio
              thumbnailCanvas.height = canvas.height * ratio

              // Dessiner la miniature
              if (frontCamera.value) {
                thumbnailCtx.scale(-1, 1)
                thumbnailCtx.drawImage(video, -thumbnailCanvas.width, 0, thumbnailCanvas.width, thumbnailCanvas.height)
                thumbnailCtx.scale(-1, 1)
              } else {
                thumbnailCtx.drawImage(video, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height)
              }

              // Convertir en blob avec compression
              thumbnailBlob = await new Promise(resolve => {
                thumbnailCanvas.toBlob(resolve, 'image/jpeg', 0.6)
              })
            } catch (error) {
              console.warn('Erreur création miniature:', error)
            }

            // Convertir le blob en base64 pour l'upload
            const reader = new FileReader()
            reader.onload = async () => {
              const base64 = reader.result.split(',')[1] // Enlever le préfixe data:image/...
              
              try {
                // Upload vers Supabase Storage avec authentification
                const { data: { session } } = await supabase.auth.getSession()
                
                console.log('🔍 Session utilisateur:', session?.user?.id ? 'Connecté' : 'Non connecté')
                console.log('🔍 Token:', session?.access_token ? 'Présent' : 'Manquant')
                
                const uploadResponse = await fetch('/api/upload-photo-auth', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                  },
                  body: JSON.stringify({
                    imageBase64: base64,
                    backgroundId: selectedBackground.value.id
                  })
                })

                const uploadResult = await uploadResponse.json()

                if (uploadResponse.ok) {
                  console.log('✅ Photo uploadée dans Supabase:', uploadResult.fileName)
                  console.log('📸 Photo ID:', uploadResult.photoId)

                  // Rediriger vers la page de visualisation de la photo
                  if (uploadResult.photoId) {
                    console.log('🚀 Redirection vers /galerie/' + uploadResult.photoId + '/view')

                    // Arrêter la caméra avant la redirection
                    console.log('📷 Arrêt de la caméra - redirection vers galerie')
                    stopCamera()

                    // Petit délai pour s'assurer que l'image est disponible sur Supabase
                    console.log('⏳ Attente de 2 secondes avant redirection...')
                    processingStep.value = 'Redirection vers la galerie...'
                    setTimeout(async () => {
                      await navigateTo('/galerie/' + uploadResult.photoId + '/view')
                    }, 2000)
                    return // Arrêter l'exécution ici pour éviter les actions suivantes
                  }
                } else if (uploadResponse.status === 403) {
                  // Gestion de la limite de photos atteinte
                  console.log('🚫 Limite de photos atteinte')
                  isProcessing.value = false
                  processingStep.value = ''
                  stopCamera()
                  alert(uploadResult.statusMessage || 'Vous avez atteint la limite de 5 photos. Supprimez une photo existante pour en créer une nouvelle.')
                  return
                } else {
                  console.error('❌ Erreur upload Supabase:', uploadResult)
                }
              } catch (uploadError) {
                console.error('❌ Erreur upload:', uploadError)
              }
            }
            reader.readAsDataURL(resultBlob)

            // Cette partie ne s'exécutera que si la redirection n'a pas eu lieu
            // (en cas d'erreur d'upload par exemple)
            
            // Sauvegarder la photo traitée localement
            const processedPhoto = {
              id: Date.now(),
              url: photoUrl, // URL locale du blob
              originalUrl: canvas.toDataURL('image/jpeg', 0.8),
              background: selectedBackground.value.name,
              backgroundId: selectedBackground.value.id,
              timestamp: new Date().toLocaleString(),
              processed: true,
              supabaseId: null, // Pas d'ID Supabase en cas d'erreur
              thumbnailUrl: null
            }

            capturedPhotos.value.unshift(processedPhoto)

            console.log(
              'Photo traitée (sans upload):',
              selectedBackground.value.name
            )

            // Émettre l'événement avec la photo traitée
            emit('photo-captured', processedPhoto)

            // Succès!
            processingStep.value = 'Photo terminée !' 
            setTimeout(() => {
              isProcessing.value = false
              processingStep.value = ''
              selectedBackground.value = null
              
              // Arrêter la caméra après la capture
              console.log('📷 Arrêt de la caméra - photo terminée')
              stopCamera()
            }, 1000)
          } else {
            throw new Error(`Erreur API: ${response.status}`)
          }
        } catch (error) {
          console.error('Erreur traitement:', error)

          // Fallback: sauvegarder la photo originale
          const originalPhoto = {
            id: Date.now(),
            url: canvas.toDataURL('image/jpeg', 0.8),
            background: 'Photo originale',
            backgroundId: 'original',
            timestamp: new Date().toLocaleString(),
            processed: false,
            error: true,
            supabaseId: null
          }

          capturedPhotos.value.unshift(originalPhoto)
          emit('photo-captured', originalPhoto)

          alert('Erreur lors du traitement IA. Photo originale sauvegardée.')
          isProcessing.value = false
          processingStep.value = ''
          
          // Arrêter la caméra même en cas d'erreur
          console.log('📷 Arrêt de la caméra - erreur de traitement')
          stopCamera()
        }
      },
      'image/jpeg',
      0.95
    )
  } catch (error) {
    console.error('Erreur capture:', error)
    isProcessing.value = false
    processingStep.value = ''
    
    // Arrêter la caméra en cas d'erreur de capture
    console.log('📷 Arrêt de la caméra - erreur de capture')
    stopCamera()
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
  height: 100vh;
  background: #000;
  border-radius: 0.75rem;
  overflow: hidden;
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
    height: 100%;
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
button,
input,
select,
textarea {
  touch-action: manipulation;
}

/* Amélioration des transitions pour mobile */
@media (prefers-reduced-motion: no-preference) {
  .transition-transform {
    transition-duration: 150ms;
  }
}
</style>