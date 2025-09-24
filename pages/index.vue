<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-5xl font-bold text-white mb-8">📸 Photobooth App</h1>
      <p class="text-xl text-white/80 mb-8">Créez des souvenirs inoubliables avec votre photobooth personnel</p>
      <div class="space-y-4">
        <NuxtLink to="/session" class="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block">
          Démarrer une session
        </NuxtLink>
        <div>
          <button class="text-white/80 hover:text-white transition-colors">
            Voir mes photos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Photobooth - Accueil'
})
</script>