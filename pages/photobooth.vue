<template>
    <div class="min-h-screen bg-[#f7f5f2] px-4 py-12">
        <!-- Header -->
        <div class=" backdrop-blur-sm rounded-xl p-4 mb-4">
            <div class="flex justify-between items-center flex-col">
                <div class="flex items-center space-x-2 flex-col">
                    <NuxtLink to="https://madeinconflans.fr/fidelite"><img src="/logo-mic.svg" alt="Made in Conflans"
                            class="w-24" /></NuxtLink>
                    <div class="flex flex-col items-center justify-center">
                        <h1 class="text-2xl font-bold text-gray-900">Photobooth de l'Oktoberfest</h1>
                        <p class="text-gray-900/70">Samedi 4 octobre 2025</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contenu principal -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <!-- Message de chargement -->
            <div v-if="isLoading" class="text-center py-8">
                <Icon name="heroicons:arrow-path" class="w-8 h-8 mx-auto animate-spin text-gray-900 mb-4" />
                <p class="text-gray-900">Vérification de votre photo...</p>
            </div>

            <!-- Photo disponible -->
            <div v-else-if="userPhoto" class="text-center relative">
                <h2 class="text-xl font-bold text-gray-900 mb-4">🎉 Votre photo est prête !</h2>
                <p class="text-gray-900/70 mb-6">Découvrez votre photo de l'Oktoberfest</p>
                
                <!-- Message informatif sur le count -->
                <div v-if="userPhoto.count === 0" class="bg-orange-100 border-l-4 border-orange-500 p-4 mb-6 rounded">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-orange-400" />
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-orange-700">
                                <strong>Limite atteinte !</strong> Vous avez utilisé toutes vos modifications de fond disponibles. 
                                Créez un compte gratuitement pour obtenir 5 photos supplémentaires !
                            </p>
                        </div>
                    </div>
                </div>
                
                <div v-else-if="userPhoto.count > 0" class="bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <Icon name="heroicons:information-circle" class="h-5 w-5 text-blue-400" />
                        </div>
                        <div class="ml-3">
                            <p class="text-sm text-blue-700">
                                <strong>{{ userPhoto.count }} modification(s) restante(s)</strong> - Vous pouvez encore changer le fond de votre photo.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Photo en background avec protection -->
                <div class="relative w-full max-w-xl h-[500px] mx-auto mb-6 rounded-lg shadow-lg overflow-hidden"
                    :style="{ 
                        backgroundImage: `url(${userPhoto.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }" @contextmenu.prevent @dragstart.prevent @selectstart.prevent>
                    <!-- Overlay de protection -->
                    <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div class="text-gray-800 text-center">
                            <p class="text-sm opacity-80">Votre photo de l'Oktoberfest</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <!-- Bouton changer le fond - affiché seulement si count > 0 -->
                    <button v-if="userPhoto.count > 0" @click="changeBgPhoto" :disabled="isChangingBg"
                        class="w-full bg-[#33cccc] text-gray-800 font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Icon name="heroicons:sparkles" class="text-xl" :class="{ 'animate-spin': isChangingBg }" />
                        <span>{{ isChangingBg ? 'Génération...' : 'Changer le fond' }}</span>
                    </button>

                    <!-- Bouton créer un compte - affiché seulement si count = 0 -->
                    <button v-if="userPhoto.count === 0" @click="createAccountForMorePhotos"
                        class="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-gray-800 font-bold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center justify-center space-x-2">
                        <Icon name="heroicons:plus-circle" class="text-xl" />
                        <span>Créer un compte pour 5 photos supplémentaires</span>
                    </button>

                    <button @click="viewFullPhoto"
                        class="hidden w-full bg-[#33cccc] text-gray-800 font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                        <Icon name="heroicons:eye" class="text-xl" />
                        <span>Voir ma photo en grand</span>
                    </button>

                    <button @click="downloadPhoto"
                        class="w-full bg-green-600 text-gray-800 font-bold py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                        <Icon name="heroicons:arrow-down-tray" class="text-xl" />
                        <span>Télécharger ma photo</span>
                    </button>

                    <button @click="sharePhoto"
                        class="w-full bg-blue-600 text-gray-800 font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                        <Icon name="heroicons:share" class="text-xl" />
                        <span>Partager ma photo</span>
                    </button>
                </div>
            </div>

            <!-- Pas de photo - Message d'attente -->
            <div v-else class="text-center py-8">
                <Icon name="heroicons:clock" class="w-16 h-16 mx-auto text-gray-900 mb-6" />
                <h2 class="text-xl font-bold text-gray-900 mb-4">Votre photo arrive bientôt !</h2>
                <p class="text-gray-900/70 mb-6">
                    Nous travaillons sur votre photo de l'Oktoberfest.<br>
                    Elle sera disponible dans quelques instants.<br>
                    Nous vous préviendrons par email lorsque votre photo sera disponible.
                </p>


                <button @click="refreshPhoto" :disabled="isRefreshing"
                    class="bg-[#33cccc] text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto">
                    <Icon name="heroicons:arrow-path" class="w-5 h-5" :class="{ 'animate-spin': isRefreshing }" />
                    <span>{{ isRefreshing ? 'Vérification...' : 'Actualiser' }}</span>
                </button>
            </div>
        </div>

        <div class="mt-8 p-4 bg-yellow-100 rounded-xl text-gray-900">
            <h3 class="font-bold mb-2">Envie de plus de photos ?</h3>
            <p>
                Créez un compte gratuitement sur notre application de fidélité <a href="https://madeinconflans.grinch.fr" target="_blank" class="text-blue-600">madeinconflans.grinch.fr</a> et profitez de <span class="font-semibold">5 photos offertes</span> et gagner des points fidélités sur carte " made in Conflans "
            </p>
            <button @click="navigateTo('/auth')"
                class="mt-4 w-full bg-yellow-400 text-gray-800 font-bold py-2 rounded-lg hover:bg-yellow-500 transition-colors">
                Créer mon compte
            </button>
        </div>

        <div class="mt-8 bg-blue-100 rounded-xl text-gray-900 flex flex-col items-center gap-4">
            <div class="flex flex-col items-center justify-center">
                <NuxtLink to="https://madeinconflans.grinch.fr/" target="_blank">
                  <img src="https://madeinconflans.vercel.app/images/fidelite-conflans.webp" class="w-full rounded-lg" />
                </NuxtLink>
            </div>
            <div class="flex flex-col items-start justify-center p-2">
                <h3 class="font-medium mb-2 text-center">Rejoignez l'appli de fidélité Made in Conflans !</h3>
                <p class="mb-4 text-sm">
                    Cumulez des points à chaque achat, profitez d'offres exclusives et suivez vos avantages directement
                    sur
                    votre mobile.<br>
                    Inscrivez-vous dès maintenant pour ne rien manquer !
                </p>
                <!-- Ici vous pourrez ajouter une photo ou un visuel plus tard -->
                <a href="https://madeinconflans.grinch.fr" target="_blank" rel="noopener"
                    class="mt-2 text-sm w-full bg-blue-500 text-gray-800 font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors text-center block">
                    Je découvre l'appli fidélité
                </a>
            </div>
        </div>

        <div class="mt-8 bg-blue-100 rounded-xl text-gray-900 flex flex-col items-center gap-4">
            <div class="flex flex-col items-center justify-center">
                <NuxtLink to="https://madeinconflans.fr/" target="_blank">
                    <img src="https://madeinconflans.vercel.app/images/fidelite-conflans.webp" class="w-full rounded-lg" />
                </NuxtLink>
            </div>
            <div class="flex flex-col items-start justify-center p-2">
                <h3 class="font-medium mb-2 text-left">Découvrez plus de 80 commerçants, artisans de Conflans et
                    environs</h3>
                <p class="mb-4 text-sm">
                    Découvrez les commerçants, artisans, boutiques, restaurants, cafés, bars, hôtels, etc. de Conflans
                </p>
                <!-- Ici vous pourrez ajouter une photo ou un visuel plus tard -->
                <a href="https://madeinconflans.fr/annuaire" target="_blank" rel="noopener"
                    class="mt-2 text-sm w-full bg-blue-500 text-gray-800 font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors text-center block">
                    Découvrir l'annuaire
                </a>
            </div>
        </div>

        <!-- Bouton Concours -->
        <div class="mt-8 p-6 bg-orange-500 rounded-xl text-gray-800 text-center">
            <div class="flex items-center justify-center mb-4">
                <Icon name="heroicons:trophy" class="w-8 h-8 mr-3" />
                <h3 class="text-xl font-bold">Participez au concours photo !</h3>
            </div>
            <p class="mb-4 text-sm opacity-90">
                Partagez votre plus belle photo de l'Oktoberfest et tentez de gagner des lots exceptionnels !
            </p>
            <button @click="participateContest" 
                class="bg-white text-orange-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors shadow-lg">
                <Icon name="heroicons:camera" class="w-5 h-5 inline mr-2" />
                Participer au concours
            </button>
        </div>
    </div>

    <!-- Sélecteur de fonds -->
    <BackgroundSelectorGuest v-if="showBgSelector" @select="applyBackground" @close="closeBgSelector" />
</template>

<script setup>
// État du composant
const userEmail = ref('')
const fullName = ref('')
const sessionId = ref('')
const userPhoto = ref(null)
const isLoading = ref(true)
const isRefreshing = ref(false)
const isChangingBg = ref(false)
const showBgSelector = ref(false)

// Utiliser le composable pour gérer la session
const { getSession, clearSession } = usePhotoboothSession()

// Charger les données de session et vérifier la photo
onMounted(async () => {
  const sessionData = getSession()
  
  if (sessionData) {
    userEmail.value = sessionData.email || ''
    fullName.value = sessionData.fullName || ''
    sessionId.value = sessionData.sessionId || ''
    
    // Vérifier si une photo existe pour cet utilisateur
    await checkUserPhoto()
  } else {
    isLoading.value = false
  }
})

const checkUserPhoto = async () => {
  if (!userEmail.value) {
    isLoading.value = false
    return
  }

  try {
    console.log('🔍 Vérification photo pour:', userEmail.value)
    
    const response = await $fetch('/api/photos/check', {
      query: { email: userEmail.value }
    })

    if (response.success && response.photo) {
      userPhoto.value = response.photo
      console.log('✅ Photo trouvée:', response.photo.id)
    } else {
      console.log('⏳ Pas de photo encore disponible')
      userPhoto.value = null
    }
  } catch (error) {
    console.error('❌ Erreur vérification photo:', error)
    userPhoto.value = null
  } finally {
    isLoading.value = false
  }
}

const refreshPhoto = async () => {
  isRefreshing.value = true
  await checkUserPhoto()
  isRefreshing.value = false
}

const viewFullPhoto = () => {
  if (userPhoto.value) {
    const url = `/photo/${userPhoto.value.id}?email=${encodeURIComponent(userEmail.value)}&name=${encodeURIComponent(fullName.value)}`
    window.open(url, '_blank')
  }
}

const downloadPhoto = async () => {
  if (!userPhoto.value?.url) return

  try {
    console.log('📥 Téléchargement photo avec watermark...')
    
    // Appeler l'endpoint watermark pour obtenir la photo avec watermark
    const watermarkedResponse = await $fetch('/api/photo/watermark', {
      method: 'POST',
      body: {
        imageUrl: userPhoto.value.url,
        watermarkText: 'Made in Conflans - Oktoberfest'
      }
    })

    // Créer un blob à partir de la réponse
    const blob = new Blob([watermarkedResponse], { type: 'image/png' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `photobooth-oktoberfest-${userPhoto.value.id}-watermark.png`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
    console.log('✅ Photo téléchargée avec watermark')
  } catch (error) {
    console.error('❌ Erreur téléchargement:', error)
    // Fallback: télécharger sans watermark
    try {
      const response = await fetch(userPhoto.value.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photobooth-oktoberfest-${userPhoto.value.id}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (fallbackError) {
      console.error('❌ Erreur fallback téléchargement:', fallbackError)
    }
  }
}

const sharePhoto = async () => {
  if (!userPhoto.value) return

  const shareUrl = `${window.location.origin}/photo/${userPhoto.value.id}?email=${encodeURIComponent(userEmail.value)}&name=${encodeURIComponent(fullName.value)}`

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Ma photo de l\'Oktoberfest - Made in Conflans',
        text: 'Découvrez ma photo de l\'Oktoberfest !',
        url: shareUrl
      })
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Erreur partage:', error)
      }
    }
  } else {
    // Fallback : copier le lien
    try {
      await navigator.clipboard.writeText(shareUrl)
      console.log('✅ Lien copié dans le presse-papiers')
    } catch (error) {
      console.error('❌ Erreur copie:', error)
    }
  }
}

const handleImageError = () => {
  console.error('Erreur chargement image')
  userPhoto.value = null
}

const participateContest = async () => {
  if (!userPhoto.value?.url) {
    console.error('❌ Aucune photo disponible pour le concours')
    return
  }

  try {
    console.log('🏆 Participation au concours...')
    
    // Pour l'instant, on partage la photo sur les réseaux sociaux
    // Plus tard, on pourra intégrer un vrai système de concours
    
    const shareUrl = `${window.location.origin}/photo/${userPhoto.value.id}?email=${encodeURIComponent(userEmail.value)}&name=${encodeURIComponent(fullName.value)}`
    
    if (navigator.share) {
      // Partage natif sur mobile
      await navigator.share({
        title: 'Ma photo de l\'Oktoberfest - Concours Made in Conflans',
        text: 'Découvrez ma photo de l\'Oktoberfest ! Je participe au concours Made in Conflans 🏆',
        url: shareUrl
      })
      console.log('✅ Photo partagée pour le concours')
    } else {
      // Fallback : copier le lien
      await navigator.clipboard.writeText(shareUrl)
      console.log('✅ Lien de participation copié dans le presse-papiers')
    }
    
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('❌ Erreur participation concours:', error)
    }
  }
}

const changeBgPhoto = () => {
  showBgSelector.value = true
}

const applyBackground = async (background) => {
  if (!userPhoto.value?.url) return
  
  isChangingBg.value = true
  showBgSelector.value = false
  
  try {
    console.log('🎨 Début changement de fond pour photo:', userPhoto.value.id, 'Background:', background.name)
    
    // L'endpoint /api/photobooth-guest gère déjà les prompts en interne
    
    // Appeler l'API photobooth-guest pour changer le fond
    const response = await $fetch('/api/photobooth-guest', {
      method: 'POST',
      body: {
        imageUrl: userPhoto.value.url,
        backgroundId: background.id,
        highQuality: true,
        guestEmail: userEmail.value,
        guestSessionId: sessionId.value
      }
    })

    // L'endpoint retourne maintenant un objet JSON avec l'URL de la nouvelle image
    if (response && response.success && response.url) {
      // Mettre à jour la photo avec la nouvelle image générée
      userPhoto.value.url = response.url
      userPhoto.value.background_name = response.backgroundName || background.name
      
      console.log('✅ Fond changé avec succès:', response.url)
      
      // Récupérer les données mises à jour de la photo (incluant le nouveau count)
      try {
        console.log('🔄 Récupération des données mises à jour...')
        const updatedPhotoResponse = await $fetch('/api/photos/check', {
          query: { email: userEmail.value }
        })
        
        if (updatedPhotoResponse.success && updatedPhotoResponse.photo) {
          // Mettre à jour le count avec la valeur récupérée du serveur
          userPhoto.value.count = updatedPhotoResponse.photo.count || 0
          console.log('📊 Count mis à jour:', userPhoto.value.count)
        }
      } catch (error) {
        console.error('❌ Erreur récupération données mises à jour:', error)
        // En cas d'erreur, décrémenter manuellement le count
        if (userPhoto.value.count > 0) {
          userPhoto.value.count = userPhoto.value.count - 1
          console.log('📊 Count décrémenté manuellement:', userPhoto.value.count)
        }
      }
    } else {
      throw new Error(response?.message || 'Erreur lors de la génération du nouveau fond')
    }
  } catch (error) {
    console.error('❌ Erreur changement de fond:', error)

    // Gestion spécifique de la limite atteinte
    if (error.statusCode === 403 || error.data?.statusCode === 403) {
      const message = error.data?.statusMessage || error.statusMessage || 'Vous avez atteint la limite de changements de fond.'
      alert('🚫 ' + message)
    } else {
      alert('❌ Erreur lors du changement de fond. Veuillez réessayer.')
    }
  } finally {
    isChangingBg.value = false
  }
}

const closeBgSelector = () => {
  showBgSelector.value = false
}

const createAccountForMorePhotos = () => {
  console.log('🎯 Redirection vers création de compte pour plus de photos')
  // Rediriger vers la page d'authentification
  navigateTo('/auth')
}

const logout = () => {
  // Supprimer la session
  clearSession()
  
  // Rediriger vers l'authentification
  navigateTo('/auth')
}

// Meta
definePageMeta({
  layout: 'guest',
  title: 'Photobooth - Made in Conflans',
})
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
