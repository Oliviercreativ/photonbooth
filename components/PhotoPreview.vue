<template>
  <div class="photo-preview fixed inset-0 z-40 bg-black flex items-center justify-center">
    <!-- Navigation -->
    <button v-if="photos.length > 1" @click="$emit('navigate', 'prev')"
      class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl backdrop-blur z-10">
      ←
    </button>

    <button v-if="photos.length > 1" @click="$emit('navigate', 'next')"
      class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl backdrop-blur z-10">
      →
    </button>

    <!-- Header -->
    <div class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
      <div class="flex justify-between items-center text-white">
        <div>
          <h3 class="font-semibold">{{ photo.backgroundName }}</h3>
          <p class="text-sm text-white/70">{{ formatFullDate(photo.timestamp) }}</p>
        </div>
        <button @click="$emit('close')"
          class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
          ✕
        </button>
      </div>
    </div>

    <!-- Image principale -->
    <img :src="photo.url" :alt="photo.backgroundName" class="max-w-full max-h-full object-contain"
      @click="$emit('close')" />

    <!-- Footer actions -->
    <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
      <div class="flex justify-center gap-4">
        <button @click="$emit('download', photo)"
          class="bg-blue-500 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2">
          📥 Télécharger
        </button>
        <button @click="$emit('share', photo)"
          class="bg-green-500 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2">
          📤 Partager
        </button>
        <button @click="$emit('delete', photo)"
          class="bg-red-500 text-white px-4 py-2 rounded-full font-medium flex items-center gap-2">
          🗑️ Supprimer
        </button>
      </div>

      <!-- Indicateur si plusieurs photos -->
      <div v-if="photos.length > 1" class="text-center mt-3">
        <p class="text-white/70 text-sm">
          {{ currentIndex + 1 }} / {{ photos.length }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  photo: any
  photos: Array<any>
  currentIndex: number
}>()

defineEmits<{
  'close': []
  'download': [photo: any]
  'share': [photo: any]
  'delete': [photo: any]
  'navigate': [direction: 'prev' | 'next']
}>()

const formatFullDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Gestion des touches clavier
onMounted(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        emit('close')
        break
      case 'ArrowLeft':
        emit('navigate', 'prev')
        break
      case 'ArrowRight':
        emit('navigate', 'next')
        break
    }
  }

  document.addEventListener('keydown', handleKeyPress)
  onUnmounted(() => document.removeEventListener('keydown', handleKeyPress))
})
</script>