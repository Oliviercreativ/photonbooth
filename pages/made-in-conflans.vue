<template>
  <div>
    <div class="min-h-screen bg-[#f7f5f2] px-4 py-12">
      <div class="max-w-4xl mx-auto flex flex-col items-center justify-center">
        <img src="/logo-mic.svg" alt="Made in Conflans" class="w-24 mb-4" />
        <h1 class="text-2xl font-bold text-gray-900">Made in Conflans</h1>
        <p class="text-gray-900/70 text-center">Made in Conflans est un annuaire pour promouvoir le commerce local.</p>
        <p class="text-gray-900/70 text-center">Vous pouvez consulter l'annuaire en cliquant sur le bouton ci-dessous.
        </p>
        <a href="https://madeinconflans.fr/annuaire-commercants" target="_blank" rel="noopener"
          class="mt-2 text-sm w-full bg-blue-500 text-gray-800 font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors text-center block">
          Découvrir l'annuaire
        </a>
        <a href="https://madeinconflans.fr/fidelite" target="_blank" rel="noopener"
          class="mt-2 text-sm w-full bg-blue-500 text-gray-800 font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors text-center block">
          Découvrir le programme de fidélité
        </a>
        <a href="https://madeinconflans.fr/bonplan" target="_blank" rel="noopener"
          class="mt-2 text-sm w-full bg-blue-500 text-gray-800 font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors text-center block">
          Découvrir les bons plans
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'auth',
  title: 'Made in Conflans',
})
</script>
<style>

</style>