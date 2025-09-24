<template>
  <div class="loading-overlay fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center">
    <div class="bg-white rounded-xl p-8 text-center max-w-sm w-full mx-4">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Création en cours...</h3>
      <p class="text-gray-600 text-sm mb-4">{{ message || 'Veuillez patienter' }}</p>

      <!-- Barre de progression animée -->
      <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse"></div>
      </div>

      <!-- Messages d'encouragement -->
      <div class="mt-4 text-xs text-gray-500">
        <p v-if="!message">🍌 Nano Banana travaille sa magie...</p>
        <p v-else-if="message.includes('Préparation')">📸 Analyse de votre photo...</p>
        <p v-else-if="message.includes('Application')">✨ Application du nouveau fond...</p>
        <p v-else-if="message.includes('haute qualité')">🎨 Rendu haute définition...</p>
        <p v-else-if="message.includes('Finalisation')">🎉 Dernières retouches...</p>
        <p v-else>⏳ Traitement en cours...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>