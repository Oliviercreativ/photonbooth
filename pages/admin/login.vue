<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Administration Photobooth
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Connexion sécurisée
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="admin-id" class="sr-only">ID Admin</label>
            <input
              id="admin-id"
              v-model="adminId"
              name="admin-id"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="ID Administrateur"
            />
          </div>
          <div>
            <label for="admin-password" class="sr-only">Mot de passe</label>
            <input
              id="admin-password"
              v-model="adminPassword"
              name="admin-password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Mot de passe administrateur"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="heroicons:lock-closed" class="w-5 h-5 mr-2" />
            {{ isLoading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
          {{ errorMessage }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const adminId = ref('')
const adminPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/admin/login', {
      method: 'POST',
      body: {
        adminId: adminId.value,
        password: adminPassword.value
      }
    })

    if (response.success) {
      // Stocker le token admin dans localStorage
      localStorage.setItem('admin_token', response.token)
      
      // Rediriger vers le dashboard
      await navigateTo('/admin/dashboard')
    } else {
      errorMessage.value = response.message || 'Identifiants incorrects'
    }
  } catch (error) {
    console.error('Erreur connexion admin:', error)
    errorMessage.value = 'Erreur de connexion'
  } finally {
    isLoading.value = false
  }
}

// Rediriger si déjà connecté
onMounted(() => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    navigateTo('/admin/dashboard')
  }
})

definePageMeta({
  layout: false,
  title: 'Connexion Admin - Photobooth'
})
</script>
