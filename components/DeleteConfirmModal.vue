<template>
  <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-xl p-6 max-w-sm w-full">
      <div class="text-center">
        <div class="text-4xl mb-3">🗑️</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Supprimer cette photo ?</h3>
        <p class="text-gray-600 text-sm mb-4">
          La photo "{{ photo.backgroundName }}" sera définitivement supprimée.
        </p>

        <!-- Preview mini -->
        <img :src="photo.url" class="w-20 h-20 object-cover rounded-lg mx-auto mb-4" :alt="photo.backgroundName" />
      </div>

      <div class="flex gap-3">
        <button @click="$emit('cancel')" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium">
          Annuler
        </button>
        <button @click="$emit('confirm')" class="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium">
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  photo: any
}>()

defineEmits<{
  'confirm': []
  'cancel': []
}>()
</script>