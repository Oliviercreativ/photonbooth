<template>
  <div class="min-h-screen bg-[#f7f5f2] pb-12">
    <slot />
    <nav class="hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div class="flex justify-around items-center py-2">
        <NuxtLink to="/photobooth"
          class="flex flex-col items-center text-xs text-gray-700 hover:text-[#33cccc] transition-colors"
          active-class="text-[#33cccc] font-bold">
          <Icon name="heroicons:camera" class="w-6 h-6 mb-1" />
          Ma photo
        </NuxtLink>
        <NuxtLink to="/made-in-conflans" target="_blank"
          class="flex flex-col items-center text-xs text-gray-700 hover:text-yellow-500 transition-colors">
          <Icon name="heroicons:sparkles" class="w-6 h-6 mb-1" />
          Made in Conflans
        </NuxtLink>
        <NuxtLink to="/concours" target="_blank"
          class="flex flex-col items-center text-xs text-gray-700 hover:text-pink-600 transition-colors"
          active-class="text-pink-600 font-bold">
          <Icon name="heroicons:gift" class="w-6 h-6 mb-1" />
          Concours
        </NuxtLink>
        <NuxtLink to="/acheter" target="_blank"
          class="flex flex-col items-center text-xs text-gray-700 hover:text-green-600 transition-colors"
          active-class="text-green-600 font-bold">
          <Icon name="heroicons:shopping-cart" class="w-6 h-6 mb-1" />
          Acheter
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
