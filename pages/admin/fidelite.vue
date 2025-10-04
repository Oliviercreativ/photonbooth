<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Administration Photobooth</h1>
            <p class="text-gray-600">Gestion des photos et utilisateurs</p>
            <div class="flex gap-2 mt-4">
              <NuxtLink
                to="/admin/dashboard"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="$route.path === '/admin/dashboard' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              >
                Newsletter
              </NuxtLink>
              <NuxtLink
                to="/admin/fidelite"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                :class="$route.path === '/admin/fidelite' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              >
                Fidélité
              </NuxtLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">
              Connecté en tant qu'administrateur
            </span>
            <button
              @click="logout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="heroicons:users" class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Utilisateurs inscrits
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ users.length }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="heroicons:photo" class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Photos totales
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ totalPhotos }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <Icon name="heroicons:envelope" class="h-6 w-6 text-gray-400" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Emails envoyés
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ emailsSent }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:px-6">
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Utilisateurs fidélité
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  Liste des utilisateurs inscrits à l'application de fidélité
                </p>
              </div>
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2">
                  <span class="text-sm font-medium text-gray-700">Filtrer par date :</span>
                  <select
                    v-model="selectedDate"
                    @change="filterByDate"
                    class="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">Toutes les dates</option>
                    <option value="2025-10-04">4 octobre 2025</option>
                    <option value="2025-10-05">5 octobre 2025</option>
                  </select>
                </label>
              </div>
            </div>

            <!-- Barre de recherche -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="heroicons:magnifying-glass" class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher par nom ou email..."
                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="text-center py-8">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 mx-auto animate-spin text-gray-400" />
          <p class="mt-2 text-gray-500">Chargement des utilisateurs...</p>
        </div>

        <div v-else-if="users.length === 0" class="text-center py-8">
          <Icon name="heroicons:users" class="w-12 h-12 mx-auto text-gray-400" />
          <p class="mt-2 text-gray-500">Aucun utilisateur trouvé</p>
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li v-for="user in paginatedUsers" :key="user.id" class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <!-- Afficher la miniature si elle existe, sinon l'icône par défaut -->
                    <div v-if="user.photo?.thumbnail" class="h-10 w-10 rounded-full overflow-hidden">
                      <img 
                        :src="user.photo.thumbnail" 
                        :alt="user.full_name_nl || user.email"
                        class="h-full w-full object-cover"
                        @error="user.photo = null"
                      />
                    </div>
                    <Icon v-else name="heroicons:user-circle" class="h-10 w-10 text-gray-400" />
                  </div>
                  <div class="ml-4">
                    <div class="flex items-center">
                      <p class="text-sm font-medium text-gray-900">
                        {{ user.full_name || 'Nom non renseigné' }}
                      </p>
                      <span v-if="!user.active" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactif
                      </span>
                      <span v-if="user.photo" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Icon name="heroicons:photo" class="w-3 h-3 mr-1" />
                        Photo
                      </span>
                      <span v-if="user.photo?.count" class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Count: {{ user.photo.count }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500">{{ user.email }}</p>
                    <p class="text-xs text-gray-400">
                      Inscrit le {{ formatDate(user.created_at) }}
                    </p>
                  </div>
                </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="selectUser(user)"
                  :class="user.photo 
                    ? 'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    : 'inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'"
                >
                  <Icon :name="user.photo ? 'heroicons:photo' : 'heroicons:plus'" class="w-4 h-4 mr-1" />
                  {{ user.photo ? 'Modifier photo' : 'Ajouter photo' }}
                </button>
                
                <!-- Bouton modifier count -->
                <button
                  v-if="user.photo?.id"
                  @click="editCount(user.photo)"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Icon name="heroicons:pencil" class="w-4 h-4 mr-1" />
                  Count
                </button>

                <!-- Bouton gérer crédits -->
                <button
                  @click="editCredits(user)"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Icon name="heroicons:star" class="w-4 h-4 mr-1" />
                  Crédits
                </button>
              </div>
            </div>
          </li>
        </ul>

        <!-- Pagination -->
        <div v-if="filteredUsers.length > itemsPerPage" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Affichage de
                <span class="font-medium">{{ startIndex + 1 }}</span>
                à
                <span class="font-medium">{{ Math.min(endIndex, filteredUsers.length) }}</span>
                sur
                <span class="font-medium">{{ filteredUsers.length }}</span>
                résultats
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="currentPage--"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="heroicons:chevron-left" class="h-5 w-5" />
                </button>
                <button
                  v-for="page in displayedPages"
                  :key="page"
                  @click="currentPage = page"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === currentPage
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="currentPage++"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Icon name="heroicons:chevron-right" class="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout de photo -->
    <div v-if="selectedUser" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">
              Ajouter une photo pour {{ selectedUser.full_name_nl || selectedUser.email }}
            </h3>
            <button
              @click="selectedUser = null"
              class="text-gray-400 hover:text-gray-600"
            >
              <Icon name="heroicons:x-mark" class="w-6 h-6" />
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner une photo
              </label>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>

            <div v-if="selectedFile" class="text-sm text-gray-600">
              Fichier sélectionné : {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})
            </div>

            <div class="flex justify-end space-x-3">
              <button
                @click="selectedUser = null"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                @click="uploadPhoto"
                :disabled="!selectedFile || isUploading"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Icon v-if="isUploading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                <Icon v-else name="heroicons:paper-airplane" class="w-4 h-4" />
                <span>{{ isUploading ? 'Upload...' : 'Envoyer' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const users = ref([])
const selectedUser = ref(null)
const selectedFile = ref(null)
const isLoading = ref(false)
const isUploading = ref(false)
const totalPhotos = ref(0)
const emailsSent = ref(0)

// Filtrage et pagination
const selectedDate = ref('') // Toutes les dates par défaut
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

// Utilisateurs filtrés par date et recherche
const filteredUsers = computed(() => {
  let filtered = users.value

  // Filtre par date
  if (selectedDate.value) {
    filtered = filtered.filter(user => {
      const userDate = new Date(user.created_at).toISOString().split('T')[0]
      return userDate === selectedDate.value
    })
  }

  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user => {
      const name = (user.full_name || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      return name.includes(query) || email.includes(query)
    })
  }

  return filtered
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)
const paginatedUsers = computed(() => filteredUsers.value.slice(startIndex.value, endIndex.value))

// Pages affichées dans la pagination (max 7 pages visibles)
const displayedPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else if (total > 1) {
    rangeWithDots.push(total)
  }

  return rangeWithDots.filter(p => p !== '...' || typeof p === 'string')
})

const filterByDate = () => {
  currentPage.value = 1 // Réinitialiser à la page 1 lors du filtrage
}

// Réinitialiser à la page 1 quand on recherche
watch(searchQuery, () => {
  currentPage.value = 1
})

// Charger les données au montage
onMounted(async () => {
  await loadUsers()
  await loadStats()
})

const loadUsers = async () => {
  isLoading.value = true
  try {
    // Charger depuis la table profiles au lieu de newsletter_subscribers
    const supabase = useSupabaseClient()
    const { data: profilesList, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      throw profilesError
    }

    const usersList = profilesList || []

    // Charger les photos et crédits pour chaque utilisateur
    for (const user of usersList) {
      try {
        const photoResponse = await $fetch('/api/photos/check', {
          query: { email: user.email }
        })

        if (photoResponse.success && photoResponse.photo) {
          user.photo = {
            id: photoResponse.photo.id,
            url: photoResponse.photo.url,
            thumbnail: photoResponse.photo.thumbnail,
            count: photoResponse.photo.count || 0
          }
        }
      } catch (error) {
        console.log('Pas de photo pour:', user.email)
      }
    }

    users.value = usersList
  } catch (error) {
    console.error('Erreur chargement utilisateurs fidélité:', error)
  } finally {
    isLoading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await $fetch('/api/admin/stats')
    totalPhotos.value = response.totalPhotos || 0
    emailsSent.value = response.emailsSent || 0
  } catch (error) {
    console.error('Erreur chargement stats:', error)
  }
}

const selectUser = (user) => {
  selectedUser.value = user
  selectedFile.value = null
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const uploadPhoto = async () => {
  if (!selectedFile.value || !selectedUser.value) return

  isUploading.value = true
  try {
    console.log('📸 Upload photo pour:', selectedUser.value.email, selectedUser.value.id)

    const formData = new FormData()
    formData.append('photo', selectedFile.value)
    formData.append('userId', selectedUser.value.id)
    formData.append('email', selectedUser.value.email)
    formData.append('fullName', selectedUser.value.full_name_nl || '')

    const response = await $fetch('/api/admin/upload-photo', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      console.log('✅ Photo uploadée avec succès:', response)
      
      // Ajouter la photo à l'utilisateur dans la liste
      const userIndex = users.value.findIndex(u => u.id === selectedUser.value.id)
      if (userIndex !== -1) {
        users.value[userIndex].photo = {
          id: response.photoId,
          url: response.photoUrl,
          thumbnail: response.thumbnailUrl
        }
      }
      
      selectedUser.value = null
      selectedFile.value = null
      await loadStats()
    } else {
      throw new Error(response.message || 'Erreur lors de l\'upload')
    }
  } catch (error) {
    console.error('Erreur upload photo:', error)
    alert('Erreur lors de l\'envoi de la photo: ' + (error.data?.message || error.message))
  } finally {
    isUploading.value = false
  }
}


const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const updatePhotoCount = async (photoId, newCount) => {
  try {
    console.log('🔢 Mise à jour du count:', { photoId, newCount })
    
    const response = await $fetch('/api/admin/update-count', {
      method: 'POST',
      body: {
        photoId: photoId,
        newCount: parseInt(newCount)
      }
    })
    
    if (response.success) {
      console.log('✅ Count mis à jour:', response)
      alert(`Count mis à jour avec succès !\nAncien: ${response.data.old_count}\nNouveau: ${response.data.new_count}`)
      
      // Recharger les données pour afficher la mise à jour
      await loadStats()
    } else {
      throw new Error(response.message || 'Erreur lors de la mise à jour')
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour count:', error)
    alert('Erreur lors de la mise à jour du count: ' + (error.data?.message || error.message))
  }
}

const editCount = (photo) => {
  const currentCount = photo.count || 0
  const newCount = prompt(`Modifier le count pour cette photo:\n\nCount actuel: ${currentCount}\n\nNouveau count:`, currentCount)

  if (newCount !== null && newCount !== '') {
    const parsedCount = parseInt(newCount)
    if (!isNaN(parsedCount) && parsedCount >= 0) {
      updatePhotoCount(photo.id, parsedCount)
    } else {
      alert('Veuillez entrer un nombre valide (positif ou zéro)')
    }
  }
}

const editCredits = async (user) => {
  const addCredits = prompt(`Ajouter des crédits pour ${user.full_name || user.email}:\n\nNombre de crédits à ajouter:`, 0)

  if (addCredits !== null && addCredits !== '') {
    const parsedCredits = parseInt(addCredits)
    if (!isNaN(parsedCredits) && parsedCredits >= 0) {
      await updateUserCredits(user.id, parsedCredits)
    } else {
      alert('Veuillez entrer un nombre valide (positif ou zéro)')
    }
  }
}

const updateUserCredits = async (userId, newCredits) => {
  try {
    console.log('💳 Mise à jour des crédits:', { userId, newCredits })

    const response = await $fetch('/api/admin/update-credits', {
      method: 'POST',
      body: {
        userId: userId,
        credits: parseInt(newCredits)
      }
    })

    if (response.success) {
      console.log('✅ Crédits mis à jour:', response)
      alert(`Crédits ajoutés avec succès !\nAncienne limite: ${response.data.old_limit} photos\nCrédits ajoutés: +${response.data.credits_added}\nNouvelle limite: ${response.data.new_limit} photos`)
    } else {
      throw new Error(response.message || 'Erreur lors de la mise à jour')
    }
  } catch (error) {
    console.error('❌ Erreur mise à jour crédits:', error)
    alert('Erreur lors de la mise à jour des crédits: ' + (error.data?.message || error.message))
  }
}

const logout = () => {
  navigateTo('/')
}

definePageMeta({
  layout: false,
  title: 'Fidélité Admin - Photobooth',
  middleware: 'admin'
})
</script>
