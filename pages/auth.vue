<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md">
      <!-- Logo/Titre -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">📸 Photobooth</h1>
        <p class="text-white/70">Made in Conflans</p>
      </div>

      <!-- Tabs Connexion/Création -->
      <div class="flex mb-6 bg-white/10 rounded-lg p-1">
        <button 
          @click="activeTab = 'login'"
          :class="[
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            activeTab === 'login' 
              ? 'bg-white text-gray-900' 
              : 'text-white/70 hover:text-white'
          ]"
        >
          Connexion
        </button>
        <button 
          @click="activeTab = 'register'"
          :class="[
            'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
            activeTab === 'register' 
              ? 'bg-white text-gray-900' 
              : 'text-white/70 hover:text-white'
          ]"
        >
          Créer un compte
        </button>
      </div>

      <!-- Formulaire de connexion -->
      <div v-if="activeTab === 'login'" class="space-y-4">
        <h2 class="text-xl font-semibold text-white mb-4">Se connecter</h2>
        
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Email</label>
          <input 
            v-model="loginForm.email"
            type="email" 
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Mot de passe</label>
          <input 
            v-model="loginForm.password"
            type="password" 
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button 
          @click="handleLogin"
          :disabled="isLoading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Connexion...' : 'Se connecter' }}
        </button>

        <button 
          @click="activeTab = 'forgot'"
          class="w-full text-white/70 hover:text-white text-sm transition-colors"
        >
          Mot de passe oublié ?
        </button>
      </div>

      <!-- Formulaire de création de compte -->
      <div v-if="activeTab === 'register'" class="space-y-4">
        <h2 class="text-xl font-semibold text-white mb-4">Créer un compte</h2>
        
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Nom</label>
          <input 
            v-model="registerForm.name"
            type="text" 
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Votre nom"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Email</label>
          <input 
            v-model="registerForm.email"
            type="email" 
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Mot de passe</label>
          <input 
            v-model="registerForm.password"
            type="password" 
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Confirmer le mot de passe</label>
          <input 
            v-model="registerForm.confirmPassword"
            type="password" 
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button 
          @click="handleRegister"
          :disabled="isLoading"
          class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Création...' : 'Créer mon compte' }}
        </button>
      </div>

      <!-- Formulaire mot de passe oublié -->
      <div v-if="activeTab === 'forgot'" class="space-y-4">
        <h2 class="text-xl font-semibold text-white mb-4">Mot de passe oublié</h2>
        
        <div>
          <label class="block text-sm font-medium text-white/80 mb-2">Email</label>
          <input 
            v-model="forgotForm.email"
            type="email" 
            class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="votre@email.com"
          />
        </div>

        <button 
          @click="handleForgotPassword"
          :disabled="isLoading"
          class="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Envoi...' : 'Envoyer le lien' }}
        </button>

        <button 
          @click="activeTab = 'login'"
          class="w-full text-white/70 hover:text-white text-sm transition-colors"
        >
          ← Retour à la connexion
        </button>
      </div>

      <!-- Messages d'erreur/succès -->
      <div v-if="message" class="mt-4 p-3 rounded-lg text-sm" :class="messageType === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'">
        {{ message }}
      </div>

      <!-- Bouton pour continuer sans compte -->
      <div class="mt-6 pt-6 border-t border-white/20">
        <button 
          @click="continueAsGuest"
          class="w-full text-white/70 hover:text-white text-sm transition-colors"
        >
          Continuer sans compte (invité)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()

// État du composant
const activeTab = ref('login')
const isLoading = ref(false)
const message = ref('')
const messageType = ref('')

// Formulaires
const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const forgotForm = ref({
  email: ''
})

// Fonctions
const showMessage = (text, type = 'error') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    showMessage('Veuillez remplir tous les champs')
    return
  }

  isLoading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.value.email,
      password: loginForm.value.password
    })

    if (error) throw error

    showMessage('Connexion réussie !', 'success')
    setTimeout(() => {
      navigateTo('/')
    }, 1000)
  } catch (error) {
    showMessage(error.message)
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!registerForm.value.name || !registerForm.value.email || !registerForm.value.password) {
    showMessage('Veuillez remplir tous les champs')
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    showMessage('Les mots de passe ne correspondent pas')
    return
  }

  if (registerForm.value.password.length < 6) {
    showMessage('Le mot de passe doit contenir au moins 6 caractères')
    return
  }

  isLoading.value = true
  try {
    const { error } = await supabase.auth.signUp({
      email: registerForm.value.email,
      password: registerForm.value.password,
      options: {
        data: {
          name: registerForm.value.name
        }
      }
    })

    if (error) throw error

    showMessage('Compte créé avec succès !', 'success')
    setTimeout(() => {
      navigateTo('/')
    }, 1500)
  } catch (error) {
    showMessage(error.message)
  } finally {
    isLoading.value = false
  }
}

const handleForgotPassword = async () => {
  if (!forgotForm.value.email) {
    showMessage('Veuillez entrer votre email')
    return
  }

  isLoading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(forgotForm.value.email, {
      redirectTo: `${window.location.origin}/auth/reset`
    })

    if (error) throw error

    showMessage('Email de réinitialisation envoyé !', 'success')
  } catch (error) {
    showMessage(error.message)
  } finally {
    isLoading.value = false
  }
}

const continueAsGuest = () => {
  navigateTo('/')
}

// Meta
definePageMeta({
  layout: false,
  title: 'Authentification - Photobooth',
  middleware: 'guest'
})
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
