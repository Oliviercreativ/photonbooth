<template>
  <header class="bg-black/50 p-4 absolute top-0 left-0 right-0 z-10">
    <div class="flex justify-between items-center max-w-sm mx-auto">
      <!-- Logo/Titre -->
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <span class="text-white text-sm font-bold">📸</span>
        </div>
        <div>
          <h1 class="text-white font-bold text-lg">Photobooth</h1>
          <p v-if="currentStep === 'camera'" class="text-white/70 text-xs">
            {{ selectedBackground ? 'Prêt à capturer' : 'Choisissez un fond' }}
          </p>
          <p v-else-if="currentStep === 'edit'" class="text-white/70 text-xs">Personnalisation</p>
          <p v-else-if="currentStep === 'result'" class="text-white/70 text-xs">Photo terminée</p>
        </div>
      </div>

      <!-- Sélecteur de fond (seulement sur caméra) -->
      <button v-if="currentStep === 'camera'" @click="$emit('toggle-background-selector')"
        class="bg-white/20 text-white px-3 py-2 rounded-full text-sm font-medium backdrop-blur flex items-center gap-1">
        <span v-if="selectedBackground">{{ selectedBackground.emoji }}</span>
        <span v-else>🌍</span>
        {{ selectedBackground?.name || 'Choisir fond' }}
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  currentStep: string
  selectedBackground?: any
  showBackgroundSelector: boolean
}>()

defineEmits<{
  'toggle-background-selector': []
}>()
</script>