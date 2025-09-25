// server/api/backgrounds.get.ts
export default defineEventHandler(async (event) => {
  const backgrounds = [
    {
      id: 'brussels-grand-place',
      name: 'Grand-Place Bruxelles',
      emoji: '🏛️',
      description: 'Place historique UNESCO avec maisons de guildes',
      country: 'Belgique',
      category: 'historique',
      preview: '/previews/brussels-thumb.jpg',
      featured: true
    },
    {
      id: 'paris-eiffel',
      name: 'Tour Eiffel Paris',
      emoji: '🗼',
      description: 'Monument emblématique depuis Trocadéro',
      country: 'France',
      category: 'monument',
      preview: '/previews/paris-thumb.jpg',
      featured: true
    },
    {
      id: 'chimay-cathedral',
      name: 'Cathédrale Chimay',
      emoji: '⛪',
      description: 'Architecture gothique belge authentique',
      country: 'Belgique',
      category: 'religieux',
      preview: '/previews/chimay-thumb.jpg',
      featured: true
    },
    {
      id: 'tropical-beach',
      name: 'Plage Tropicale',
      emoji: '🏝️',
      description: 'Paradis tropical aux eaux turquoise',
      country: 'Maldives',
      category: 'nature',
      preview: '/previews/beach-thumb.jpg',
      featured: false
    },
    {
      id: 'tokyo-street',
      name: 'Tokyo Moderne',
      emoji: '🏙️',
      description: 'Rues animées de Shibuya',
      country: 'Japon',
      category: 'urbain',
      preview: '/previews/tokyo-thumb.jpg',
      featured: false
    },
    {
      id: 'mountain-alps',
      name: 'Alpes Suisses',
      emoji: '⛰️',
      description: 'Sommets enneigés alpins',
      country: 'Suisse',
      category: 'nature',
      preview: '/previews/alps-thumb.jpg',
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
    },
    {
      id: 'street-caricature',
      name: 'Caricature de Rue',
      emoji: '🎨✏️',
      description: 'Style caricature artistique de rue',
      country: 'Artistique',
      category: 'artistique',
      preview: '/previews/street-caricature.jpg',
      featured: true
    },
    {
      id: 'street-caricature-belgium',
      name: 'Caricature Rue Belgique',
      emoji: '🎨🇧🇪',
      description: 'Caricature de rue dans décor belge',
      country: 'Belgique',
      category: 'artistique',
      preview: '/previews/street-caricature-belgium.jpg',
      featured: true
    },
    {
      id: 'street-caricature-uk',
      name: 'Caricature Rue Grande-Bretagne',
      emoji: '🎨🇬🇧',
      description: 'Caricature de rue dans décor britannique',
      country: 'Royaume-Uni',
      category: 'artistique',
      preview: '/previews/street-caricature-uk.jpg',
      featured: true
    },
    {
      id: 'street-caricature-germany',
      name: 'Caricature Rue Allemagne',
      emoji: '🎨🇩🇪',
      description: 'Caricature de rue dans décor Oktoberfest',
      country: 'Allemagne',
      category: 'artistique',
      preview: '/previews/street-caricature-germany.jpg',
      featured: true
    },
    {
      id: 'street-caricature-france',
      name: 'Caricature Rue France',
      emoji: '🎨🇫🇷',
      description: 'Caricature de rue dans décor français',
      country: 'France',
      category: 'artistique',
      preview: '/previews/street-caricature-france.jpg',
      featured: true
    },
    {
      id: 'street-caricature-conflans',
      name: 'Caricature Rue Conflans',
      emoji: '🎨🏘️',
      description: 'Caricature de rue à Conflans Sainte Honorine',
      country: 'France',
      category: 'artistique',
      preview: '/previews/street-caricature-conflans.jpg',
      featured: true
    },
    {
      id: 'dreamworks-inspired',
      name: 'DreamWorks 3D Style',
      emoji: '🎬✨',
      description: 'Style animation 3D DreamWorks-inspired',
      country: 'Animation',
      category: 'artistique',
      preview: '/previews/dreamworks-inspired.jpg',
      featured: true
    },
    {
      id: 'dreamworks-belgium',
      name: 'DreamWorks Belgique',
      emoji: '🎬🇧🇪',
      description: 'Personnage DreamWorks dans décor belge',
      country: 'Belgique',
      category: 'artistique',
      preview: '/previews/dreamworks-belgium.jpg',
      featured: true
    },
    {
      id: 'dreamworks-uk',
      name: 'DreamWorks Grande-Bretagne',
      emoji: '🎬🇬🇧',
      description: 'Personnage DreamWorks dans décor britannique',
      country: 'Royaume-Uni',
      category: 'artistique',
      preview: '/previews/dreamworks-uk.jpg',
      featured: true
    },
    {
      id: 'dreamworks-germany',
      name: 'DreamWorks Allemagne',
      emoji: '🎬🇩🇪',
      description: 'Personnage DreamWorks dans décor Oktoberfest',
      country: 'Allemagne',
      category: 'artistique',
      preview: '/previews/dreamworks-germany.jpg',
      featured: true
    },
    {
      id: 'dreamworks-france',
      name: 'DreamWorks France',
      emoji: '🎬🇫🇷',
      description: 'Personnage DreamWorks dans décor français',
      country: 'France',
      category: 'artistique',
      preview: '/previews/dreamworks-france.jpg',
      featured: true
    },
    {
      id: 'dreamworks-conflans',
      name: 'DreamWorks Conflans',
      emoji: '🎬🏘️',
      description: 'Personnage DreamWorks à Conflans Sainte Honorine',
      country: 'France',
      category: 'artistique',
      preview: '/previews/dreamworks-conflans.jpg',
      featured: true
    },
    {
      id: 'pixar-pure-original',
      name: 'Pixar Fond Original',
      emoji: '🎭📷',
      description: 'Personnage Pixar avec fond original de la photo',
      country: 'Animation',
      category: 'artistique',
      preview: '/previews/pixar-pure-original.jpg',
      featured: true
    },
    {
      id: 'pixar-pure-transformed',
      name: 'Pixar Monde Entier',
      emoji: '🎭🌍',
      description: 'Personnage et fond entièrement transformés en Pixar',
      country: 'Animation',
      category: 'artistique',
      preview: '/previews/pixar-pure-transformed.jpg',
      featured: true
    },
    {
      id: 'ghibli-pure-original',
      name: 'Ghibli Fond Original',
      emoji: '🎨📷',
      description: 'Personnage Ghibli avec fond original de la photo',
      country: 'Animation',
      category: 'artistique',
      preview: '/previews/ghibli-pure-original.jpg',
      featured: true
    },
    {
      id: 'ghibli-pure-transformed',
      name: 'Ghibli Monde Entier',
      emoji: '🎨🌍',
      description: 'Personnage et fond entièrement transformés en Ghibli',
      country: 'Animation',
      category: 'artistique',
      preview: '/previews/ghibli-pure-transformed.jpg',
      featured: true
    },
    {
      id: 'disney-pure-original',
      name: 'Disney Fond Original',
      emoji: '🏰📷',
      description: 'Personnage Disney avec fond original de la photo',
      country: 'Animation',
      category: 'artistique',
      preview: '/previews/disney-pure-original.jpg',
      featured: true
    },
    {
      id: 'disney-pure-transformed',
      name: 'Disney Monde Entier',
      emoji: '🏰🌍',
      description: 'Personnage et fond entièrement transformés en Disney',
      country: 'Animation',
      category: 'artistique',
      preview: '/previews/disney-pure-transformed.jpg',
      featured: true
    },
    {
      id: 'caricature-pure-transformed',
      name: 'Caricature Monde Entier',
      emoji: '🎨✏️🌍',
      description: 'Personnage et fond entièrement transformés en caricature',
      country: 'Artistique',
      category: 'artistique',
      preview: '/previews/caricature-pure-transformed.jpg',
      featured: true
    },
    {
      id: 'dreamworks-pure-original',
      name: 'DreamWorks Fond Original',
      emoji: '🎬📷',
      description: 'Personnage DreamWorks avec fond original de la photo',
      country: 'Animation',
      category: 'artistique',
      preview: '/previews/dreamworks-pure-original.jpg',
      featured: true
    },
    {
      id: 'aura-glow-pure-original',
      name: 'Aura Lumineuse Fond Original',
      emoji: '✨📷',
      description: 'Personnage avec aura lumineuse et fond original',
      country: 'Mystique',
      category: 'artistique',
      preview: '/previews/aura-glow-pure-original.jpg',
      featured: true
    },
    {
      id: 'aura-glow-dreamworks-transformed',
      name: 'Aura DreamWorks Monde Entier',
      emoji: '✨🎬🌍',
      description: 'Personnage DreamWorks avec aura et fond transformé',
      country: 'Mystique',
      category: 'artistique',
      preview: '/previews/aura-glow-dreamworks-transformed.jpg',
      featured: true
    },
    {
      id: 'aura-glow-pixar-transformed',
      name: 'Aura Pixar Monde Entier',
      emoji: '✨🎭🌍',
      description: 'Personnage Pixar avec aura et fond transformé',
      country: 'Mystique',
      category: 'artistique',
      preview: '/previews/aura-glow-pixar-transformed.jpg',
      featured: true
    },
    {
      id: 'captain-future-transformed',
      name: 'Capitaine Flam Monde Entier',
      emoji: '🚀👨‍🚀🌍',
      description: 'Style rétro-futuriste Capitaine Flam avec fond transformé',
      country: 'Rétro',
      category: 'artistique',
      preview: '/previews/captain-future-transformed.jpg',
      featured: true
    },
    {
      id: 'captain-future-original',
      name: 'Capitaine Flam Fond Original',
      emoji: '🚀👨‍🚀📷',
      description: 'Personnage Capitaine Flam avec fond original',
      country: 'Rétro',
      category: 'artistique',
      preview: '/previews/captain-future-original.jpg',
      featured: true
    },
    {
      id: 'cites-or-transformed',
      name: 'Cités d\'Or Monde Entier',
      emoji: '🏛️✨🌍',
      description: 'Style Cités d\'Or avec décor Pixar 3D',
      country: 'Aventure',
      category: 'artistique',
      preview: '/previews/cites-or-transformed.jpg',
      featured: true
    },
    {
      id: 'frozen-transformed',
      name: 'Reine des Neiges Monde Entier',
      emoji: '❄️👑🌍',
      description: 'Style Reine des Neiges avec décor Pixar 3D',
      country: 'Magique',
      category: 'artistique',
      preview: '/previews/frozen-transformed.jpg',
      featured: true
    },
    {
      id: 'kpop-pure-original',
      name: 'K-pop Demon Hunter Fond Original',
      emoji: '👹📷',
      description: 'Style K-pop Demon Hunter avec fond original de la photo',
      country: 'K-pop',
      category: 'artistique',
      preview: '/previews/kpop-pure-original.jpg',
      featured: true
    },
    {
      id: 'kpop-pure-transformed',
      name: 'K-pop Demon Hunter Monde Entier',
      emoji: '👹🌍',
      description: 'Style K-pop Demon Hunter avec décor sombre transformé',
      country: 'K-pop',
      category: 'artistique',
      preview: '/previews/kpop-pure-transformed.jpg',
      featured: true
    },
  ]

  const query = getQuery(event)
  
  // Filtres optionnels
  let filtered = backgrounds
  
  if (query.featured) {
    filtered = filtered.filter(bg => bg.featured)
  }
  
  if (query.category) {
    filtered = filtered.filter(bg => bg.category === query.category)
  }
  
  if (query.country) {
    filtered = filtered.filter(bg => bg.country === query.country)
  }

  return {
    backgrounds: filtered,
    total: filtered.length,
    categories: [...new Set(backgrounds.map(bg => bg.category))],
    countries: [...new Set(backgrounds.map(bg => bg.country))]
  }
})