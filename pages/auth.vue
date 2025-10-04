<template>
  <div class="min-h-screen  flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md">
      <!-- Logo/Titre -->
        <div class="flex flex-col items-center justify-center mb-4">
        <NuxtLink to="https://madeinconflans.fr"><img src="/logo-mic.svg" alt="Made in Conflans" class="w-24s mb-2" />
        </NuxtLink>
        <p class="text-xl font-bold text-gray-900">Photobooth du 4 octobre 2025</p>
        <p class="text-xl font-bold text-gray-900">L'Oktoberfest de Conflans</p>
        <p class="text-xl font-bold text-gray-900">Visitez made in Conflans</p>
        <p class="text-sm text-center font-normal text-gray-900">Vous pouvez vous connecter avec votre compte made in
          Conflans de votre appli de fidélité</p>
      </div>

      <!-- Tabs Connexion/Création -->
      <div class="flex mb-6 bg-white/10 rounded-lg p-1 gap-2">
        <button @click="activeTab = 'login'" :class="[
            'flex-1 py-2 px-4 border-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'login' 
              ? 'bg-[#33cccc] text-gray-800 font-bold' 
              : 'text-gray-900 hover:text-gray-900'
          ]">
          Connexion
        </button>
        <button @click="activeTab = 'register'" :class="[
            'flex-1 py-2 px-4 border-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'register' 
              ? 'bg-[#33cccc] text-gray-800 font-bold' 
              : 'text-gray-900 hover:text-gray-900'
          ]">
          Créer un compte
        </button>
      </div>

      <!-- Formulaire de connexion -->
      <div v-if="activeTab === 'login'" class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Se connecter</h2>

        <div>
          <label class="block text-sm font-medium text-gray-900/80 mb-2">Email</label>
          <input v-model="loginForm.email" type="email"
            class="w-full px-4 py-3 bg-white/20 border border-gray-800 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#33cccc]"
            placeholder="votre@email.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900/80 mb-2">Mot de passe</label>
          <input v-model="loginForm.password" type="password"
            class="w-full px-4 py-3 bg-white/20 border border-gray-800 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#33cccc]"
            placeholder="••••••••" />
        </div>

        <button @click="handleLogin" :disabled="isLoading"
          class="w-full bg-[#33cccc] text-gray-800 font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? 'Connexion...' : 'Se connecter' }}
        </button>

        <button @click="activeTab = 'forgot'"
          class="w-full text-gray-900/70 hover:text-gray-900 text-sm transition-colors">
          Mot de passe oublié ?
        </button>
      </div>

      <!-- Formulaire de création de compte -->
      <div v-if="activeTab === 'register'" class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Créer un compte</h2>

        <div>
          <label class="block text-sm font-medium text-gray-900/80 mb-2">Nom</label>
          <input v-model="registerForm.name" type="text"
            class="w-full px-4 py-3 bg-white/20 border border-gray-800 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#33cccc]"
            placeholder="Votre nom" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900/80 mb-2">Email</label>
          <input v-model="registerForm.email" type="email"
            class="w-full px-4 py-3 bg-white/20 border border-gray-800 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#33cccc]"
            placeholder="votre@email.com" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900/80 mb-2">Mot de passe</label>
          <input v-model="registerForm.password" type="password"
            class="w-full px-4 py-3 bg-white/20 border border-gray-800 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#33cccc]"
            placeholder="••••••••" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-900/80 mb-2">Confirmer le mot de passe</label>
          <input v-model="registerForm.confirmPassword" type="password"
            class="w-full px-4 py-3 bg-white/20 border border-gray-800 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#33cccc]"
            placeholder="••••••••" />
        </div>

        <button @click="handleRegister" :disabled="isLoading"
          class="w-full bg-[#33cccc] text-gray-800 font-bold py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? 'Création...' : 'Créer mon compte' }}
        </button>
      </div>

      <!-- Formulaire mot de passe oublié -->
      <div v-if="activeTab === 'forgot'" class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Mot de passe oublié</h2>

        <div>
          <label class="block text-sm font-medium text-gray-900/80 mb-2">Email</label>
          <input v-model="forgotForm.email" type="email"
            class="w-full px-4 py-3 bg-white/20 border border-green-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#33cccc]"
            placeholder="votre@email.com" />
        </div>

        <button @click="handleForgotPassword" :disabled="isLoading"
          class="w-full bg-[#33cccc] text-gray-800 font-bold py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? 'Envoi...' : 'Envoyer le lien' }}
        </button>

        <button @click="activeTab = 'login'"
          class="w-full text-gray-900/70 hover:text-gray-900 text-sm transition-colors">
          ← Retour à la connexion
        </button>
      </div>

      <!-- Messages d'erreur/succès -->
      <div v-if="message" class="mt-4 p-3 rounded-lg text-sm"
        :class="messageType === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'">
        {{ message }}
      </div>

      <!-- Bouton pour continuer sans compte -->
      <div class="mt-6 pt-6 border-t border-white/20">
        <button @click="continueAsGuest" class="w-full text-gray-900/70 hover:text-gray-900 text-sm transition-colors">
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
    const { data, error } = await supabase.auth.signUp({
      email: registerForm.value.email,
      password: registerForm.value.password,
      options: {
        data: {
          name: registerForm.value.name
        }
      }
    })

    if (error) throw error

    // Abonner automatiquement à la newsletter lors de la création de compte
    if (data.user) {
      try {
        await $fetch('/api/newsletter/subscribe', {
          method: 'POST',
          body: {
            email: registerForm.value.email,
            fullName: registerForm.value.name,
            userId: data.user.id
          }
        })
        console.log('✅ Abonnement newsletter automatique réussi')
      } catch (newsletterError) {
        console.warn('⚠️ Erreur abonnement newsletter automatique:', newsletterError)
        // Ne pas bloquer la création de compte si l'abonnement newsletter échoue
      }
    }

    showMessage('Compte créé avec succès ! Vous êtes abonné à notre newsletter.', 'success')
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
  // Utiliser le composable pour vérifier la session
  const { hasSession, getEmail } = usePhotoboothSession()
  
  if (hasSession()) {
    console.log('✅ Session photobooth trouvée, redirection vers /photobooth:', getEmail())
    navigateTo('/photobooth')
  } else {
    console.log('🚫 Pas de session photobooth, redirection vers /guest')
    navigateTo('/guest')
  }
}

// Meta
definePageMeta({
  layout: 'auth',
  title: 'Connexion ou création de compte',
})
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
