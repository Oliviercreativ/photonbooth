<template>
  <div class="min-h-screen bg-[#f7f5f2]">
    <!-- Contenu principal -->
    <slot />

    <nav class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md z-50 md:hidden">
      <ul class="flex justify-around items-center py-2">
        <li>
          <NuxtLink to="/" class="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            <span>
              <Icon name="heroicons:home" class="w-6 h-6 mb-0.5" />
            </span>
            Accueil
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/galerie" class="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            <span>
              <Icon name="heroicons:photo" class="w-6 h-6 mb-0.5" />
            </span>
            Galerie
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="https://madeinconflans.fr" target="_blank" class="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            <span>
              <img src="/logo-mic.svg" alt="Made in Conflans" class="w-6 h-6 mb-0.5" />
            </span>
            Made in Conflans
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="https://madeinconflans.grinch.fr" target="_blank" class="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            <span>
              <img src="/watermark-logo.png" alt="Made in Conflans" class="w-6 h-6 mb-0.5" />
            </span>
            Carte de fidélité
          </NuxtLink>
        </li>
      </ul>
    </nav>

  </div>
</template>

<script setup>
// Le watermark sera automatiquement inclus sur toutes les pages
</script>

<style scoped>
/* Styles globaux pour le layout */
</style>
