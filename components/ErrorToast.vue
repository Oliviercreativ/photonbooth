<template>
  <Transition name="toast">
    <div class="error-toast fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div class="bg-red-500 text-white p-4 rounded-xl shadow-lg flex items-center gap-3">
        <div class="text-xl">⚠️</div>
        <div class="flex-1">
          <p class="font-medium text-sm">Erreur</p>
          <p class="text-xs text-red-100">{{ message }}</p>
        </div>
        <button @click="$emit('dismiss')" class="text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  'dismiss': []
}>()

// Auto-dismiss après 5 secondes
onMounted(() => {
  setTimeout(() => {
    emit('dismiss')
  }, 5000)
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>