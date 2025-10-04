<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md">
      <!-- Logo/Titre -->
      <div class="flex flex-col items-center justify-center mb-6">
        <NuxtLink to="https://madeinconflans.fr">
          <img src="/logo-mic.svg" alt="Made in Conflans" class="w-24 mb-4" />
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
          <Icon name="heroicons:user" class="text-2xl" />
          <span>Mode Invité</span>
        </h1>
        <p class="text-sm text-center text-gray-900">
          « En vous inscrivant à la newsletter, vous bénéficiez d’une photo offerte sur le photobooth. On prend la photo
          et elle est ajoutée automatiquement dans votre galerie. Pas besoin de créer de compte ! »
        </p>
      </div>

      <!-- Formulaire email pour actualités -->
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-900/80 mb-2">
            Prénom et Nom
          </label>
          <input v-model="guestForm.fullName" type="text"
            class="w-full px-4 py-3 bg-white/20 border border-gray-800 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#33cccc]"
            placeholder="Jean Dupont" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900/80 mb-2">
            Email
          </label>
          <input v-model="guestForm.email" type="email"
            class="w-full px-4 py-3 bg-white/20 border border-gray-800 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#33cccc]"
            placeholder="votre@email.com" required />
        </div>

        <div class="text-xs text-gray-900/70 bg-blue-50 p-3 rounded-lg">
          <p class="font-medium mb-1 flex items-center space-x-1">
            <Icon name="heroicons:information-circle" class="text-sm" />
            <span>made in Conflans vous informe :</span>
          </p>
          <ul class="list-none space-y-1 mt-2">
            <li class="flex items-center space-x-2">
              <Icon name="heroicons:star" class="text-sm text-blue-600" />
              <span>Programme de fidélité</span>
            </li>
            <li class="flex items-center space-x-2">
              <Icon name="heroicons:calendar" class="text-sm text-blue-600" />
              <span>Evénements organisé avec le réseaux made in Conflans</span>
            </li>
            <li class="flex items-center space-x-2">
              <Icon name="heroicons:gift" class="text-sm text-blue-600" />
              <span>Offres exclusives de nos commerçants</span>
            </li>
            <li class="flex items-center space-x-2">
              <Icon name="heroicons:newspaper" class="text-sm text-blue-600" />
              <span>Actualités locales</span>
            </li>
          </ul>
        </div>

        <button @click="handleGuestContinue" :disabled="isLoading"
          class="w-full bg-[#33cccc] text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? 'Enregistrement...' : 'Continuer vers le photobooth' }}
        </button>
      </div>

      <!-- Messages d'erreur/succès -->
      <div v-if="message" class="mt-4 p-3 rounded-lg text-sm"
        :class="messageType === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'">
        {{ message }}
      </div>

      <!-- Retour à la connexion -->
      <div class="mt-6 pt-6 border-t border-white/20 text-center">
        <button @click="goBackToAuth" class="text-gray-900/70 hover:text-gray-900 text-sm transition-colors">
          ← Retour à la connexion
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// État du composant
const isLoading = ref(false)
const message = ref('')
const messageType = ref('')

// Formulaire invité
const guestForm = ref({
  email: '',
  fullName: ''
})

// Fonctions
const showMessage = (text, type = 'error') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

// Utiliser le composable pour gérer la session
const { createSession, hasSession, getSession, forceCleanSession } = usePhotoboothSession()

// Vérifier la session au chargement - Option A : Redirection automatique
onMounted(async () => {
  try {
    if (hasSession()) {
      const sessionData = getSession()
      
      // Si getSession() retourne null (cookie corrompu), nettoyer
      if (!sessionData) {
        console.log('🧹 Cookie corrompu détecté, nettoyage automatique...')
        forceCleanSession()
        return
      }
      
      console.log('✅ Session photobooth existante trouvée:', sessionData)
      
      // Option A : Redirection automatique directe - Simple et efficace
      console.log('🚀 Redirection automatique vers /photobooth')
      await navigateTo('/photobooth')
      return
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de session:', error)
    // Nettoyer le cookie en cas d'erreur
    forceCleanSession()
  }
})

const handleGuestContinue = async () => {
  isLoading.value = true
  
  try {
    // Si l'utilisateur a fourni un email, on peut l'enregistrer
    if (guestForm.value.email) {
      console.log('📧 Enregistrement email invité:', guestForm.value.email, guestForm.value.fullName)
      
      const response = await $fetch('/api/newsletter/subscribe', {
        method: 'POST',
        body: {
          email: guestForm.value.email,
          fullName: guestForm.value.fullName || null,
          userId: null    // Pas d'utilisateur connecté
        }
      })

      if (response.success) {
        showMessage(response.message, 'success')
        console.log('✅ Email invité enregistré:', response)
        
        // Créer une session photobooth avec nom complet
        const sessionData = createSession(guestForm.value.email, guestForm.value.fullName)
        
        // Rediriger vers la page photobooth
        setTimeout(() => {
          navigateTo('/photobooth')
        }, 1500)
      } else {
        showMessage('Erreur lors de l\'enregistrement de l\'email')
        setTimeout(() => {
          navigateTo('/photobooth')
        }, 2000)
      }
    } else {
      // Pas d'email fourni, créer une session anonyme
      console.log('🚀 Continuation sans email - création session anonyme')
      const sessionData = createSession('anonyme@photobooth.local', 'Utilisateur anonyme')
      
      setTimeout(() => {
        navigateTo('/photobooth')
      }, 500)
    }
  } catch (error) {
    console.error('❌ Erreur enregistrement email:', error)
    showMessage('Erreur lors de l\'enregistrement de l\'email')
    
    // Créer une session anonyme même en cas d'erreur
    console.log('🔄 Création session anonyme après erreur')
    const sessionData = createSession('anonyme@photobooth.local', 'Utilisateur anonyme')
    
    setTimeout(() => {
      navigateTo('/photobooth')
    }, 2000)
  } finally {
    isLoading.value = false
  }
}

const skipEmailAndContinue = () => {
  navigateTo('/photobooth')
}

const goBackToAuth = () => {
  navigateTo('/auth')
}

// Meta
definePageMeta({
  layout: 'auth',
  title: 'Mode invité - Made in Conflans',
})
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
