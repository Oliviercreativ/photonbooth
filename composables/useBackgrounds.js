// composables/useBackgrounds.js
export const useBackgrounds = () => {
  const backgrounds = ref([])
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Charger les fonds depuis l'API
  const loadBackgrounds = async () => {
    if (backgrounds.value.length > 0) return // Déjà chargé

    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/backgrounds')
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }

      const data = await response.json()
      backgrounds.value = data.backgrounds || []
      categories.value = ['all', ...(data.categories || [])]

      console.log('Fonds chargés:', backgrounds.value.length)
    } catch (err) {
      console.error('Erreur chargement fonds:', err)
      error.value = err.message
      
      // Fallback avec fonds par défaut
      backgrounds.value = [
        {
          id: 'brussels-grand-place',
          name: 'Grand-Place Bruxelles',
          emoji: '🏛️',
          description: 'Place historique UNESCO avec maisons de guildes',
          country: 'Belgique',
          category: 'historique',
          preview: '/previews/brussels.jpg',
          featured: true
        },
        {
          id: 'chimay-cathedral',
          name: 'Cathédrale Chimay',
          emoji: '⛪',
          description: 'Architecture gothique belge authentique',
          country: 'Belgique',
          category: 'religieux',
          preview: '/previews/chimay.jpg',
          featured: true
        },
        {
          id: 'paris-eiffel',
          name: 'Tour Eiffel Paris',
          emoji: '🗼',
          description: 'Monument emblématique depuis Trocadéro',
          country: 'France',
          category: 'monument',
          preview: '/previews/paris.jpg',
          featured: true
        },
        {
          id: 'tropical-beach',
          name: 'Plage Tropicale',
          emoji: '🏝️',
          description: 'Paradis tropical aux eaux turquoise',
          country: 'Maldives',
          category: 'nature',
          preview: '/previews/beach.jpg',
          featured: false
        },
        {
          id: 'pixar-caricature',
          name: 'Caricature Pixar 3D',
          emoji: '🎭',
          description: 'Style Pixar avec personnage 3D caricaturé',
          country: 'Animation',
          category: 'artistique',
          preview: '/previews/pixar.jpg',
          featured: true
        },
        {
          id: 'belgium-patriotic',
          name: 'Belgique Patriotique',
          emoji: '🇧🇪',
          description: 'Drapeau belge avec spécialités culinaires',
          country: 'Belgique',
          category: 'patriotique',
          preview: '/previews/belgium.jpg',
          featured: true
        },
        {
          id: 'pixar-belgium',
          name: 'Pixar Belgique 3D',
          emoji: '🎭🇧🇪',
          description: 'Personnage Pixar 3D dans décor belge',
          country: 'Belgique',
          category: 'artistique',
          preview: '/previews/pixar-belgium.jpg',
          featured: true
        },
        {
          id: 'pixar-uk',
          name: 'Pixar Grande-Bretagne 3D',
          emoji: '🎭🇬🇧',
          description: 'Personnage Pixar 3D dans décor britannique',
          country: 'Royaume-Uni',
          category: 'artistique',
          preview: '/previews/pixar-uk.jpg',
          featured: true
        },
        {
          id: 'pixar-germany',
          name: 'Pixar Oktoberfest 3D',
          emoji: '🎭🇩🇪',
          description: 'Personnage Pixar 3D dans décor Oktoberfest',
          country: 'Allemagne',
          category: 'artistique',
          preview: '/previews/pixar-germany.jpg',
          featured: true
        },
        {
          id: 'ghibli-belgium',
          name: 'Studio Ghibli Belgique',
          emoji: '🎨🇧🇪',
          description: 'Personnage Studio Ghibli dans décor belge',
          country: 'Belgique',
          category: 'artistique',
          preview: '/previews/ghibli-belgium.jpg',
          featured: true
        },
        {
          id: 'ghibli-uk',
          name: 'Studio Ghibli Grande-Bretagne',
          emoji: '🎨🇬🇧',
          description: 'Personnage Studio Ghibli dans décor britannique',
          country: 'Royaume-Uni',
          category: 'artistique',
          preview: '/previews/ghibli-uk.jpg',
          featured: true
        },
        {
          id: 'ghibli-germany',
          name: 'Studio Ghibli Allemagne',
          emoji: '🎨🇩🇪',
          description: 'Personnage Studio Ghibli dans décor Oktoberfest',
          country: 'Allemagne',
          category: 'artistique',
          preview: '/previews/ghibli-germany.jpg',
          featured: true
        },
        {
          id: 'ghibli-france',
          name: 'Studio Ghibli France',
          emoji: '🎨🇫🇷',
          description: 'Personnage Studio Ghibli dans décor français',
          country: 'France',
          category: 'artistique',
          preview: '/previews/ghibli-france.jpg',
          featured: true
        },
        {
          id: 'ghibli-conflans',
          name: 'Studio Ghibli Conflans',
          emoji: '🎨🏘️',
          description: 'Personnage Studio Ghibli à Conflans Sainte Honorine',
          country: 'France',
          category: 'artistique',
          preview: '/previews/ghibli-conflans.jpg',
          featured: true
        },
        {
          id: 'pixar-pure',
          name: 'Pixar Caricature Pure',
          emoji: '🎭✨',
          description: 'Transformation Pixar 3D pure sans contexte géographique',
          country: 'Animation',
          category: 'artistique',
          preview: '/previews/pixar-pure.jpg',
          featured: true
        },
        {
          id: 'ghibli-pure',
          name: 'Studio Ghibli Pure',
          emoji: '🎨✨',
          description: 'Transformation Studio Ghibli pure sans contexte géographique',
          country: 'Animation',
          category: 'artistique',
          preview: '/previews/ghibli-pure.jpg',
          featured: true
        },
        {
          id: 'disney-inspired',
          name: 'Classic Animation Style',
          emoji: '🏰✨',
          description: 'Transformation en style animation classique traditionnel',
          country: 'Animation',
          category: 'artistique',
          preview: '/previews/disney-inspired.jpg',
          featured: true
        },
        {
          id: 'disney-belgium',
          name: 'Classic Animation Belgique',
          emoji: '🏰🇧🇪',
          description: 'Personnage animation classique dans décor belge',
          country: 'Belgique',
          category: 'artistique',
          preview: '/previews/disney-belgium.jpg',
          featured: true
        },
        {
          id: 'disney-uk',
          name: 'Classic Animation Grande-Bretagne',
          emoji: '🏰🇬🇧',
          description: 'Personnage animation classique dans décor britannique',
          country: 'Royaume-Uni',
          category: 'artistique',
          preview: '/previews/disney-uk.jpg',
          featured: true
        },
        {
          id: 'disney-germany',
          name: 'Classic Animation Allemagne',
          emoji: '🏰🇩🇪',
          description: 'Personnage animation classique dans décor Oktoberfest',
          country: 'Allemagne',
          category: 'artistique',
          preview: '/previews/disney-germany.jpg',
          featured: true
        },
        {
          id: 'disney-france',
          name: 'Classic Animation France',
          emoji: '🏰🇫🇷',
          description: 'Personnage animation classique dans décor français',
          country: 'France',
          category: 'artistique',
          preview: '/previews/disney-france.jpg',
          featured: true
        },
        {
          id: 'disney-conflans',
          name: 'Classic Animation Conflans',
          emoji: '🏰🏘️',
          description: 'Personnage animation classique à Conflans Sainte Honorine',
          country: 'France',
          category: 'artistique',
          preview: '/previews/disney-conflans.jpg',
          featured: true
        }
      ]
      categories.value = ['all', 'historique', 'monument', 'religieux', 'nature', 'artistique', 'patriotique']
    } finally {
      loading.value = false
    }
  }

  // Charger automatiquement au montage
  onMounted(() => {
    loadBackgrounds()
  })

  // Getters
  const getBackgroundById = (id) => {
    return backgrounds.value.find(bg => bg.id === id)
  }

  const getBackgroundsByCategory = (category) => {
    if (category === 'all') return backgrounds.value
    return backgrounds.value.filter(bg => bg.category === category)
  }

  const getFeaturedBackgrounds = () => {
    return backgrounds.value.filter(bg => bg.featured)
  }

  return {
    // État réactif
    backgrounds: readonly(backgrounds),
    categories: readonly(categories),
    loading: readonly(loading),
    error: readonly(error),

    // Actions
    loadBackgrounds,

    // Getters
    getBackgroundById,
    getBackgroundsByCategory,
    getFeaturedBackgrounds
  }
}
