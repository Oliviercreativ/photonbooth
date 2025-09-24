<template>
  <div class="edit-view p-4 space-y-6 min-h-screen">
    <!-- Photo capturée -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <div class="flex justify-between items-center mb-3">
        <h3 class="font-semibold text-gray-800">Votre photo :</h3>
        <button 
          @click="$emit('retake-photo')"
          class="text-blue-500 text-sm underline flex items-center gap-1"
        >
          📷 Reprendre
        </button>
      </div>
      <div class="relative">
        <img 
          :src="capturedImage" 
          class="w-full h-48 object-cover rounded-lg"
          alt="Photo capturée"
        />
        <div class="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
          Photo originale
        </div>
      </div>
    </div>

    <!-- Sélection du fond -->
    <div class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="font-semibold mb-3 text-gray-800 flex items-center gap-2">
        🌍 Choisissez votre destination :
        <span v-if="selectedBackground" class="text-sm text-green-600 font-normal">
          {{ selectedBackground.name }} ✓
        </span>
      </h3>
      
      <BackgroundGrid
        :selected-background="selectedBackground"
        :compact="true"
        @select="$emit('select-background', $event)"
      />
    </div>

    <!-- Preview (si fond sélectionné) -->
    <div v-if="selectedBackground" class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <span class="text-white text-sm">✨</span>
        </div>
        <div>
          <h4 class="font-medium text-gray-800">Destination sélectionnée</h4>
          <p class="text-sm text-gray-600">{{ selectedBackground.name }} {{ selectedBackground.emoji }}</p>
        </div>
      </div>
      
      <div class="bg-white rounded-lg p-3">
        <div class="flex items-center gap-2">
          <img 
            :src="selectedBackground.preview" 
            class="w-12 h-12 object-cover rounded"
            :alt="selectedBackground.name"
          />
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">{{ selectedBackground.name }}</p>
            <p class="text-xs text-gray-500">{{ selectedBackground.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Button -->
    <div class="sticky bottom-4">
      <button 
        @click="$emit('process-photo')"
        :disabled="!selectedBackground || isProcessing"
        class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        <span v-if="isProcessing" class="animate-spin">⏳</span>
        <span v-else>✨</span>
        {{ isProcessing ? 'Création en cours...' : 'Créer ma photo !' }}
      </button>
      
      <p v-if="!selectedBackground" class="text-center text-sm text-gray-500 mt-2">
        Sélectionnez un fond d'écran pour continuer
      </p>
      
      <div v-if="isProcessing && processingStep" class="text-center mt-3">
        <div class="bg-white/80 backdrop-blur px-4 py-2 rounded-full inline-block">
          <p class="text-sm text-gray-700">{{ processingStep }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  capturedImage: string
  selectedBackground?: any
  isProcessing: boolean
  processingStep: string
}>()

defineEmits<{
  'retake-photo': []
  'process-photo': []
  'select-background': [background: any]
}>()
</script>