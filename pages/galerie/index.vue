<template>
  <div class="min-h-screen p-4 pb-24">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Ma Galerie</h1>
          <div class="flex items-center gap-3 mt-1">
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full text-sm font-medium"
                :class="totalPhotos >= 5 ? 'bg-red-700 text-white' : 'bg-[#33cccc] text-white'">
                {{ totalPhotos }}/5 photo{{ totalPhotos > 1 ? 's' : '' }}
              </span>
              <span v-if="totalPhotos >= 5" class="text-gray-800 text-xs">Limite atteinte</span>
            </div>
          </div>
        </div>
      </div>

      <!-- État de chargement -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p class="text-gray-800/60 mt-4">Chargement des photos...</p>
      </div>

      <!-- État vide -->
      <div v-else-if="photos.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📸</div>
        <p class="text-gray-800/70 text-lg mb-2">Aucune photo dans votre galerie</p>
        <p class="text-gray-800/50 text-sm mb-6">Prenez votre première photo pour commencer !</p>
        <NuxtLink to="/"
          class="inline-flex items-center gap-2 bg-blue-500 text-gray-800 px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
          <Icon name="heroicons:camera" class="w-5 h-5" />
          Prendre une photo
        </NuxtLink>
      </div>

      <!-- Modal limite atteinte -->
      <div v-if="totalPhotos >= 5 && showLimitModal" class="hidden fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div class="bg-white rounded-xl p-6 max-w-lg w-full relative shadow-2xl">
          <!-- Bouton fermer -->
          <button
            @click="showLimitModal = false"
            class="absolute top-3 right-3 text-gray-800 text-2xl hover:text-red-500 transition-colors"
            aria-label="Fermer la fenêtre"
          >
            ✕
          </button>
          <div class="text-6xl mb-4 flex justify-center">
            <Icon name="heroicons:photo" />
          </div>
          <h2 class="text-2xl font-bold text-[#33cccc] mb-2 text-center">
            Super vous avez utilisé vos photo gratuites !
          </h2>
          <p class="text-gray-700 mb-4 text-center">
            Vous souhaitez participer au jeu concours pour gagner un bon d'achat
            de 20€ à utiliser dans un commerce partenaire de notre appli de fidélité
          </p>

          <div class="bg-white/80 backdrop-blur rounded-lg p-4 mb-6">
            <p class="text-gray-800 font-semibold mb-6 flex items-center justify-center gap-2">
              <Icon name="heroicons:light-bulb" class="w-5 h-5" />
              Vous souhaitez plus de photos ?
            </p>
            <div class="grid grid-cols-2 gap-3 mb-2">
              <div class="bg-[#33cccc]/10 border border-[#33cccc] rounded-lg p-3 flex flex-col items-center">
                <span class="text-lg font-bold text-[#33cccc]">5 photos</span>
                <span class="text-gray-700 font-semibold mt-1">3€</span>
              </div>
              <div class="bg-[#33cccc]/10 border border-[#33cccc] rounded-lg p-3 flex flex-col items-center">
                <span class="text-lg font-bold text-[#33cccc]">10 photos</span>
                <span class="text-gray-700 font-semibold mt-1">5</span>
              </div>
              <div class="bg-[#33cccc]/10 border border-[#33cccc] rounded-lg p-3 flex flex-col items-center">
                <span class="text-lg font-bold text-[#33cccc]">15 photos</span>
                <span class="text-gray-700 font-semibold mt-1">7,50€</span>
              </div>
              <div class="bg-[#33cccc]/10 border border-[#33cccc] rounded-lg p-3 flex flex-col items-center">
                <span class="text-lg font-bold text-[#33cccc]">20 photos</span>
                <span class="text-gray-700 font-semibold mt-1">10€</span>
              </div>
            </div>
            <p class="text-gray-600 text-sm text-center pt-2">
              Choisissez le pack qui vous convient et venez payer sur le
              stand de made in Conflans & l'atelier de la fête
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <NuxtLink to="/acheter"
              class="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors shadow-lg font-semibold flex items-center justify-center gap-2">
              <Icon name="heroicons:shopping-cart" class="w-5 h-5" />
              Acheter des photos
            </NuxtLink>
            <NuxtLink to="/galerie"
              class="inline-block bg-[#33cccc] text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
              <Icon name="heroicons:folder" class="w-5 h-5" />
              Voir ma galerie
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Grid des photos -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div v-for="photo in filteredPhotos" :key="photo.id" class="relative group cursor-pointer"
          @click="openPhoto(photo)">
          <img :src="photo.photo_url" :alt="photo.background_name"
            class="w-full aspect-square object-cover rounded-lg transition-transform group-hover:scale-105"
            loading="lazy" />

          <!-- Badge de fond -->
          <div class="absolute top-2 left-2 bg-black/50 text-gray-800 text-xs px-2 py-1 rounded backdrop-blur">
            {{ photo.background_name }}
          </div>

          <!-- Actions au hover -->
          <div
            class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <div class="flex gap-2">
              <button @click.stop="openPhoto(photo)"
                class="bg-blue-500 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                <Icon name="heroicons:eye" class="w-5 h-5" />
              </button>
              <button @click.stop="sharePhoto(photo)"
                class="bg-green-500 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Icon name="heroicons:share" class="w-5 h-5" />
              </button>

              <!-- Bouton admin uniquement -->
              <button v-if="isAdmin" @click.stop="generatePreview(photo)" :disabled="generatingPreview === photo.id"
                class="bg-purple-500 text-gray-800 w-10 h-10 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :title="`Générer preview pour ${photo.background_name}`">
                <Icon v-if="generatingPreview !== photo.id" name="heroicons:sparkles" class="w-5 h-5" />
                <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </button>
            </div>
          </div>

          <!-- Date -->
          <div class="absolute bottom-2 right-2 bg-black/50 text-gray-800 text-xs px-2 py-1 rounded backdrop-blur">
            {{ formatDate(photo.created_at) }}
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="flex justify-center items-center gap-4 mt-8">
        <button @click="loadPage(pagination.page - 1)" :disabled="!pagination.hasPrevPage"
          class="px-4 py-2 bg-white/10 text-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors">
          <Icon name="heroicons:chevron-left" class="w-5 h-5" />
        </button>

        <span class="text-gray-800/70">
          Page {{ pagination.page }} sur {{ pagination.totalPages }}
        </span>

        <button @click="loadPage(pagination.page + 1)" :disabled="!pagination.hasNextPage"
          class="px-4 py-2 bg-white/10 text-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors">
          <Icon name="heroicons:chevron-right" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Toast de notification -->
    <div v-if="toast.show"
      class="fixed bottom-20 right-4 bg-green-600 text-gray-800 px-6 py-3 rounded-lg shadow-lg z-40">
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
const photos = ref([])
const isLoading = ref(true)
const activeFilter = ref('all')
const pagination = ref(null)
const totalPhotos = ref(0)
const currentUserId = ref(null)
const generatingPreview = ref(null)

// Filtres disponibles
const filters = [
  { value: 'all', label: 'Toutes' },
  { value: 'recent', label: 'Récentes' },
  { value: 'favorites', label: 'Favoris' }
]

// Toast
const toast = ref({
  show: false,
  message: ''
})

// Computed
const isAdmin = computed(() => {
  const ADMIN_ID = '262af476-2407-4d63-9641-fb03ce4b784f'
  return currentUserId.value === ADMIN_ID
})

const filteredPhotos = computed(() => {
  if (activeFilter.value === 'recent') {
    return photos.value.slice(0, 10) // 10 plus récentes
  }
  return photos.value
})

// Fonctions
const loadPhotos = async (page = 1) => {
  try {
    isLoading.value = true
    console.log('📸 Chargement des photos, page:', page)

    // Récupérer la session actuelle (le middleware garantit qu'on est connecté)
    const supabase = useSupabaseClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      console.log('❌ Session manquante - redirection vers /auth')
      await navigateTo('/auth')
      return
    }

    // Stocker l'userId pour vérifier si admin
    currentUserId.value = session.user.id
    console.log('✅ Utilisateur authentifié:', session.user.id)

    const response = await $fetch('/api/photos', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      query: {
        page,
        limit: 20
      }
    })

    console.log('📊 Réponse API photos:', {
      success: response.success,
      photosCount: response.photos?.length || 0,
      total: response.pagination?.total || 0
    })

    if (response.success) {
      photos.value = response.photos
      pagination.value = response.pagination
      totalPhotos.value = response.pagination.total
      console.log('✅ Photos chargées:', photos.value.length)
      console.log('📸 Première photo:', photos.value[0] ? {
        id: photos.value[0].id,
        url: photos.value[0].photo_url,
        background: photos.value[0].background_name
      } : 'Aucune photo')
    }

  } catch (error) {
    console.error('❌ Erreur chargement photos:', error)
    
    // Si erreur 401, rediriger vers auth
    if (error.statusCode === 401) {
      console.log('🔐 Token expiré - redirection vers /auth')
      await navigateTo('/auth')
      return
    }
    
    showToast('Erreur lors du chargement des photos')
  } finally {
    isLoading.value = false
  }
}

const loadPage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    loadPhotos(page)
  }
}

const openPhoto = (photo) => {
  console.log('🔍 Clic sur openPhoto:', {
    photoId: photo.id,
    photoUrl: photo.photo_url,
    backgroundName: photo.background_name
  })
  
  try {
    const route = `/galerie/${photo.id}/view`
    console.log('🚀 Navigation vers:', route)
    navigateTo(route)
  } catch (error) {
    console.error('❌ Erreur navigation:', error)
  }
}

const sharePhoto = (photo) => {
  navigateTo(`/galerie/${photo.id}/share`)
}

const generatePreview = async (photo) => {
  if (!isAdmin.value) {
    showToast('Accès refusé')
    return
  }

  try {
    generatingPreview.value = photo.id
    console.log('🎨 Génération preview pour:', {
      photoId: photo.id,
      backgroundId: photo.background_id,
      backgroundName: photo.background_name
    })

    const response = await $fetch('/api/admin/generate-preview', {
      method: 'POST',
      body: {
        photoId: photo.id,
        backgroundId: photo.background_id,
        backgroundName: photo.background_name
      }
    })

    if (response.success) {
      console.log('✅ Preview générée:', response.previewUrl)
      showToast(`Preview créée : ${response.backgroundName}`)
    }

  } catch (error) {
    console.error('❌ Erreur génération preview:', error)
    showToast('Erreur lors de la génération de la preview')
  } finally {
    generatingPreview.value = null
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
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
  console.log('🔍 Page galerie montée')
  loadPhotos()
})
</script>

<style scoped>
/* Animations personnalisées */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  animation: fadeIn 0.3s ease-out;
}

/* Scrollbar personnalisée */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
