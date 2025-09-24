<template>
  <div class="photo-gallery fixed inset-0 z-30 bg-black/90 backdrop-blur">
    <!-- Header -->
    <div class="flex justify-between items-center p-4 text-white">
      <div>
        <h3 class="text-lg font-semibold">Vos photos</h3>
        <p class="text-sm text-white/70">{{ photos.length }} photo{{ photos.length > 1 ? 's' : '' }}</p>
      </div>
      <button @click="$emit('close')"
        class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white">
        ✕
      </button>
    </div>

    <!-- Grid photos -->
    <div class="px-4 pb-20 overflow-y-auto max-h-[calc(100vh-120px)]">
      <div v-if="photos.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">📸</div>
        <p class="text-white/70 text-lg mb-2">Aucune photo encore</p>
        <p class="text-white/50 text-sm">Vos photos apparaîtront ici après capture</p>
      </div>

      <div v-else class="grid grid-cols-2 gap-3">
        <div v-for="(photo, index) in photos" :key="photo.id" class="relative group">
          <!-- Image -->
          <div class="relative rounded-lg overflow-hidden bg-gray-800">
            <img :src="photo.url" :alt="`Photo ${index + 1}`"
              class="w-full aspect-square object-cover transition-transform group-active:scale-95"
              @click="openPreview(photo, index)" />

            <!-- Overlay info -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <p class="text-white text-xs font-medium truncate">{{ photo.backgroundName }}</p>
              <p class="text-white/70 text-xs">{{ formatDate(photo.timestamp) }}</p>
            </div>

            <!-- Badge qualité -->
            <div v-if="photo.isHighQuality"
              class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
              HD
            </div>

            <!-- Actions (visible au tap sur mobile) -->
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click.stop="$emit('download', photo.url, `photobooth-${photo.background}-${photo.timestamp}.png`)"
                class="w-8 h-8 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center backdrop-blur">
                📥
              </button>
              <button @click.stop="$emit('share', photo.url, photo)"
                class="w-8 h-8 bg-green-500 rounded-full text-white text-xs flex items-center justify-center backdrop-blur">
                📤
              </button>
              <button @click.stop="confirmDelete(photo)"
                class="w-8 h-8 bg-red-500 rounded-full text-white text-xs flex items-center justify-center backdrop-blur">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <PhotoPreview v-if="previewPhoto" :photo="previewPhoto" :photos="photos" :current-index="previewIndex"
      @close="closePreview"
      @download="$emit('download', $event.url, `photobooth-${$event.background}-${$event.timestamp}.png`)"
      @share="$emit('share', $event.url, $event)" @delete="confirmDelete" @navigate="navigatePreview" />

    <!-- Delete Confirmation -->
    <DeleteConfirmModal v-if="photoToDelete" :photo="photoToDelete" @confirm="deletePhoto"
      @cancel="photoToDelete = null" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  photos: Array<{
    id: string
    url: string
    background: string
    backgroundName: string
    timestamp: number
    isHighQuality?: boolean
  }>
}>()

defineEmits<{
  'close': []
  'download': [url: string, filename: string]
  'share': [url: string, photo: any]
  'delete': [photoId: string]
}>()

const previewPhoto = ref(null)
const previewIndex = ref(0)
const photoToDelete = ref(null)

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`

  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const openPreview = (photo: any, index: number) => {
  previewPhoto.value = photo
  previewIndex.value = index
}

const closePreview = () => {
  previewPhoto.value = null
}

const navigatePreview = (direction: 'prev' | 'next') => {
  if (direction === 'next') {
    previewIndex.value = (previewIndex.value + 1) % photos.length
  } else {
    previewIndex.value = previewIndex.value === 0 ? photos.length - 1 : previewIndex.value - 1
  }
  previewPhoto.value = photos[previewIndex.value]
}

const confirmDelete = (photo: any) => {
  photoToDelete.value = photo
}

const deletePhoto = () => {
  if (photoToDelete.value) {
    emit('delete', photoToDelete.value.id)
    photoToDelete.value = null

    // Fermer preview si c'était la photo prévisualisée
    if (previewPhoto.value?.id === photoToDelete.value?.id) {
      closePreview()
    }
  }
}
</script>