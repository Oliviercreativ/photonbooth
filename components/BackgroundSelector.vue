<template>
  <div class="fixed inset-0 bg-black/95 backdrop-blur z-50 flex flex-col h-screen">
      <!-- Header -->
    <div class="flex justify-between items-center p-4 border-b border-white/20">
      <h2 class="text-white text-lg sm:text-xl font-bold">Choisissez un effet</h2>
        <button @click="$emit('close')"
        class="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-3 rounded-lg transition-colors touch-manipulation min-h-[48px] min-w-[80px] font-semibold">
        ✕ Fermer
        </button>
      </div>

    <!-- Onglets -->
    <div class="flex border-b border-white/20">
      <button @click="activeTab = 'geographic'"
        class="flex-1 px-2 py-4 text-center transition-colors touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
        :class="activeTab === 'geographic' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'">
        <span class="text-xl mb-1"><Icon name="heroicons:globe-alt" /></span>
        <span class="text-sm font-medium">Pays et Ville</span>
      </button>
      <button @click="activeTab = 'transformed'"
        class="flex-1 px-2 py-4 text-center transition-colors touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
        :class="activeTab === 'transformed' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'">
        <span class="text-xl mb-1"><Icon name="heroicons:globe-alt" /></span>
        <span class="text-sm font-medium">Monde Entier</span>
      </button>
      <button @click="activeTab = 'original'"
        class="flex-1 px-2 py-4 text-center transition-colors touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
        :class="activeTab === 'original' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/80 hover:text-white hover:bg-white/10'">
        <span class="text-xl mb-1"><Icon name="heroicons:camera" /></span>
        <span class="text-sm font-medium">Monde Original</span>
          </button>
      </div>

    <!-- Grille des fonds -->
    <div class="flex-1 overflow-y-auto p-3 sm:p-4">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        <div v-for="bg in filteredBackgrounds" :key="bg.id" @click.stop="selectBackground(bg)"
          class="relative cursor-pointer rounded-xl overflow-hidden group active:scale-95 transition-transform duration-150 touch-manipulation"
          :class="selectedBackground?.id === bg.id ? 'ring-4 ring-blue-400 shadow-xl' : 'ring-2 ring-transparent hover:ring-white/30'">
          <img
            :src="getPreviewUrl(bg.id)"
            :alt="bg.name"
            class="w-full h-28 sm:h-32 md:h-40 lg:h-48 object-cover"
            @error="(e) => e.target.src = bg.preview"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent">
            <div class="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
              <p class="text-white text-base sm:text-lg font-bold mb-1">{{ bg.emoji }}</p>
              <p class="text-white text-xs sm:text-sm opacity-95 leading-tight font-medium">{{ bg.name }}</p>
            </div>
            </div>

          <!-- Indicateur de sélection -->
            <div v-if="selectedBackground?.id === bg.id"
            class="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <span class="text-white text-sm sm:text-base font-bold">✓</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['select', 'close'])

const activeTab = ref('geographic')
const selectedBackground = ref(null)

// Supabase URL for previews
const SUPABASE_URL = 'https://ymqmrfxdmzbgfuawyegr.supabase.co'
const SUPABASE_STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public/photobooth`

// Helper to get preview URL from Supabase or fallback to local
const getPreviewUrl = (backgroundId) => {
  // Try Supabase first (WebP format from generated previews)
  return `${SUPABASE_STORAGE_URL}/previews/${backgroundId}.webp`
}

// Fonds disponibles
const backgrounds = ref([
  {
    id: 'brussels-grand-place',
    name: 'Grand-Place Bruxelles',
    emoji: '🏛️',
    preview: '/previews/brussels.jpg'
  },
  {
    id: 'chimay-cathedral',
    name: 'Cathédrale Chimay',
    emoji: '⛪',
    preview: '/previews/chimay.jpg'
  },
  {
    id: 'paris-eiffel',
    name: 'Tour Eiffel Paris',
    emoji: '🗼',
    preview: '/previews/paris.jpg'
  },
  {
    id: 'tropical-beach',
    name: 'Plage Tropicale',
    emoji: '🏝️',
    preview: '/previews/beach.jpg'
  },
  {
    id: 'pixar-caricature',
    name: 'Caricature Pixar 3D',
    emoji: '🎭',
    preview: '/previews/pixar.jpg'
  },
  {
    id: 'belgium-patriotic',
    name: 'Belgique Patriotique',
    emoji: '🇧🇪',
    preview: '/previews/belgium.jpg'
  },
  {
    id: 'pixar-belgium',
    name: 'Pixar Belgique 3D',
    emoji: '🎭🇧🇪',
    preview: '/previews/pixar-belgium.jpg'
  },
  {
    id: 'pixar-uk',
    name: 'Pixar Grande-Bretagne 3D',
    emoji: '🎭🇬🇧',
    preview: '/previews/pixar-uk.jpg'
  },
  {
    id: 'pixar-germany',
    name: 'Pixar Oktoberfest 3D',
    emoji: '🎭🇩🇪',
    preview: '/previews/pixar-germany.jpg'
  },
  {
    id: 'ghibli-belgium',
    name: 'Studio Ghibli Belgique',
    emoji: '🎨🇧🇪',
    preview: '/previews/ghibli-belgium.jpg'
  },
  {
    id: 'ghibli-uk',
    name: 'Studio Ghibli Grande-Bretagne',
    emoji: '🎨🇬🇧',
    preview: '/previews/ghibli-uk.jpg'
  },
  {
    id: 'ghibli-germany',
    name: 'Studio Ghibli Allemagne',
    emoji: '🎨🇩🇪',
    preview: '/previews/ghibli-germany.jpg'
  },
  {
    id: 'ghibli-france',
    name: 'Studio Ghibli France',
    emoji: '🎨🇫🇷',
    preview: '/previews/ghibli-france.jpg'
  },
  {
    id: 'ghibli-conflans',
    name: 'Studio Ghibli Conflans',
    emoji: '🎨🏘️',
    preview: '/previews/ghibli-conflans.jpg'
  },
  {
    id: 'pixar-pure',
    name: 'Pixar Caricature Pure',
    emoji: '🎭✨',
    preview: '/previews/pixar-pure.jpg'
  },
  {
    id: 'ghibli-pure',
    name: 'Studio Ghibli Pure',
    emoji: '🎨✨',
    preview: '/previews/ghibli-pure.jpg'
  },
  {
    id: 'disney-inspired',
    name: 'Classic Animation Style',
    emoji: '🏰✨',
    preview: '/previews/disney-inspired.jpg'
  },
  {
    id: 'disney-belgium',
    name: 'Classic Animation Belgique',
    emoji: '🏰🇧🇪',
    preview: '/previews/disney-belgium.jpg'
  },
  {
    id: 'disney-uk',
    name: 'Classic Animation Grande-Bretagne',
    emoji: '🏰🇬🇧',
    preview: '/previews/disney-uk.jpg'
  },
  {
    id: 'disney-germany',
    name: 'Classic Animation Allemagne',
    emoji: '🏰🇩🇪',
    preview: '/previews/disney-germany.jpg'
  },
  {
    id: 'disney-france',
    name: 'Classic Animation France',
    emoji: '🏰🇫🇷',
    preview: '/previews/disney-france.jpg'
  },
  {
    id: 'disney-conflans',
    name: 'Classic Animation Conflans',
    emoji: '🏰🏘️',
    preview: '/previews/disney-conflans.jpg'
  },
  {
    id: 'street-caricature',
    name: 'Caricature de Rue',
    emoji: '🎨✏️',
    preview: '/previews/street-caricature.jpg'
  },
  {
    id: 'street-caricature-belgium',
    name: 'Caricature Rue Belgique',
    emoji: '🎨🇧🇪',
    preview: '/previews/street-caricature-belgium.jpg'
  },
  {
    id: 'street-caricature-uk',
    name: 'Caricature Rue Grande-Bretagne',
    emoji: '🎨🇬🇧',
    preview: '/previews/street-caricature-uk.jpg'
  },
  {
    id: 'street-caricature-germany',
    name: 'Caricature Rue Allemagne',
    emoji: '🎨🇩🇪',
    preview: '/previews/street-caricature-germany.jpg'
  },
  {
    id: 'street-caricature-france',
    name: 'Caricature Rue France',
    emoji: '🎨🇫🇷',
    preview: '/previews/street-caricature-france.jpg'
  },
  {
    id: 'street-caricature-conflans',
    name: 'Caricature Rue Conflans',
    emoji: '🎨🏘️',
    preview: '/previews/street-caricature-conflans.jpg'
  },
  {
    id: 'dreamworks-inspired',
    name: 'DreamWorks 3D Style',
    emoji: '🎬✨',
    preview: '/previews/dreamworks-inspired.jpg'
  },
  {
    id: 'dreamworks-belgium',
    name: 'DreamWorks Belgique',
    emoji: '🎬🇧🇪',
    preview: '/previews/dreamworks-belgium.jpg'
  },
  {
    id: 'dreamworks-uk',
    name: 'DreamWorks Grande-Bretagne',
    emoji: '🎬🇬🇧',
    preview: '/previews/dreamworks-uk.jpg'
  },
  {
    id: 'dreamworks-germany',
    name: 'DreamWorks Allemagne',
    emoji: '🎬🇩🇪',
    preview: '/previews/dreamworks-germany.jpg'
  },
  {
    id: 'dreamworks-france',
    name: 'DreamWorks France',
    emoji: '🎬🇫🇷',
    preview: '/previews/dreamworks-france.jpg'
  },
  {
    id: 'dreamworks-conflans',
    name: 'DreamWorks Conflans',
    emoji: '🎬🏘️',
    preview: '/previews/dreamworks-conflans.jpg'
  },
  {
    id: 'pixar-pure-original',
    name: 'Pixar Fond Original',
    emoji: '🎭📷',
    preview: '/previews/pixar-pure-original.jpg'
  },
  {
    id: 'pixar-pure-transformed',
    name: 'Pixar Monde Entier',
    emoji: '🎭🌍',
    preview: '/previews/pixar-pure-transformed.jpg'
  },
  {
    id: 'ghibli-pure-original',
    name: 'Ghibli Fond Original',
    emoji: '🎨📷',
    preview: '/previews/ghibli-pure-original.jpg'
  },
  {
    id: 'ghibli-pure-transformed',
    name: 'Ghibli Monde Entier',
    emoji: '🎨🌍',
    preview: '/previews/ghibli-pure-transformed.jpg'
  },
  {
    id: 'disney-pure-original',
    name: 'Disney Fond Original',
    emoji: '🏰📷',
    preview: '/previews/disney-pure-original.jpg'
  },
  {
    id: 'disney-pure-transformed',
    name: 'Disney Monde Entier',
    emoji: '🏰🌍',
    preview: '/previews/disney-pure-transformed.jpg'
  },
  {
    id: 'caricature-pure-transformed',
    name: 'Caricature Monde Entier',
    emoji: '🎨✏️🌍',
    preview: '/previews/caricature-pure-transformed.jpg'
  },
  {
    id: 'dreamworks-pure-original',
    name: 'DreamWorks Fond Original',
    emoji: '🎬📷',
    preview: '/previews/dreamworks-pure-original.jpg'
  },
  {
    id: 'aura-glow-pure-original',
    name: 'Aura Lumineuse Fond Original',
    emoji: '✨📷',
    preview: '/previews/aura-glow-pure-original.jpg'
  },
  {
    id: 'aura-glow-dreamworks-transformed',
    name: 'Aura DreamWorks Monde Entier',
    emoji: '✨🎬🌍',
    preview: '/previews/aura-glow-dreamworks-transformed.jpg'
  },
  {
    id: 'aura-glow-pixar-transformed',
    name: 'Aura Pixar Monde Entier',
    emoji: '✨🎭🌍',
    preview: '/previews/aura-glow-pixar-transformed.jpg'
  },
  {
    id: 'captain-future-transformed',
    name: 'Capitaine Flam Monde Entier',
    emoji: '🚀👨‍🚀🌍',
    preview: '/previews/captain-future-transformed.jpg'
  },
  {
    id: 'captain-future-original',
    name: 'Capitaine Flam Fond Original',
    emoji: '🚀👨‍🚀📷',
    preview: '/previews/captain-future-original.jpg'
  },
  {
    id: 'cites-or-transformed',
    name: 'Cités d\'Or Monde Entier',
    emoji: '🏛️✨🌍',
    preview: '/previews/cites-or-transformed.jpg'
  },
  {
    id: 'frozen-transformed',
    name: 'Reine des Neiges Monde Entier',
    emoji: '❄️👑🌍',
    preview: '/previews/frozen-transformed.jpg'
  },
  {
    id: 'kpop-pure-original',
    name: 'K-pop Demon Hunter Fond Original',
    emoji: '👹📷',
    preview: '/previews/kpop-pure-original.jpg'
  },
  {
    id: 'kpop-pure-transformed',
    name: 'K-pop Demon Hunter Monde Entier',
    emoji: '👹🌍',
    preview: '/previews/kpop-pure-transformed.jpg'
  },
  {
    id: 'pop-art-warhol-original',
    name: 'Pop Art Warhol Fond Original',
    emoji: '🎨📷',
    preview: '/previews/pop-art-warhol-original.jpg'
  },
  {
    id: 'pop-art-warhol-transformed',
    name: 'Pop Art Warhol Monde Entier',
    emoji: '🎨🌍',
    preview: '/previews/pop-art-warhol-transformed.jpg'
  },
  {
    id: 'superhero-original',
    name: 'Super-Héros Fond Original',
    emoji: '🦸📷',
    preview: '/previews/superhero-original.jpg'
  },
  {
    id: 'superhero-transformed',
    name: 'Super-Héros Monde Entier',
    emoji: '🦸🌍',
    preview: '/previews/superhero-transformed.jpg'
  },
  {
    id: 'film-noir-original',
    name: 'Film Noir Fond Original',
    emoji: '🖤📷',
    preview: '/previews/film-noir-original.jpg'
  },
  {
    id: 'film-noir-transformed',
    name: 'Film Noir Monde Entier',
    emoji: '🖤🌍',
    preview: '/previews/film-noir-transformed.jpg'
  },
  {
    id: 'vaporwave-original',
    name: 'Vaporwave Fond Original',
    emoji: '🌈📷',
    preview: '/previews/vaporwave-original.jpg'
  },
  {
    id: 'vaporwave-transformed',
    name: 'Vaporwave Monde Entier',
    emoji: '🌈🌍',
    preview: '/previews/vaporwave-transformed.jpg'
  },
  {
    id: 'cyberpunk-original',
    name: 'Cyberpunk Fond Original',
    emoji: '🤖📷',
    preview: '/previews/cyberpunk-original.jpg'
  },
  {
    id: 'cyberpunk-transformed',
    name: 'Cyberpunk Monde Entier',
    emoji: '🤖🌍',
    preview: '/previews/cyberpunk-transformed.jpg'
  },
  {
    id: 'retro-80s-original',
    name: 'Vintage 80s Fond Original',
    emoji: '📼📷',
    preview: '/previews/retro-80s-original.jpg'
  },
  {
    id: 'retro-80s-transformed',
    name: 'Vintage 80s Monde Entier',
    emoji: '📼🌍',
    preview: '/previews/retro-80s-transformed.jpg'
  },
  {
    id: 'disco-original',
    name: 'Disco 70s Fond Original',
    emoji: '🕺📷',
    preview: '/previews/disco-original.jpg'
  },
  {
    id: 'disco-transformed',
    name: 'Disco 70s Monde Entier',
    emoji: '🕺🌍',
    preview: '/previews/disco-transformed.jpg'
  }
])

// Filtrage des fonds par onglet
const filteredBackgrounds = computed(() => {
  switch (activeTab.value) {
    case 'geographic':
      // Fonds géographiques (pays et villes)
      return backgrounds.value.filter(bg =>
        bg.id.includes('belgium') ||
        bg.id.includes('uk') ||
        bg.id.includes('germany') ||
        bg.id.includes('france') ||
        bg.id.includes('conflans') ||
        bg.id.includes('beach') ||
        bg.id.includes('brussels') ||
        bg.id.includes('chimay') ||
        bg.id.includes('paris')
      )
    case 'transformed':
      // Fonds "Monde Entier" (transformation complète)
      return backgrounds.value.filter(bg =>
        bg.id.includes('pure-transformed') ||
        bg.id.includes('monde-entier') ||
        bg.name.includes('Monde Entier') ||
        bg.id.includes('aura-glow-dreamworks-transformed') ||
        bg.id.includes('aura-glow-pixar-transformed') ||
        bg.id.includes('captain-future-transformed') ||
        bg.id.includes('kpop-pure-transformed') ||
        bg.id.includes('pop-art-warhol-transformed') ||
        bg.id.includes('superhero-transformed') ||
        bg.id.includes('film-noir-transformed') ||
        bg.id.includes('vaporwave-transformed') ||
        bg.id.includes('cyberpunk-transformed') ||
        bg.id.includes('retro-80s-transformed') ||
        bg.id.includes('disco-transformed')
      )
    case 'original':
      // Fonds "Monde Original" (fond original conservé)
      return backgrounds.value.filter(bg =>
        bg.id.includes('pure-original') ||
        bg.id.includes('fond-original') ||
        bg.name.includes('Fond Original') ||
        bg.id.includes('captain-future-original') ||
        bg.id.includes('kpop-pure-original') ||
        bg.id.includes('pop-art-warhol-original') ||
        bg.id.includes('superhero-original') ||
        bg.id.includes('film-noir-original') ||
        bg.id.includes('vaporwave-original') ||
        bg.id.includes('cyberpunk-original') ||
        bg.id.includes('retro-80s-original') ||
        bg.id.includes('disco-original')
      )
    default:
    return backgrounds.value
  }
})

const selectBackground = (background) => {
  // Si le fond n'est pas dans l'onglet actuel, changer d'onglet d'abord
  if (!filteredBackgrounds.value.some(bg => bg.id === background.id)) {
    // Trouver dans quel onglet se trouve ce fond
    if (background.id.includes('belgium') || background.id.includes('uk') || background.id.includes('germany') || 
        background.id.includes('france') || background.id.includes('conflans') || background.id.includes('beach') || 
        background.id.includes('brussels') || background.id.includes('chimay') || background.id.includes('paris')) {
      activeTab.value = 'geographic'
    } else if (background.id.includes('pure-transformed') || background.id.includes('monde-entier') ||
               background.name.includes('Monde Entier') || background.id.includes('aura-glow-dreamworks-transformed') ||
               background.id.includes('aura-glow-pixar-transformed') || background.id.includes('captain-future-transformed') ||
               background.id.includes('kpop-pure-transformed') || background.id.includes('pop-art-warhol-transformed') ||
               background.id.includes('superhero-transformed') || background.id.includes('film-noir-transformed') ||
               background.id.includes('vaporwave-transformed') || background.id.includes('cyberpunk-transformed') ||
               background.id.includes('retro-80s-transformed') || background.id.includes('disco-transformed')) {
      activeTab.value = 'transformed'
    } else if (background.id.includes('pure-original') || background.id.includes('fond-original') ||
               background.name.includes('Fond Original') || background.id.includes('captain-future-original') ||
               background.id.includes('kpop-pure-original') || background.id.includes('pop-art-warhol-original') ||
               background.id.includes('superhero-original') || background.id.includes('film-noir-original') ||
               background.id.includes('vaporwave-original') || background.id.includes('cyberpunk-original') ||
               background.id.includes('retro-80s-original') || background.id.includes('disco-original')) {
      activeTab.value = 'original'
    }
    
    // Attendre un tick pour que l'onglet se mette à jour, puis sélectionner
    nextTick(() => {
      selectedBackground.value = background
      console.log('🎬 Fond sélectionné:', background.name)
      emit('select', background)
    })
  } else {
    // Le fond est dans l'onglet actuel, le sélectionner directement
    selectedBackground.value = background
    console.log('🎬 Fond sélectionné:', background.name)
    emit('select', background)
  }
}
</script>

<style scoped>
/* Animations pour le sélecteur de fonds */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group:hover img {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

/* Scrollbar personnalisée pour le sélecteur */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>