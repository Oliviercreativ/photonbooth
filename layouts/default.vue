<template>
  <div class="min-h-screen bg-[#f7f5f2]">
    <!-- Contenu principal -->
    <slot />

    <nav class="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md z-50 md:hidden">
      <ul class="flex justify-around items-center py-2">
        <li>
          <NuxtLink to="/" class="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-0.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7m-9 2v6m0 0h4m-4 0a2 2 0 01-2-2v-4a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4z" />
              </svg>
            </span>
            Accueil
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/galerie" class="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-0.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none" />
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none" />
                <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none" />
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none" />
              </svg>
            </span>
            Galerie
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/made-in-conflans" class="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-0.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18m9-9H3" />
              </svg>
            </span>
            Made in Conflans
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/mon-compte" class="flex flex-col items-center text-xs text-gray-700 hover:text-blue-600">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mb-0.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Mon compte
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
