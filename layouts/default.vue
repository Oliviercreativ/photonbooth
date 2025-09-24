<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Contenu principal -->
    <slot />
    
    <!-- Watermark Logo -->
    <WatermarkLogo />
  </div>
</template>

<script setup>
// Le watermark sera automatiquement inclus sur toutes les pages
</script>

<style scoped>
/* Styles globaux pour le layout */
</style>
