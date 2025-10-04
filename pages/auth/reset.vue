<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md">
      <!-- Logo/Titre -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">🔑 Nouveau mot de passe</h1>
        <p class="text-gray-800/70">Photobooth Made in Conflans</p>
      </div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Définir un nouveau mot de passe</h2>
        
        <div>
          <label class="block text-sm font-medium text-gray-800/80 mb-2">Nouveau mot de passe</label>
          <input 
            v-model="passwordForm.password"
            type="password" 
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-gray-800 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-800/80 mb-2">Confirmer le mot de passe</label>
          <input 
            v-model="passwordForm.confirmPassword"
            type="password" 
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-gray-800 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button 
          @click="handleResetPassword"
          :disabled="isLoading"
          class="w-full bg-blue-600 text-gray-800 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe' }}
        </button>

        <!-- Messages d'erreur/succès -->
        <div v-if="message" class="mt-4 p-3 rounded-lg text-sm" :class="messageType === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'">
          {{ message }}
        </div>

        <!-- Retour à la connexion -->
        <div class="mt-6 pt-6 border-t border-white/20 text-center">
          <NuxtLink to="/auth" class="text-gray-800/70 hover:text-gray-800 text-sm transition-colors">
            ← Retour à la connexion
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const route = useRoute()

// État du composant
const isLoading = ref(false)
const message = ref('')
const messageType = ref('')

// Formulaire
const passwordForm = ref({
  password: '',
  confirmPassword: ''
})

// Fonctions
const showMessage = (text, type = 'error') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const handleResetPassword = async () => {
  if (!passwordForm.value.password || !passwordForm.value.confirmPassword) {
    showMessage('Veuillez remplir tous les champs')
    return
  }

  if (passwordForm.value.password !== passwordForm.value.confirmPassword) {
    showMessage('Les mots de passe ne correspondent pas')
    return
  }

  if (passwordForm.value.password.length < 6) {
    showMessage('Le mot de passe doit contenir au moins 6 caractères')
    return
  }

  isLoading.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.value.password
    })

    if (error) throw error

    showMessage('Mot de passe mis à jour avec succès !', 'success')
    setTimeout(() => {
      navigateTo('/auth')
    }, 2000)
  } catch (error) {
    showMessage(error.message)
  } finally {
    isLoading.value = false
  }
}

// Meta
definePageMeta({
  layout: false,
  title: 'Réinitialisation - Photobooth'
})
</script>
