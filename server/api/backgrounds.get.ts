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