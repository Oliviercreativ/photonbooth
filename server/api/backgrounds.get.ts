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
    }
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