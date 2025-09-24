<template>
  <div class="background-selector fixed inset-0 z-20 bg-black/50 backdrop-blur-sm">
    <div class="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl max-h-[80vh] overflow-hidden">
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b border-gray-100">
        <h3 class="text-lg font-semibold text-gray-800">Choisissez votre destination</h3>
        <button @click="$emit('close')"
          class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
          ✕
        </button>
      </div>

      <!-- Filtres -->
      <div class="p-4 border-b border-gray-50">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button v-for="category in categories" :key="category" @click="activeCategory = category"
            class="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors" :class="activeCategory === category
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            {{ getCategoryLabel(category) }}
          </button>
        </div>
      </div>

      <!-- Grid de fonds -->
      <div class="p-4 overflow-y-auto max-h-96">
        <div class="grid grid-cols-2 gap-3">
          <div v-for="bg in filteredBackgrounds" :key="bg.id" @click="selectBackground(bg)"
            class="relative rounded-xl overflow-hidden cursor-pointer transition-all active:scale-95"
            :class="selectedBackground?.id === bg.id ? 'ring-3 ring-blue-500 shadow-lg' : 'hover:shadow-md'">
            <!-- Image -->
            <img :src="bg.preview" :alt="bg.name" class="w-full h-24 object-cover" />

            <!-- Overlay info -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white text-sm font-medium">{{ bg.name }}</p>
                  <p class="text-white/80 text-xs">{{ bg.country }}</p>
                </div>
                <div class="text-xl">{{ bg.emoji }}</div>
              </div>
            </div>

            <!-- Badge featured -->
            <div v-if="bg.featured"
              class="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              ⭐ Populaire
            </div>

            <!-- Checkmark si sélectionné -->
            <div v-if="selectedBackground?.id === bg.id"
              class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-white text-sm">✓</span>
            </div>
          </div>
        </div>

        <div v-if="filteredBackgrounds.length === 0" class="text-center py-8">
          <div class="text-4xl mb-3">🔍</div>
          <p class="text-gray-500">Aucun fond trouvé dans cette catégorie</p>
          <button @click="activeCategory = 'all'" class="mt-2 text-blue-500 underline">
            Voir tous les fonds
          </button>
        </div>
      </div>

      <!-- Footer avec action -->
      <div v-if="selectedBackground" class="p-4 border-t border-gray-100 bg-gray-50">
        <button @click="confirmSelection"
          class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
          <span>{{ selectedBackground.emoji }}</span>
          Utiliser {{ selectedBackground.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  selectedBackground?: any
}>()

const { backgrounds, categories } = useBackgrounds()
const activeCategory = ref('all')

const categoryLabels = {
  all: '🌍 Tous',
  historique: '🏛️ Historique',
  monument: '🗿 Monuments',
  religieux: '⛪ Religieux',
  nature: '🌿 Nature',
  urbain: '🏙️ Urbain',
  plage: '🏖️ Plages',
  artistique: '🎨 Artistique',
  patriotique: '🇧🇪 Patriotique'
}

const getCategoryLabel = (category: string) => {
  return categoryLabels[category] || category
}

const filteredBackgrounds = computed(() => {
  if (activeCategory.value === 'all') {
    return backgrounds.value
  }
  return backgrounds.value.filter(bg => bg.category === activeCategory.value)
})

const emit = defineEmits<{
  'select-background': [background: any]
  'close': []
}>()

const selectBackground = (background: any) => {
  emit('select-background', background)
}

const confirmSelection = () => {
  emit('close')
}

// Fermer avec Escape
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      emit('close')
    }
  }
  document.addEventListener('keydown', handleEscape)
  onUnmounted(() => document.removeEventListener('keydown', handleEscape))
})
</script>