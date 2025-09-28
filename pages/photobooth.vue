<template>
    <div class="min-h-screen bg-[#f7f5f2] py-12">
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

        <!-- Informations utilisateur -->
        <div class=" backdrop-blur-sm rounded-xl p-4 mb-4">
            <div class="text-gray-900">
                <p class="text-sm text-gray-900/70">Nom : {{ fullName }}</p>
                <p class="text-sm text-gray-900/70">Email : {{ userEmail }}</p>
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
            <div v-else-if="userPhoto" class="text-center">
                <h2 class="text-xl font-bold text-gray-900 mb-4">🎉 Votre photo est prête !</h2>
                <p class="text-gray-900/70 mb-6">Découvrez votre photo de l'Oktoberfest</p>
                
                <div class="relative inline-block mb-6">
                    <img
                        :src="userPhoto.url"
                        :alt="fullName || 'Votre photo'"
                        class="w-full max-w-md h-auto rounded-lg shadow-lg"
                        @error="handleImageError"
                    />
                </div>

                <div class="space-y-3">
                    <button
                        @click="viewFullPhoto"
                        class="w-full bg-[#33cccc] text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        <Icon name="heroicons:eye" class="text-xl" />
                        <span>Voir ma photo en grand</span>
                    </button>

                    <button
                        @click="downloadPhoto"
                        class="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        <Icon name="heroicons:arrow-down-tray" class="text-xl" />
                        <span>Télécharger ma photo</span>
                    </button>

                    <button
                        @click="sharePhoto"
                        class="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                    >
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
            

                <button
                    @click="refreshPhoto"
                    :disabled="isRefreshing"
                    class="bg-[#33cccc] text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2 mx-auto"
                >
                    <Icon name="heroicons:arrow-path" class="w-5 h-5" :class="{ 'animate-spin': isRefreshing }" />
                    <span>{{ isRefreshing ? 'Vérification...' : 'Actualiser' }}</span>
                </button>
            </div>
        </div>

        <div class="mt-8 p-4 bg-yellow-100 rounded-xl text-gray-900">
            <h3 class="font-bold mb-2">Envie de plus de photos ?</h3>
            <p>
                Créez un compte gratuitement et profitez de <span class="font-semibold">4 photos offertes</span>
            </p>
            <button @click="navigateTo('/auth')"
                class="mt-4 w-full bg-yellow-400 text-white font-bold py-2 rounded-lg hover:bg-yellow-500 transition-colors">
                Créer mon compte
            </button>
        </div>
        <div class="mt-8 p-4 bg-blue-100 rounded-xl text-gray-900 flex flex-col items-center">
            <h3 class="font-bold mb-2 text-center">Rejoignez l'appli de fidélité Made in Conflans !</h3>
            <p class="mb-4 text-center">
                Cumulez des points à chaque achat, profitez d'offres exclusives et suivez vos avantages directement sur votre mobile.<br>
                Inscrivez-vous dès maintenant pour ne rien manquer !
            </p>
            <!-- Ici vous pourrez ajouter une photo ou un visuel plus tard -->
            <button
                @click="navigateTo('https://madeinconflans.fr/fidelite')"
                class="mt-2 w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
                Je découvre l'appli fidélité
            </button>
        </div>
        <div class="mt-8 p-4 bg-pink-100 rounded-xl text-gray-900">
            <h3 class="font-bold mb-2">Si vous souhaitez plus de photos, prenez le pack 5, 10, 15, 20 photos</h3>
            <p class="font-bold mb-2">Tarifs</p>
            <p>
                5 photos : 3€<br>
                10 photos : 5€<br>
                15 photos : 7€<br>
                20 photos : 9€<br>
            </p>
            <a href="https://madeinconflans.fr/giagia-cafe" target="_blank" rel="noopener"
                class="mt-4 inline-block w-full bg-pink-400 text-white font-bold py-2 rounded-lg hover:bg-pink-500 transition-colors text-center">
                Rendez-vous sur le stand de made in Conflans
            </a>
        </div>
    </div>
</template>

<script setup>
// État du composant
const userEmail = ref('')
const fullName = ref('')
const sessionId = ref('')
const userPhoto = ref(null)
const isLoading = ref(true)
const isRefreshing = ref(false)

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
  } catch (error) {
    console.error('Erreur téléchargement:', error)
    alert('Erreur lors du téléchargement')
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
      alert('Lien copié dans le presse-papiers !')
    } catch (error) {
      console.error('Erreur copie:', error)
      alert('Impossible de copier le lien')
    }
  }
}

const handleImageError = () => {
  console.error('Erreur chargement image')
  userPhoto.value = null
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
