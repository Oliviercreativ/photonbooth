<template>
    <div class="min-h-screen bg-[#f7f5f2] px-4 py-12">
        <!-- Header -->
        <div class="backdrop-blur-sm rounded-xl p-4 mb-6">
            <div class="flex justify-between items-center flex-col">
                <div class="flex items-center space-x-2 flex-col">
                    <NuxtLink to="https://madeinconflans.fr/fidelite">
                        <img src="/logo-mic.svg" alt="Made in Conflans" class="w-24" />
                    </NuxtLink>
                    <div class="flex flex-col items-center justify-center">
                        <h1 class="text-3xl font-bold text-gray-900">Concours Oktoberfest</h1>
                        <p class="text-gray-900/70">Partagez votre photo et tentez de gagner !</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contenu principal -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <div class="text-center">
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Comment participer ?</h2>
                    <p class="text-gray-900/70">C'est très simple, suivez ces étapes :</p>
                </div>

                <!-- Étapes du concours -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <!-- Étape 1 -->
                    <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-left">
                        <div class="flex items-center mb-4">
                            <div
                                class="bg-blue-600 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                                1</div>
                            <h3 class="text-lg font-bold text-gray-900">Ajoutez-nous</h3>
                        </div>
                        <p class="text-gray-900/70 mb-4">
                            Suivez <strong>@madeinconflans</strong> sur Instagram ou Facebook
                        </p>
                        <div class="flex space-x-3">
                            <a href="https://facebook.com/madeinconflans" target="_blank"
                                class="bg-blue-600 text-gray-800 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                                <Icon name="heroicons:user-group" class="w-4 h-4" />
                                <span>Facebook</span>
                            </a>
                            <a href="https://instagram.com/madeinconflans" target="_blank"
                                class="bg-pink-600 text-gray-800 px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2">
                                <Icon name="heroicons:photo" class="w-4 h-4" />
                                <span>Instagram</span>
                            </a>
                        </div>
                    </div>

                    <!-- Étape 2 -->
                    <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-left">
                        <div class="flex items-center mb-4">
                            <div
                                class="bg-blue-600 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                                2</div>
                            <h3 class="text-lg font-bold text-gray-900">Partagez votre photo</h3>
                        </div>
                        <p class="text-gray-900/70 mb-4">
                            Postez votre photo de l'Oktoberfest en story ou en post
                        </p>
                        <div class="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
                            <p class="text-sm text-yellow-800">
                                <Icon name="heroicons:light-bulb" class="w-4 h-4 inline mr-1" />
                                <strong>Astuce :</strong> Les stories ont plus de chances d'être vues !
                            </p>
                        </div>
                    </div>

                    <!-- Étape 3 -->
                    <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-left">
                        <div class="flex items-center mb-4">
                            <div
                                class="bg-blue-600 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                                3</div>
                            <h3 class="text-lg font-bold text-gray-900">Mentionnez-nous</h3>
                        </div>
                        <p class="text-gray-900/70 mb-4">
                            Mentionnez <strong>@madeinconflans</strong> dans votre post
                        </p>
                        <div class="bg-blue-100 border border-blue-300 rounded p-3">
                            <p class="text-sm text-blue-800 font-mono">
                                @madeinconflans
                            </p>
                        </div>
                    </div>

                    <!-- Étape 4 -->
                    <div class="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-left">
                        <div class="flex items-center mb-4">
                            <div
                                class="bg-blue-600 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                                4</div>
                            <h3 class="text-lg font-bold text-gray-900">Hashtags obligatoires</h3>
                        </div>
                        <p class="text-gray-900/70 mb-4">
                            Ajoutez ces hashtags à votre post
                        </p>
                        <div class="bg-blue-100 border border-blue-300 rounded p-3">
                            <p class="text-sm text-blue-800 font-mono">
                                #OktoberfestConflans<br>
                                #MadeInConflans
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Bouton retour à la photo -->
                <div class="mb-6">
                    <button @click="goBackToPhoto"
                        class="bg-[#33cccc] text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto">
                        <Icon name="heroicons:arrow-left" class="w-5 h-5" />
                        <span>Retour à ma photo</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Lots à gagner -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-900 text-center mb-6">
                <Icon name="heroicons:gift" class="w-8 h-8 inline mr-2 text-green-600" />
                Lots à gagner
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- 1er prix -->
                <div class="bg-pink-100 border-2 border-pink-400 rounded-xl p-6 text-center">
                    <div
                        class="bg-pink-500 text-gray-800 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mx-auto mb-4">
                        1</div>
                    <h3 class="text-xl font-bold text-gray-900 mb-2">1er Prix</h3>
                    <p class="text-gray-700 font-semibold">Un bon d'achat de 30€</p>
                </div>
            </div>
        </div>

        <!-- Règlement -->
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 class="text-xl font-bold text-gray-900 text-center mb-4">
                <Icon name="heroicons:document-text" class="w-6 h-6 inline mr-2 text-blue-600" />
                Règlement du concours
            </h2>

            <div class="text-sm text-gray-700 space-y-2">
                <p><strong>•</strong> Concours ouvert du 4 octobre 2025 au 5 octobre 2025</p>
                <p><strong>•</strong> Une participation par personne</p>
                <p><strong>•</strong> Tirage au sort le 6 octobre 2025</p>
                <p><strong>•</strong> Les gagnants seront contactés par DM</p>
                <p><strong>•</strong> Le bon d'achat doit être utilisé dans l'un des commerces de l'application de fidélité vous pouvez consulter la liste des commerces sur <a href="https://madeinconflans.fr/fidelite" target="_blank" class="text-blue-600">madeinconflans.fr/fidelite</a></p>
            </div>
        </div>
    </div>
</template>

<script setup>
// Fonction pour retourner à la photo
const goBackToPhoto = () => {
  // Retourner à la page précédente ou à photobooth
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/photobooth')
  }
}

// Meta
definePageMeta({
  layout: 'auth',
  title: 'Concours Oktoberfest - Made in Conflans',
})
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
