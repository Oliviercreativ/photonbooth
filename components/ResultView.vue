<template>
  <div class="result-view p-4 space-y-6 min-h-screen">
    <!-- Header avec animation -->
    <div class="text-center animate-fade-in">
      <div class="text-6xl mb-2">🎉</div>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Photo terminée !</h2>
      <p class="text-gray-600">Votre voyage virtuel vous attend</p>
    </div>

    <!-- Image finale avec effet -->
    <div class="relative animate-scale-in">
      <div class="bg-white rounded-xl p-4 shadow-xl">
        <img 
          :src="processedImage" 
          class="w-full h-auto rounded-lg shadow-lg"
          alt="Photo finale avec nouveau fond"
        />
        
        <!-- Badge destination -->
        <div class="absolute top-6 left-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          {{ selectedBackground?.emoji }}
          {{ selectedBackground?.name }}
        </div>
        
        <!-- Timestamp -->
        <div class="absolute bottom-6 right-6 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur">
          {{ formatTimestamp(Date.now()) }}
        </div>
      </div>
    </div>

    <!-- Actions principales -->
    <div class="space-y-3">
      <!-- Download principal -->
      <button 
        @click="$emit('download')"
        class="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <span class="text-xl">📥</span>
        Télécharger en HD
      </button>
      
      <!-- Actions secondaires -->
      <div class="grid grid-cols-2 gap-3">
        <button 
          @click="$emit('share')"
          class="bg-green-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span>📤</span>
          Partager
        </button>
        <button 
          @click="$emit('try-another-background')"
          class="bg-purple-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span>🌍</span>
          Autre fond
        </button>
      </div>
      
      <!-- Nouvelle photo -->
      <button 
        @click="$emit('new-photo')"
        class="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <span>📸</span>
        Nouvelle photo
      </button>
    </div>

    <!-- Statistiques amusantes -->
    <div class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
      <div class="text-center">
        <div class="text-2xl mb-2">🌟</div>
        <h3 class="font-semibold text-gray-800 mb-2">Votre aventure</h3>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-lg font-bold text-blue-600">{{ selectedBackground?.country || 'Monde' }}</div>
            <div class="text-xs text-gray-600">Destination</div>
          </div>
          <div>
            <div class="text-lg font-bold text-green-600">Instantané</div>
            <div class="text-xs text-gray-600">Vitesse</div>
          </div>
          <div>
            <div class="text-lg font-bold text-purple-600">HD</div>
            <div class="text-xs text-gray-600">Qualité</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Suggestion de prochaines destinations -->
    <div v-if="suggestedBackgrounds.length > 0" class="bg-white rounded-xl p-4 shadow-sm">
      <h3 class="font-semibold mb-3 text-gray-800 flex items-center gap-2">
        🗺️ Autres destinations populaires
      </h3>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="bg in suggestedBackgrounds.slice(0, 3)"
          :key="bg.id"
          @click="selectSuggested(bg)"
          class="relative rounded-lg overflow-hidden transition-transform active:scale-95"
        >
          <img 
            :src="bg.preview" 
            class="w-full h-16 object-cover"
            :alt="bg.name"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <p class="text-white text-xs p-2 font-medium">{{ bg.emoji }}</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  processedImage: string
  selectedBackground?: any
}>()

defineEmits<{
  'download': []
  'share': []
  'new-photo': []
  'try-another-background': []
}>()

const { backgrounds } = useBackgrounds()

// Suggestions basées sur la destination actuelle
const suggestedBackgrounds = computed(() => {
  return backgrounds.value
    .filter(bg => bg.id !== selectedBackground?.value?.id)
    .filter(bg => bg.featured || bg.category === selectedBackground?.value?.category)
    .slice(0, 6)
})

const selectSuggested = (background: any) => {
  // Émettre événement pour changer de fond et revenir à l'édition
  emit('select-background', background)
  emit('try-another-background')
}

const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.8s ease-out 0.2s both;
}
</style>