<template>
  <div>
    <div class="mt-8 p-4 bg-pink-100 rounded-xl text-gray-900">
      <h3 class="font-bold mb-2 text-center">Si vous souhaitez plus de photos, prenez le pack 5, 10, 15, 20 photos</h3>
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-lg shadow p-4 flex flex-col items-center gap-4">
          <NuxtLink to="https://madeinconflans.fr/giagia-cafe" target="_blank">
            <img
              src="https://ymqmrfxdmzbgfuawyegr.supabase.co/storage/v1/object/public/photobooth/admin-photos/thumbnails/admin-10-1759088966411-thumb.png"
              class="w-full rounded-lg" />

          </NuxtLink>
          <div class="flex flex-row items-center justify-center flex-col w-full">
            <span class="text-lg font-bold text-pink-700">5 photos</span>
            <span class="text-base text-gray-800">3€</span>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 flex flex-col items-center gap-4">
          <img
            src="https://ymqmrfxdmzbgfuawyegr.supabase.co/storage/v1/object/public/photobooth/admin-photos/thumbnails/admin-10-1759088966411-thumb.png"
            class="w-full rounded-lg" />
          <div class="flex flex-row items-center justify-center flex-col w-full">
            <span class="text-lg font-bold text-pink-700">10 photos</span>
            <span class="text-base text-gray-800">5€</span>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 flex flex-col items-center gap-4">
          <img
            src="https://ymqmrfxdmzbgfuawyegr.supabase.co/storage/v1/object/public/photobooth/admin-photos/thumbnails/admin-10-1759088966411-thumb.png"
            class="w-full rounded-lg" />
          <div class="flex flex-row items-center justify-center flex-col w-full">
            <span class="text-lg font-bold text-pink-700">15 photos</span>
            <span class="text-base text-gray-800">8€</span>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-4 flex flex-col items-center gap-4">
          <img
            src="https://ymqmrfxdmzbgfuawyegr.supabase.co/storage/v1/object/public/photobooth/admin-photos/thumbnails/admin-10-1759088966411-thumb.png"
            class="w-full rounded-lg" />
          <div class="flex flex-row items-center justify-center flex-col w-full">
            <span class="text-lg font-bold text-pink-700">20 photos</span>
            <span class="text-base text-gray-800">10€</span>
          </div>
        </div>
      </div>
      <a href="https://madeinconflans.fr/giagia-cafe" target="_blank" rel="noopener"
        class="mt-4 inline-block w-full bg-pink-400 text-white font-bold py-2 rounded-lg hover:bg-pink-500 transition-colors text-center">
        Rendez-vous sur le stand de made in Conflans
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'auth',
  title: 'Acheter des photos - Made in Conflans',
})
</script>

<style>

</style>