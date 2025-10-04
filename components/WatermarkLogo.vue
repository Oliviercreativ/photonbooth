<template>
  <div class="watermark-logo fixed bottom-4 right-4 z-50">
    <a 
      href="https://madeinconflans.grinch.fr" 
      target="_blank" 
      rel="noopener noreferrer"
      class="block transition-all duration-300 hover:scale-110 hover:opacity-80"
      :class="{ 'opacity-60': !hovered, 'opacity-100': hovered }"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
      <img 
        :src="logoUrl" 
        alt="Grinch Logo" 
        class="w-12 h-12 rounded-lg shadow-lg"
        :class="{ 'shadow-xl': hovered }"
      />
    </a>
    
    <!-- Tooltip -->
    <div 
      v-if="showTooltip && hovered"
      class="absolute bottom-16 right-0 bg-black/80 text-gray-800 text-xs px-2 py-1 rounded whitespace-nowrap"
    >
      Powered by Grinch
    </div>
  </div>
</template>

<script setup>
const logoUrl = '/watermark-logo.png'
const hovered = ref(false)
const showTooltip = ref(true)

// Masquer le tooltip après 3 secondes
onMounted(() => {
  setTimeout(() => {
    showTooltip.value = false
  }, 3000)
})
</script>

<style scoped>
.watermark-logo {
  /* Assurer que le watermark reste au-dessus de tout */
  z-index: 9999;
}

/* Animation subtile */
.watermark-logo img {
  transition: all 0.3s ease;
}

/* Responsive - plus petit sur mobile */
@media (max-width: 640px) {
  .watermark-logo {
    bottom: 2rem;
    right: 1rem;
  }
  
  .watermark-logo img {
    width: 2.5rem;
    height: 2.5rem;
  }
}

/* Masquer sur très petits écrans si nécessaire */
@media (max-width: 320px) {
  .watermark-logo {
    opacity: 0.7;
  }
}
</style>
