// server/api/photobooth-guest.post.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  const contentType = getHeader(event, 'content-type') || ''
  
  let imageFile, backgroundId, highQuality, guestEmail, guestSessionId
  
  if (contentType.includes('multipart/form-data')) {
    // Gestion multipart/form-data (pour les uploads de fichiers)
    const formData = await readMultipartFormData(event)
    imageFile = formData?.find(field => field.name === 'image')
    backgroundId = formData?.find(field => field.name === 'background')?.data.toString()
    highQuality = formData?.find(field => field.name === 'high_quality')?.data.toString() === 'true'
    guestEmail = formData?.find(field => field.name === 'guest_email')?.data.toString()
    guestSessionId = formData?.find(field => field.name === 'guest_session_id')?.data.toString()
    
    // Vérifier si l'utilisateur invité a déjà une photo
    if (guestEmail) {
      const config = useRuntimeConfig()
      const supabaseUrl = config.supabaseUrl
      const supabaseServiceKey = config.supabaseServiceKey
      
      if (supabaseServiceKey) {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(supabaseUrl, supabaseServiceKey)
        
        const { data: existingPhoto, error } = await supabase
          .from('photos')
          .select('id, photo_url')
          .eq('guest_email', guestEmail)
          .eq('is_active', true)
          .limit(1)
        
        if (error) {
          console.error('❌ Erreur vérification photo existante:', error)
        } else if (existingPhoto && existingPhoto.length > 0) {
          console.log('🚫 Utilisateur invité a déjà une photo:', guestEmail)
          throw createError({
            statusCode: 403,
            statusMessage: 'Vous avez déjà une photo ! Les utilisateurs invités sont limités à une seule photo.'
          })
        }
      }
    }
  } else {
    // Gestion JSON (pour les changements de fond avec URL existante)
    const body = await readBody(event)
    const { imageUrl, backgroundId: bgId, highQuality: hq, guestEmail, guestSessionId } = body
    
    if (!imageUrl || !bgId) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'imageUrl et backgroundId requis' 
      })
    }
    
    // Télécharger l'image depuis l'URL
    try {
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error('Impossible de télécharger l\'image')
      }
      const imageBuffer = await imageResponse.arrayBuffer()
      
      // Créer un objet similaire à un fichier uploadé
      imageFile = {
        data: Buffer.from(imageBuffer),
        type: imageResponse.headers.get('content-type') || 'image/jpeg'
      }
      backgroundId = bgId
      highQuality = hq === true
    } catch (error) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: `Erreur téléchargement image: ${error.message}` 
      })
    }
  }
  
  if (!imageFile || !backgroundId) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Image et background requis' 
    })
  }

  const config = useRuntimeConfig()
  
  if (!config.geminiApiKey) {
    throw createError({ 
      statusCode: 500, 
      statusMessage: 'Clé API Gemini manquante' 
    })
  }

  // Conversion en base64
  const imageBase64 = Buffer.from(imageFile.data).toString('base64')
  
  // Prompts optimisés par destination
  const prompts = {
    'brussels-grand-place': highQuality 
      ? `Replace the green screen background with the magnificent UNESCO World Heritage Grand-Place in Brussels, Belgium. Show the stunning ornate baroque and gothic guild houses with their detailed facades surrounding the historic cobblestone square. Use warm golden hour lighting that naturally illuminates both the person(s) and the architectural masterpieces. Ensure the person(s) appear to be genuinely visiting this iconic Belgian landmark with proper perspective and realistic shadows. If multiple people are present, position them naturally together showing their interactions and relationships.`
      : `Replace green screen with Brussels Grand-Place, ornate guild houses, golden lighting, realistic shadows`,
    
    'paris-eiffel': highQuality
      ? `Replace the green background with an iconic Parisian scene featuring the Eiffel Tower. Position the person(s) as if they're at Trocadéro Gardens with the Iron Lady majestically rising in the background. Use romantic Parisian lighting - either golden sunset or charming evening illumination of the tower. Create natural depth and perspective so it looks like an authentic Paris vacation photo. If multiple people are present, position them naturally together showing their interactions and relationships.`
      : `Replace green with Eiffel Tower Paris from Trocadéro, sunset lighting, authentic vacation feel`,
    
    'chimay-cathedral': highQuality
      ? `Replace the green screen with the magnificent Gothic Cathedral of Chimay in Belgium. Show the towering limestone spires and detailed Gothic architecture with natural European afternoon lighting casting soft shadows. The person(s) should appear naturally positioned in front of this historic cathedral as if they're genuinely exploring this beautiful Belgian heritage site. If multiple people are present, position them naturally together showing their interactions and relationships.`
      : `Replace green with Gothic Cathedral Chimay Belgium, limestone spires, afternoon lighting`,
    
    'tropical-beach': highQuality
      ? `Replace the green background with a stunning tropical paradise beach scene. Feature crystal clear turquoise water, pristine white sand, and swaying palm trees during golden hour. Create warm, natural sunset lighting with gentle shadows. The person(s) should look like they're enjoying a perfect tropical vacation with the ocean breeze and paradise surroundings. If multiple people are present, position them naturally together showing their interactions and relationships.`
      : `Replace green with tropical beach paradise, turquoise water, palm trees, golden hour`,
    
    'tokyo-street': highQuality
      ? `Replace the green screen with a vibrant modern Tokyo street scene. Show neon signs, modern architecture, and the bustling urban atmosphere of Shibuya or Harajuku. Use dynamic city lighting with colorful neon reflections. The person(s) should appear as if they're experiencing the energy of modern Japan's capital city. If multiple people are present, position them naturally together showing their interactions and relationships.`
      : `Replace green with Tokyo street, neon signs, modern city, dynamic lighting`,
    
    'mountain-alps': highQuality
      ? `Replace the green background with majestic Swiss Alps mountain scenery. Show snow-capped peaks, alpine meadows, and crystal clear mountain air. Use natural mountain lighting with crisp, clean shadows. The person(s) should appear as if they're hiking or exploring these breathtaking Alpine landscapes with proper mountain perspective. If multiple people are present, position them naturally together showing their interactions and relationships.`
      : `Replace green with Swiss Alps, snow peaks, alpine meadows, mountain lighting`,
    
    'pixar-caricature': highQuality
      ? `Transform the person(s) into charming Pixar-style 3D caricature character(s). Create stylized, cartoon-like version(s) with exaggerated features typical of Pixar animation - large expressive eyes, simplified facial features, and warm, friendly appearance(s). Use vibrant Pixar-style colors with soft lighting and subtle subsurface scattering. The character(s) should have that distinctive Pixar 3D rendering with smooth surfaces, gentle shadows, and the characteristic "plastic" material look. If multiple people are present, position them naturally together showing their interactions and relationships. Make it look like character(s) that could appear in a Pixar movie with personality and charm.`
      : `Transform person(s) into Pixar 3D caricature character(s), stylized cartoon features, vibrant colors, soft lighting`,
    
    'belgium-patriotic': highQuality
      ? `Replace the green screen background with a patriotic Belgian scene featuring the iconic Belgian flag (black, yellow, red vertical stripes) prominently displayed. Include classic Belgian culinary specialties like golden Belgian waffles with whipped cream and strawberries, a glass of Belgian beer with foam, Belgian chocolate truffles, and Belgian fries in a paper cone. Add Belgian landmarks like the Atomium structure or Brussels architecture in the background. Use warm, inviting lighting that celebrates Belgian culture and heritage. The person(s) should appear naturally integrated into this Belgian celebration scene. If multiple people are present, position them naturally together showing their interactions and relationships.`
      : `Replace green with Belgian flag, waffles, beer, chocolate, fries, Atomium, patriotic Belgian scene`,
    
    'pixar-belgium': highQuality
      ? `Transform the person(s) into charming Pixar-style 3D caricature character(s) and place them in a delightful Belgian-themed environment. Create stylized, cartoon-like version(s) with exaggerated Pixar features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a Belgian celebration scene featuring the iconic Belgian flag (black, yellow, red vertical stripes), golden Belgian waffles with whipped cream, Belgian beer with foam, Belgian chocolate truffles, Belgian fries, and the Atomium structure in the background. Use vibrant Pixar-style colors with soft lighting, subsurface scattering, and the characteristic "plastic" material look. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a Pixar movie celebrating Belgian culture with authentic Belgian elements rendered in Pixar's signature 3D style.`
      : `Transform person(s) into Pixar 3D character(s) in Belgian scene with flag, waffles, beer, chocolate, Atomium`,
    
    'pixar-uk': highQuality
      ? `Transform the person(s) into charming Pixar-style 3D caricature character(s) and place them in a delightful British-themed environment. Create stylized, cartoon-like version(s) with exaggerated Pixar features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a British celebration scene featuring the iconic Union Jack flag (red, white, blue), traditional British elements like Big Ben clock tower, red double-decker bus, black taxi cab, British tea service with scones and jam, fish and chips, and London landmarks in the background. Use vibrant Pixar-style colors with soft lighting, subsurface scattering, and the characteristic "plastic" material look. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a Pixar movie celebrating British culture with authentic British elements rendered in Pixar's signature 3D style.`
      : `Transform person(s) into Pixar 3D character(s) in British scene with Union Jack, Big Ben, tea, fish and chips`,
    
    'pixar-germany': highQuality
      ? `Transform the person(s) into charming Pixar-style 3D caricature character(s) and place them in a delightful German Oktoberfest-themed environment. Create stylized, cartoon-like version(s) with exaggerated Pixar features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a German Oktoberfest celebration scene featuring the iconic German flag (black, red, yellow horizontal stripes), traditional German elements like beer steins with foam, pretzels, bratwurst sausages, sauerkraut, German beer hall with wooden tables, lederhosen and dirndl clothing elements, and Bavarian architecture in the background. Use vibrant Pixar-style colors with soft lighting, subsurface scattering, and the characteristic "plastic" material look. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a Pixar movie celebrating German Oktoberfest culture with authentic German elements rendered in Pixar's signature 3D style.`
      : `Transform person(s) into Pixar 3D character(s) in Oktoberfest scene with German flag, beer steins, pretzels, bratwurst`,
    
    'ghibli-belgium': highQuality
      ? `Transform the person(s) into charming Studio Ghibli-style character(s) and place them in a delightful Belgian-themed environment. Create stylized, hand-drawn animation character(s) with the signature Ghibli features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a Belgian celebration scene featuring the iconic Belgian flag (black, yellow, red vertical stripes), golden Belgian waffles with whipped cream, Belgian beer with foam, Belgian chocolate truffles, Belgian fries, and the Atomium structure in the background. Use the characteristic Ghibli color palette with soft pastels, warm earth tones, and gentle watercolor-like textures. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a Studio Ghibli movie celebrating Belgian culture with authentic Belgian elements rendered in Ghibli's signature hand-painted animation style.`
      : `Transform person(s) into Ghibli character(s) in Belgian scene with flag, waffles, beer, chocolate, Atomium`,
    
    'ghibli-uk': highQuality
      ? `Transform the person(s) into charming Studio Ghibli-style character(s) and place them in a delightful British-themed environment. Create stylized, hand-drawn animation character(s) with the signature Ghibli features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a British celebration scene featuring the iconic Union Jack flag (red, white, blue), traditional British elements like Big Ben clock tower, red double-decker bus, black taxi cab, British tea service with scones and jam, fish and chips, and London landmarks in the background. Use the characteristic Ghibli color palette with soft pastels, muted greens, and gentle watercolor-like textures. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a Studio Ghibli movie celebrating British culture with authentic British elements rendered in Ghibli's signature hand-painted animation style.`
      : `Transform person(s) into Ghibli character(s) in British scene with Union Jack, Big Ben, tea, fish and chips`,
    
    'ghibli-germany': highQuality
      ? `Transform the person(s) into charming Studio Ghibli-style character(s) and place them in a delightful German Oktoberfest-themed environment. Create stylized, hand-drawn animation character(s) with the signature Ghibli features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a German Oktoberfest celebration scene featuring the iconic German flag (black, red, yellow horizontal stripes), traditional German elements like beer steins with foam, pretzels, bratwurst sausages, sauerkraut, German beer hall with wooden tables, lederhosen and dirndl clothing elements, and Bavarian architecture in the background. Use the characteristic Ghibli color palette with soft pastels, warm earth tones, and gentle watercolor-like textures. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a Studio Ghibli movie celebrating German Oktoberfest culture with authentic German elements rendered in Ghibli's signature hand-painted animation style.`
      : `Transform person(s) into Ghibli character(s) in Oktoberfest scene with German flag, beer steins, pretzels, bratwurst`,
    
    'ghibli-france': highQuality
      ? `Transform the person(s) into charming Studio Ghibli-style character(s) and place them in a delightful French-themed environment. Create stylized, hand-drawn animation character(s) with the signature Ghibli features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a French celebration scene featuring the iconic French flag (blue, white, red vertical stripes), traditional French elements like croissants, baguettes, French wine, cheese platter, the Eiffel Tower, French café with outdoor seating, and Parisian architecture in the background. Use the characteristic Ghibli color palette with soft pastels, warm earth tones, and gentle watercolor-like textures. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a Studio Ghibli movie celebrating French culture with authentic French elements rendered in Ghibli's signature hand-painted animation style.`
      : `Transform person(s) into Ghibli character(s) in French scene with French flag, croissants, wine, Eiffel Tower`,
    
    'ghibli-conflans': highQuality
      ? `Transform the person(s) into charming Studio Ghibli-style character(s) and place them in a delightful Conflans Sainte Honorine-themed environment. Create stylized, hand-drawn animation character(s) with the signature Ghibli features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a Conflans celebration scene featuring the iconic French flag (blue, white, red vertical stripes), traditional French elements like the historic church of Saint Honorine, the Seine river with boats, French pastries, local specialties, charming riverside houses, and the peaceful atmosphere of this historic French town in the background. Use the characteristic Ghibli color palette with soft pastels, warm earth tones, and gentle watercolor-like textures. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a Studio Ghibli movie celebrating Conflans Sainte Honorine culture with authentic local elements rendered in Ghibli's signature hand-painted animation style.`
      : `Transform person(s) into Ghibli character(s) in Conflans scene with French flag, church, Seine river, local specialties`,
    
    'pixar-pure': highQuality
      ? `Transform the person(s) into charming Pixar-style 3D caricature character(s). Create stylized, cartoon-like version(s) with exaggerated Pixar features - large expressive eyes, simplified facial features, and warm, friendly appearance(s). Use vibrant Pixar-style colors with soft lighting and subtle subsurface scattering. The character(s) should have that distinctive Pixar 3D rendering with smooth surfaces, gentle shadows, and the characteristic "plastic" material look. If multiple people are present, position them naturally together showing their interactions and relationships. Make it look like character(s) that could appear in any Pixar movie with personality and charm.`
      : `Transform person(s) into Pixar 3D caricature character(s), stylized cartoon features, vibrant colors, soft lighting`,
    
    'ghibli-pure': highQuality
      ? `Transform the person(s) into charming Studio Ghibli-style character(s). Create stylized, hand-drawn animation character(s) with the signature Ghibli features - large expressive eyes, simplified facial features, and warm personality. Use the characteristic Ghibli color palette with soft pastels, warm earth tones, and gentle watercolor-like textures. The character(s) should have that distinctive Ghibli hand-painted animation style with soft lighting, gentle shadows, and the characteristic artistic rendering. If multiple people are present, position them naturally together showing their interactions and relationships. Make it look like character(s) that could appear in any Studio Ghibli movie with that magical, innocent quality.`
      : `Transform person(s) into Ghibli character(s), hand-drawn animation, soft pastels, watercolor style`,
    
    'disney-inspired': highQuality
      ? `Transform the person(s) into charming classic animated character(s) with traditional Disney-style features - large expressive eyes, simplified facial features, and warm, friendly personality. Create stylized, hand-drawn animation character(s) with vibrant colors, soft lighting, and the characteristic cel animation look. The character(s) should have that distinctive classic animation rendering with smooth surfaces, gentle shadows, and the characteristic "hand-painted" material look. If multiple people are present, position them naturally together showing their interactions and relationships. Make it look like original character(s) inspired by classic animation techniques with personality and charm.`
      : `Transform person(s) into classic animated character(s), traditional animation style, vibrant colors, cel animation look`,
    
    'disney-belgium': highQuality
      ? `Transform the person(s) into charming classic animated character(s) and place them in a delightful Belgian-themed environment. Create stylized, hand-drawn animation character(s) with traditional Disney-style features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a Belgian celebration scene featuring the iconic Belgian flag (black, yellow, red vertical stripes), golden Belgian waffles with whipped cream, Belgian beer with foam, Belgian chocolate truffles, Belgian fries, and the Atomium structure in the background. Use vibrant classic animation colors with soft lighting and the characteristic cel animation look. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a classic animated movie celebrating Belgian culture with authentic Belgian elements rendered in traditional animation style.`
      : `Transform person(s) into classic animated character(s) in Belgian scene with flag, waffles, beer, chocolate, Atomium`,
    
    'disney-uk': highQuality
      ? `Transform the person(s) into charming classic animated character(s) and place them in a delightful British-themed environment. Create stylized, hand-drawn animation character(s) with traditional Disney-style features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a British celebration scene featuring the iconic Union Jack flag (red, white, blue), traditional British elements like Big Ben clock tower, red double-decker bus, black taxi cab, British tea service with scones and jam, fish and chips, and London landmarks in the background. Use vibrant classic animation colors with soft lighting and the characteristic cel animation look. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a classic animated movie celebrating British culture with authentic British elements rendered in traditional animation style.`
      : `Transform person(s) into classic animated character(s) in British scene with Union Jack, Big Ben, tea, fish and chips`,
    
    'disney-germany': highQuality
      ? `Transform the person(s) into charming classic animated character(s) and place them in a delightful German Oktoberfest-themed environment. Create stylized, hand-drawn animation character(s) with traditional Disney-style features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a German Oktoberfest celebration scene featuring the iconic German flag (black, red, yellow horizontal stripes), traditional German elements like beer steins with foam, pretzels, bratwurst sausages, sauerkraut, German beer hall with wooden tables, lederhosen and dirndl clothing elements, and Bavarian architecture in the background. Use vibrant classic animation colors with soft lighting and the characteristic cel animation look. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a classic animated movie celebrating German Oktoberfest culture with authentic German elements rendered in traditional animation style.`
      : `Transform person(s) into classic animated character(s) in Oktoberfest scene with German flag, beer steins, pretzels, bratwurst`,
    
    'disney-france': highQuality
      ? `Transform the person(s) into charming classic animated character(s) and place them in a delightful French-themed environment. Create stylized, hand-drawn animation character(s) with traditional Disney-style features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a French celebration scene featuring the iconic French flag (blue, white, red vertical stripes), traditional French elements like croissants, baguettes, French wine, cheese platter, the Eiffel Tower, French café with outdoor seating, and Parisian architecture in the background. Use vibrant classic animation colors with soft lighting and the characteristic cel animation look. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a classic animated movie celebrating French culture with authentic French elements rendered in traditional animation style.`
      : `Transform person(s) into classic animated character(s) in French scene with French flag, croissants, wine, Eiffel Tower`,
    
    'disney-conflans': highQuality
      ? `Transform the person(s) into charming classic animated character(s) and place them in a delightful Conflans Sainte Honorine-themed environment. Create stylized, hand-drawn animation character(s) with traditional Disney-style features - large expressive eyes, simplified facial features, and warm personality. The character(s) should be positioned in a Conflans celebration scene featuring the iconic French flag (blue, white, red vertical stripes), traditional French elements like the historic church of Saint Honorine, the Seine river with boats, French pastries, local specialties, charming riverside houses, and the peaceful atmosphere of this historic French town in the background. Use vibrant classic animation colors with soft lighting and the characteristic cel animation look. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a classic animated movie celebrating Conflans Sainte Honorine culture with authentic local elements rendered in traditional animation style.`
      : `Transform person(s) into classic animated character(s) in Conflans scene with French flag, church, Seine river, local specialties`,
    
    'street-caricature': highQuality
      ? `Transform the person(s) into a vibrant street caricature drawing. Create an artistic caricature with exaggerated facial features, bold outlines, and expressive characteristics typical of street artists. The person(s) should be drawn with a playful, exaggerated style - larger eyes, prominent facial features, and a cartoonish but charming appearance. Use bright, bold colors with strong contrasts and visible brush strokes or pen lines. The drawing should have the authentic feel of a street caricature artist's work - slightly rough, artistic, and full of personality. Add artistic elements like visible paper texture, sketch lines, or an artist's signature corner. If multiple people are present, position them naturally together showing their interactions and relationships. The entire piece should look like a genuine street caricature that could be drawn by a talented artist at a festival or tourist spot.`
      : `Transform person(s) into street caricature drawing, bold outlines, exaggerated features, bright colors, artistic style`,
    
    'street-caricature-belgium': highQuality
      ? `Transform the person(s) into a vibrant street caricature drawing set in a Belgian festival atmosphere. Create an artistic caricature with exaggerated facial features, bold outlines, and expressive characteristics typical of street artists. The person(s) should be drawn with a playful, exaggerated style - larger eyes, prominent facial features, and a cartoonish but charming appearance. Place them in a Belgian celebration scene with the Belgian flag (black, yellow, red vertical stripes), Belgian waffles, beer, chocolate, and the Atomium structure in the background, all rendered in the same street caricature style. Use bright, bold colors with strong contrasts and visible brush strokes or pen lines. The drawing should have the authentic feel of a street caricature artist's work at a Belgian festival - slightly rough, artistic, and full of personality. Add artistic elements like visible paper texture, sketch lines, or an artist's signature corner. If multiple people are present, position them naturally together showing their interactions and relationships. The entire piece should look like a genuine street caricature drawn at a Belgian celebration.`
      : `Transform person(s) into street caricature in Belgian scene with flag, waffles, beer, Atomium, artistic style`,
    
    'street-caricature-uk': highQuality
      ? `Transform the person(s) into a vibrant street caricature drawing set in a British festival atmosphere. Create an artistic caricature with exaggerated facial features, bold outlines, and expressive characteristics typical of street artists. The person(s) should be drawn with a playful, exaggerated style - larger eyes, prominent facial features, and a cartoonish but charming appearance. Place them in a British celebration scene with the Union Jack flag (red, white, blue), Big Ben clock tower, red double-decker bus, British tea service, fish and chips, and London landmarks in the background, all rendered in the same street caricature style. Use bright, bold colors with strong contrasts and visible brush strokes or pen lines. The drawing should have the authentic feel of a street caricature artist's work at a British festival - slightly rough, artistic, and full of personality. Add artistic elements like visible paper texture, sketch lines, or an artist's signature corner. If multiple people are present, position them naturally together showing their interactions and relationships. The entire piece should look like a genuine street caricature drawn at a British celebration.`
      : `Transform person(s) into street caricature in British scene with Union Jack, Big Ben, tea, fish and chips, artistic style`,
    
    'street-caricature-germany': highQuality
      ? `Transform the person(s) into a vibrant street caricature drawing set in a German Oktoberfest atmosphere. Create an artistic caricature with exaggerated facial features, bold outlines, and expressive characteristics typical of street artists. The person(s) should be drawn with a playful, exaggerated style - larger eyes, prominent facial features, and a cartoonish but charming appearance. Place them in a German Oktoberfest celebration scene with the German flag (black, red, yellow horizontal stripes), beer steins, pretzels, bratwurst sausages, German beer hall with wooden tables, and Bavarian architecture in the background, all rendered in the same street caricature style. Use bright, bold colors with strong contrasts and visible brush strokes or pen lines. The drawing should have the authentic feel of a street caricature artist's work at an Oktoberfest festival - slightly rough, artistic, and full of personality. Add artistic elements like visible paper texture, sketch lines, or an artist's signature corner. If multiple people are present, position them naturally together showing their interactions and relationships. The entire piece should look like a genuine street caricature drawn at a German Oktoberfest celebration.`
      : `Transform person(s) into street caricature in Oktoberfest scene with German flag, beer steins, pretzels, bratwurst, artistic style`,
    
    'street-caricature-france': highQuality
      ? `Transform the person(s) into a vibrant street caricature drawing set in a French festival atmosphere. Create an artistic caricature with exaggerated facial features, bold outlines, and expressive characteristics typical of street artists. The person(s) should be drawn with a playful, exaggerated style - larger eyes, prominent facial features, and a cartoonish but charming appearance. Place them in a French celebration scene with the French flag (blue, white, red vertical stripes), croissants, baguettes, French wine, cheese platter, the Eiffel Tower, French café, and Parisian architecture in the background, all rendered in the same street caricature style. Use bright, bold colors with strong contrasts and visible brush strokes or pen lines. The drawing should have the authentic feel of a street caricature artist's work at a French festival - slightly rough, artistic, and full of personality. Add artistic elements like visible paper texture, sketch lines, or an artist's signature corner. If multiple people are present, position them naturally together showing their interactions and relationships. The entire piece should look like a genuine street caricature drawn at a French celebration.`
      : `Transform person(s) into street caricature in French scene with French flag, croissants, wine, Eiffel Tower, artistic style`,
    
    'street-caricature-conflans': highQuality
      ? `Transform the person(s) into a vibrant street caricature drawing set in Conflans Sainte Honorine. Create an artistic caricature with exaggerated facial features, bold outlines, and expressive characteristics typical of street artists. The person(s) should be drawn with a playful, exaggerated style - larger eyes, prominent facial features, and a cartoonish but charming appearance. Place them in a Conflans celebration scene with the French flag (blue, white, red vertical stripes), the historic church of Saint Honorine, the Seine river with boats, French pastries, local specialties, and charming riverside houses in the background, all rendered in the same street caricature style. Use bright, bold colors with strong contrasts and visible brush strokes or pen lines. The drawing should have the authentic feel of a street caricature artist's work in this historic French town - slightly rough, artistic, and full of personality. Add artistic elements like visible paper texture, sketch lines, or an artist's signature corner. If multiple people are present, position them naturally together showing their interactions and relationships. The entire piece should look like a genuine street caricature drawn in Conflans Sainte Honorine.`
      : `Transform person(s) into street caricature in Conflans scene with French flag, church, Seine river, local specialties, artistic style`,
    
    'dreamworks-inspired': highQuality
      ? `Transform the person(s) into charming DreamWorks-style 3D animated character(s). Create stylized, realistic 3D character(s) with the distinctive DreamWorks animation features - detailed facial expressions, realistic proportions with slight cartoonish exaggeration, and warm, engaging personality. Use the characteristic DreamWorks 3D rendering style with smooth surfaces, realistic lighting, subtle subsurface scattering, and the signature "DreamWorks glow" effect. The character(s) should have that distinctive DreamWorks 3D quality - more realistic than Pixar but still charming and animated. Use vibrant colors with natural lighting and the characteristic DreamWorks material rendering. If multiple people are present, position them naturally together showing their interactions and relationships. Make it look like character(s) that could appear in a DreamWorks animated movie with that distinctive DreamWorks 3D animation style and personality.`
      : `Transform person(s) into DreamWorks-style 3D character(s), realistic proportions, detailed expressions, DreamWorks 3D rendering`,
    
    'dreamworks-belgium': highQuality
      ? `Transform the person(s) into charming DreamWorks-style 3D animated character(s) and place them in a delightful Belgian-themed environment. Create stylized, realistic 3D character(s) with the distinctive DreamWorks animation features - detailed facial expressions, realistic proportions with slight cartoonish exaggeration, and warm personality. The character(s) should be positioned in a Belgian celebration scene featuring the iconic Belgian flag (black, yellow, red vertical stripes), Belgian waffles with whipped cream, Belgian beer with foam, Belgian chocolate truffles, Belgian fries, and the Atomium structure in the background, all rendered in the same DreamWorks 3D style. Use the characteristic DreamWorks 3D rendering with smooth surfaces, realistic lighting, subtle subsurface scattering, and the signature "DreamWorks glow" effect. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a DreamWorks animated movie celebrating Belgian culture with authentic Belgian elements rendered in distinctive DreamWorks 3D animation style.`
      : `Transform person(s) into DreamWorks-style 3D character(s) in Belgian scene with flag, waffles, beer, chocolate, Atomium`,
    
    'dreamworks-uk': highQuality
      ? `Transform the person(s) into charming DreamWorks-style 3D animated character(s) and place them in a delightful British-themed environment. Create stylized, realistic 3D character(s) with the distinctive DreamWorks animation features - detailed facial expressions, realistic proportions with slight cartoonish exaggeration, and warm personality. The character(s) should be positioned in a British celebration scene featuring the iconic Union Jack flag (red, white, blue), traditional British elements like Big Ben clock tower, red double-decker bus, black taxi cab, British tea service with scones and jam, fish and chips, and London landmarks in the background, all rendered in the same DreamWorks 3D style. Use the characteristic DreamWorks 3D rendering with smooth surfaces, realistic lighting, subtle subsurface scattering, and the signature "DreamWorks glow" effect. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a DreamWorks animated movie celebrating British culture with authentic British elements rendered in distinctive DreamWorks 3D animation style.`
      : `Transform person(s) into DreamWorks-style 3D character(s) in British scene with Union Jack, Big Ben, tea, fish and chips`,
    
    'dreamworks-germany': highQuality
      ? `Transform the person(s) into charming DreamWorks-style 3D animated character(s) and place them in a delightful German Oktoberfest-themed environment. Create stylized, realistic 3D character(s) with the distinctive DreamWorks animation features - detailed facial expressions, realistic proportions with slight cartoonish exaggeration, and warm personality. The character(s) should be positioned in a German Oktoberfest celebration scene featuring the iconic German flag (black, red, yellow horizontal stripes), traditional German elements like beer steins with foam, pretzels, bratwurst sausages, sauerkraut, German beer hall with wooden tables, lederhosen and dirndl clothing elements, and Bavarian architecture in the background, all rendered in the same DreamWorks 3D style. Use the characteristic DreamWorks 3D rendering with smooth surfaces, realistic lighting, subtle subsurface scattering, and the signature "DreamWorks glow" effect. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a DreamWorks animated movie celebrating German Oktoberfest culture with authentic German elements rendered in distinctive DreamWorks 3D animation style.`
      : `Transform person(s) into DreamWorks-style 3D character(s) in Oktoberfest scene with German flag, beer steins, pretzels, bratwurst`,
    
    'dreamworks-france': highQuality
      ? `Transform the person(s) into charming DreamWorks-style 3D animated character(s) and place them in a delightful French-themed environment. Create stylized, realistic 3D character(s) with the distinctive DreamWorks animation features - detailed facial expressions, realistic proportions with slight cartoonish exaggeration, and warm personality. The character(s) should be positioned in a French celebration scene featuring the iconic French flag (blue, white, red vertical stripes), traditional French elements like croissants, baguettes, French wine, cheese platter, the Eiffel Tower, French café with outdoor seating, and Parisian architecture in the background, all rendered in the same DreamWorks 3D style. Use the characteristic DreamWorks 3D rendering with smooth surfaces, realistic lighting, subtle subsurface scattering, and the signature "DreamWorks glow" effect. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a DreamWorks animated movie celebrating French culture with authentic French elements rendered in distinctive DreamWorks 3D animation style.`
      : `Transform person(s) into DreamWorks-style 3D character(s) in French scene with French flag, croissants, wine, Eiffel Tower`,
    
    'dreamworks-conflans': highQuality
      ? `Transform the person(s) into charming DreamWorks-style 3D animated character(s) and place them in a delightful Conflans Sainte Honorine-themed environment. Create stylized, realistic 3D character(s) with the distinctive DreamWorks animation features - detailed facial expressions, realistic proportions with slight cartoonish exaggeration, and warm personality. The character(s) should be positioned in a Conflans celebration scene featuring the iconic French flag (blue, white, red vertical stripes), traditional French elements like the historic church of Saint Honorine, the Seine river with boats, French pastries, local specialties, charming riverside houses, and the peaceful atmosphere of this historic French town in the background, all rendered in the same DreamWorks 3D style. Use the characteristic DreamWorks 3D rendering with smooth surfaces, realistic lighting, subtle subsurface scattering, and the signature "DreamWorks glow" effect. If multiple people are present, position them naturally together showing their interactions and relationships. The entire scene should look like it could be from a DreamWorks animated movie celebrating Conflans Sainte Honorine culture with authentic local elements rendered in distinctive DreamWorks 3D animation style.`
      : `Transform person(s) into DreamWorks-style 3D character(s) in Conflans scene with French flag, church, Seine river, local specialties`,

    'pop-art-warhol-original': highQuality
      ? `Transform the person(s) into Pop Art style inspired by Andy Warhol's iconic screen prints. Create a bold, graphic representation with high contrast colors - use vibrant, saturated colors like bright pink, electric blue, vivid yellow, and bold red. Apply the characteristic Warhol technique with flat color blocks, strong outlines, and the signature screen-printing effect with visible halftone dots or grain texture. Simplify facial features into bold shapes with high contrast between light and shadow areas. Use the classic Warhol color palette with unexpected color combinations - maybe pink skin tones, blue shadows, yellow highlights. Add that authentic silk-screen printing texture with slight imperfections and color registration shifts. The person(s) should look like they stepped out of a Warhol Campbell's Soup or Marilyn Monroe print - bold, iconic, and unmistakably Pop Art. Keep the original background exactly as it appears in the photo - do not modify or transform the background environment. If multiple people are present, position them naturally together showing their interactions and relationships. The result should look like a genuine Warhol-style portrait that could hang in a modern art gallery.`
      : `Transform person(s) into Pop Art Warhol style with bold colors and screen print effect, keep original background`,

    'pop-art-warhol-transformed': highQuality
      ? `Transform EVERYTHING into a Pop Art Warhol-style artwork. Convert the person(s) into bold, graphic Pop Art portraits with high contrast colors - use vibrant, saturated colors like bright pink, electric blue, vivid yellow, and bold red. Apply the characteristic Warhol screen-printing technique with flat color blocks, strong outlines, and visible halftone dots or grain texture. Simplify facial features into bold shapes with high contrast between light and shadow areas. Transform the ENTIRE background into Pop Art style - convert all walls, furniture, objects, and details into flat color blocks with bold outlines and the signature screen-printing effect. Make the background look like it's part of a Warhol artwork with repetitive patterns, bold geometric shapes, and vibrant complementary colors. Use the classic Pop Art color palette - electric colors, high saturation, strong contrasts. Add that authentic silk-screen printing texture throughout the entire image with slight imperfections, color registration shifts, and halftone dot patterns. Everything must be in Pop Art Warhol style - both characters AND background. The entire scene should look like it could be displayed in Andy Warhol's Factory or MoMA - bold, iconic, and unmistakably Pop Art. If multiple people are present, position them naturally together showing their interactions and relationships.`
      : `Transform EVERYTHING into Pop Art Warhol style - characters AND background with bold colors and screen print effect`,

    'superhero-original': highQuality
      ? `Transform the person(s) into heroic superhero character(s) with dynamic superhero costume and cape. Create a powerful, heroic appearance with a colorful superhero suit - use bold primary colors like red, blue, gold, or silver with cape flowing behind them. Add a heroic mask or domino mask across the eyes, muscular heroic physique, and confident heroic pose. Style them like original superhero characters with bold colors, dramatic lighting, and comic book appeal - NOT based on existing copyrighted characters. Keep their facial features, hair color, and personal characteristics recognizable while adding the superhero transformation. Use dramatic hero lighting with strong highlights and bold shadows. Keep the original background exactly as it appears in the photo - do not modify or transform the background environment. If multiple people are present, position them naturally together showing their interactions and relationships as a superhero team. Make it look like original superhero character(s) ready to save the day.`
      : `Transform person(s) into original superhero character(s) with costume and cape, keep original background`,

    'superhero-transformed': highQuality
      ? `Transform EVERYTHING into a superhero comic book scene. Convert the person(s) into heroic superhero character(s) with dynamic superhero costumes and capes. Create powerful, heroic appearances with colorful superhero suits - use bold primary colors like red, blue, gold, or silver with capes flowing behind them. Add heroic masks across the eyes, muscular heroic physiques, and confident heroic poses. Transform the ENTIRE background into a dramatic superhero scene - convert all walls, furniture, objects into a heroic cityscape with tall buildings, dramatic sky, comic book style with bold outlines and vibrant colors. Add comic book elements like action lines, dramatic lighting effects, and heroic atmosphere. Use dynamic comic book rendering with bold colors, strong contrasts, and Ben-Day dots texture. Everything must be in superhero comic book style - both characters AND background. The entire scene should look like it came from an original superhero comic book. If multiple people are present, position them naturally together showing their interactions and relationships as a superhero team.`
      : `Transform EVERYTHING into superhero comic book scene - characters AND background`,

    'film-noir-original': highQuality
      ? `Transform the person(s) into dramatic Film Noir black and white style. Create a classic 1940s-50s detective/noir character with high contrast black and white cinematography. Use dramatic noir lighting with strong shadows, venetian blind shadows, harsh key lighting from one side creating deep shadows on the other side. Style them like a noir detective or femme fatale - add period clothing like fedora hat, trench coat, elegant evening dress, or suit and tie from the 1940s-50s era. Create that characteristic Film Noir look with high contrast black and white, dramatic chiaroscuro lighting, cigarette smoke atmosphere, and moody expression. Keep their facial features and personal characteristics recognizable while adding the noir transformation. Convert the entire image to black and white with rich blacks, bright whites, and dramatic grey tones. Keep the original background exactly as it appears in the photo but convert it to dramatic black and white noir style with strong shadows. If multiple people are present, position them naturally together showing their interactions and relationships in classic noir style. Make it look like a genuine 1940s Film Noir movie still.`
      : `Transform person(s) into Film Noir black and white style, keep original background in noir B&W`,

    'film-noir-transformed': highQuality
      ? `Transform EVERYTHING into a classic Film Noir black and white movie scene. Convert the person(s) into dramatic noir characters with high contrast black and white cinematography. Use dramatic noir lighting with strong shadows, venetian blind patterns, harsh key lighting creating deep shadows. Style them like noir detectives or femmes fatales - add period clothing like fedora hats, trench coats, elegant evening dresses, or suits from the 1940s-50s era. Transform the ENTIRE background into a Film Noir cityscape - convert all walls, furniture, objects into dramatic noir scenes with rain-slicked streets, neon signs in black and white, venetian blind shadows, cigarette smoke, and moody noir atmosphere. Use high contrast black and white with rich blacks, bright whites, and dramatic grey tones throughout the entire image. Add classic Film Noir elements like dramatic shadows, fog, rain effects, and mysterious lighting. Everything must be in Film Noir style - both characters AND background. The entire scene should look like it came from a classic 1940s-50s noir detective movie. If multiple people are present, position them naturally together showing their interactions and relationships in noir style.`
      : `Transform EVERYTHING into Film Noir black and white movie scene - characters AND background`,

    'vaporwave-original': highQuality
      ? `Transform the person(s) into Vaporwave aesthetic style. Create a retro 1980s-90s aesthetic with pastel colors - pink, purple, turquoise, and mint green. Add Vaporwave styling elements like retro sunglasses, 80s fashion, windbreaker jackets, or athletic wear in pastel colors. Use the characteristic Vaporwave color grading with soft pastels, pink and purple hues, and dreamy atmosphere. Add subtle digital glitch effects, scan lines, or VHS artifacts around the person(s). Style them with that nostalgic 80s-90s aesthetic - soft focus, pastel color grading, and dreamy retro vibe. Keep their facial features and personal characteristics recognizable while adding the Vaporwave transformation. Keep the original background exactly as it appears in the photo but apply Vaporwave color grading with pastel tones. If multiple people are present, position them naturally together showing their interactions and relationships in Vaporwave aesthetic style. Make it look like a nostalgic 80s-90s aesthetic photo with modern Vaporwave styling.`
      : `Transform person(s) into Vaporwave aesthetic with pastel colors and retro 80s-90s style, keep original background`,

    'vaporwave-transformed': highQuality
      ? `Transform EVERYTHING into a Vaporwave aesthetic scene. Convert the person(s) into Vaporwave aesthetic style with retro 1980s-90s styling - pastel colors, retro sunglasses, 80s fashion. Transform the ENTIRE background into a classic Vaporwave scene - add neon grid floors, geometric shapes, retro computer graphics, palm trees silhouettes, sunset gradients with pink and purple hues, classical Greek statues, retro computers, and VHS aesthetic elements. Use the characteristic Vaporwave color palette - pastel pink, purple, turquoise, mint green with sunset gradients. Add digital effects like scan lines, VHS artifacts, glitch effects, and retro computer graphics throughout the entire image. Create that nostalgic 80s-90s internet aesthetic with geometric grids, neon glows, and dreamy atmosphere. Everything must be in Vaporwave aesthetic style - both characters AND background. The entire scene should look like it came from a 1980s-90s retro computer simulation with modern Vaporwave aesthetic. If multiple people are present, position them naturally together showing their interactions and relationships in Vaporwave style.`
      : `Transform EVERYTHING into Vaporwave aesthetic scene - characters AND background with retro 80s-90s style`,

    'cyberpunk-original': highQuality
      ? `Transform the person(s) into Cyberpunk futuristic style. Create a high-tech dystopian character with futuristic cyberpunk fashion - neon-accented clothing, tech wear, cybernetic accessories, LED lights integrated into clothing, holographic elements, and futuristic goggles or visors. Use the characteristic Cyberpunk color palette with neon colors - electric blue, hot pink, neon green, and purple neon lights against dark backgrounds. Add subtle cybernetic enhancements like glowing circuits, LED accents, or tech implants. Style them like a cyberpunk street samurai or netrunner with high-tech fashion and neon lighting. Keep their facial features and personal characteristics recognizable while adding the cyberpunk transformation. Add dramatic neon rim lighting - blue and pink neon glows around the person(s). Keep the original background exactly as it appears in the photo but enhance it with neon lighting effects and cyberpunk atmosphere. If multiple people are present, position them naturally together showing their interactions and relationships in cyberpunk style. Make it look like a character from a futuristic cyberpunk city.`
      : `Transform person(s) into Cyberpunk futuristic style with neon lights and tech wear, keep original background`,

    'cyberpunk-transformed': highQuality
      ? `Transform EVERYTHING into a Cyberpunk dystopian city scene. Convert the person(s) into cyberpunk characters with high-tech fashion - neon-accented clothing, tech wear, cybernetic accessories, LED lights, holographic elements. Transform the ENTIRE background into a futuristic cyberpunk cityscape - convert all walls, furniture, objects into neon-lit streets, holographic advertisements, rain-slicked pavement reflecting neon lights, towering skyscrapers with digital billboards, flying vehicles, and dense urban atmosphere. Use the characteristic Cyberpunk aesthetic with neon colors - electric blue, hot pink, neon green, purple, and orange neon lights against dark rainy backgrounds. Add cyberpunk elements like holographic interfaces, digital rain effects, neon signs in Asian characters, steam vents, and futuristic technology everywhere. Create that blade runner/cyberpunk atmosphere with rain, neon reflections, and high-tech low-life aesthetic. Everything must be in Cyberpunk style - both characters AND background. The entire scene should look like it came from a futuristic dystopian cyberpunk city at night. If multiple people are present, position them naturally together showing their interactions and relationships in cyberpunk style.`
      : `Transform EVERYTHING into Cyberpunk dystopian city - characters AND background with neon lights`,

    'retro-80s-original': highQuality
      ? `Transform the person(s) into vintage 1980s style. Create an authentic 80s look with period-accurate fashion - bold geometric patterns, neon colors, oversized blazers with shoulder pads, high-waisted jeans, windbreakers, aviator sunglasses, or aerobics wear. Use the characteristic 1980s color palette - bright neon colors, hot pink, electric blue, neon yellow, and purple. Add 80s styling elements like big hair, mullets, perms, or crimped hair. Style them like they stepped out of a 1980s photo with soft focus, warm color grading, and that distinctive 80s photographic quality. Add subtle film grain and warm analog photo look. Keep their facial features and personal characteristics recognizable while adding the 80s transformation. Keep the original background exactly as it appears in the photo but apply 80s color grading with warm tones and soft focus. If multiple people are present, position them naturally together showing their interactions and relationships in 80s style. Make it look like an authentic 1980s photograph with period fashion and styling.`
      : `Transform person(s) into vintage 1980s style with neon colors and 80s fashion, keep original background`,

    'retro-80s-transformed': highQuality
      ? `Transform EVERYTHING into a vintage 1980s scene. Convert the person(s) into 80s characters with period fashion - geometric patterns, neon colors, oversized blazers, windbreakers, aviator sunglasses. Transform the ENTIRE background into an authentic 1980s environment - convert all walls, furniture, objects into 80s interior design with geometric patterns, Memphis design style, neon accents, wood paneling, arcade machines, boom boxes, cassette tapes, VHS players, and retro technology. Use the characteristic 1980s aesthetic - bright neon colors, geometric shapes, bold patterns, and vibrant gradients. Add 80s elements like neon strip lighting, geometric wall art, retro furniture, old computers, and vintage electronics. Create that authentic 80s atmosphere with warm analog film look, soft focus, and film grain. Everything must be in 1980s vintage style - both characters AND background. The entire scene should look like it came from an authentic 1980s photograph with period design and technology. If multiple people are present, position them naturally together showing their interactions and relationships in 80s style.`
      : `Transform EVERYTHING into vintage 1980s scene - characters AND background with neon colors and 80s design`,

    'disco-original': highQuality
      ? `Transform the person(s) into 1970s Disco style. Create an authentic disco look with period fashion - shiny disco outfits, bell-bottom pants, platform shoes, sequined shirts, afro hairstyles, or glamorous disco dresses with metallic fabrics. Use the characteristic Disco era color palette - gold, silver, metallic colors, hot pink, purple, and rainbow colors. Add disco styling elements like big afros, feathered hair, glitter makeup, large sunglasses, and disco ball sparkle effects. Style them like they're ready to dance at Studio 54 with glamorous disco fashion and confident poses. Add subtle sparkle and glitter effects around the person(s) with colorful disco lighting - rotating colored lights creating rainbow effects. Keep their facial features and personal characteristics recognizable while adding the disco transformation. Keep the original background exactly as it appears in the photo but enhance it with colorful disco lighting effects and sparkles. If multiple people are present, position them naturally together showing their interactions and relationships in disco style. Make it look like they're ready to hit the disco dance floor.`
      : `Transform person(s) into 1970s Disco style with sequins and platform shoes, keep original background`,

    'disco-transformed': highQuality
      ? `Transform EVERYTHING into a 1970s Disco dance floor scene. Convert the person(s) into disco dancers with glamorous disco fashion - shiny outfits, bell-bottoms, platform shoes, sequined shirts, metallic fabrics. Transform the ENTIRE background into an authentic disco club - convert all walls, furniture, objects into a disco dance floor with illuminated dance floor panels in rainbow colors, mirror disco balls hanging from the ceiling creating sparkle effects everywhere, colorful rotating lights, neon signs, velvet ropes, and retro sound equipment. Use the characteristic Disco aesthetic - metallic gold and silver, rainbow colors, sparkles, glitter, and dramatic colored lighting. Add disco elements like mirror ball reflections creating thousands of light spots, illuminated dance floor squares, retro speakers, vinyl records, and glamorous disco atmosphere. Create that authentic Studio 54 disco club vibe with colored spotlights, smoke effects, sparkles, and party energy. Everything must be in 1970s Disco style - both characters AND background. The entire scene should look like it came from the golden age of disco with authentic period design. If multiple people are present, position them naturally together showing their interactions and relationships dancing in disco style.`
      : `Transform EVERYTHING into 1970s Disco dance floor - characters AND background with mirror balls and lights`,

  }
  
  const prompt = prompts[backgroundId] || 'Replace the green screen background with a beautiful natural landscape'
  
  try {
    const genAI = new GoogleGenerativeAI(config.geminiApiKey)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image-preview" 
    })

    const parts = [
      { text: prompt },
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageFile.type || 'image/jpeg'
        }
      }
    ]

    const result = await model.generateContent(parts)
    
    // Extraire l'image générée
    const candidates = result.response.candidates
    if (!candidates || !candidates[0]?.content?.parts) {
      throw new Error('Aucun résultat généré par Nano Banana')
    }

    const imagePart = candidates[0].content.parts.find(part => part.inlineData)
    
    if (imagePart && imagePart.inlineData) {
      const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64')
      
      // Si c'est un changement de fond (JSON), sauvegarder en base et retourner l'URL
      const contentType = getHeader(event, 'content-type') || ''
      if (!contentType.includes('multipart/form-data')) {
        const body = await readBody(event)
        const { guestEmail, guestSessionId } = body
        return await saveGeneratedImageToDatabase(imageBuffer, backgroundId, highQuality, guestEmail, guestSessionId)
      }
      
      // Sinon, retourner l'image directement (comportement original)
      setHeader(event, 'Content-Type', 'image/png')
      setHeader(event, 'Cache-Control', 'public, max-age=3600') // Cache 1h
      
      return imageBuffer
    }
    
    throw new Error('Aucune image générée dans la réponse')
  } catch (error) {
    console.error('Erreur Nano Banana:', error)
    throw createError({ 
      statusCode: 500, 
      statusMessage: `Erreur de traitement: ${error.message}` 
    })
  }
})

// Fonction pour sauvegarder l'image générée en base de données
async function saveGeneratedImageToDatabase(imageBuffer: Buffer, backgroundId: string, highQuality: boolean, guestEmail?: string, guestSessionId?: string) {
  try {
    console.log('💾 Sauvegarde de l\'image générée en base de données...')
    
    const config = useRuntimeConfig()
    const supabaseUrl = config.supabaseUrl
    const supabaseServiceKey = config.supabaseServiceKey
    
    if (!supabaseServiceKey) {
      throw new Error('Clé de service Supabase manquante')
    }
    
    // Créer un client Supabase avec la clé de service
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 1. Upload de l'image vers Supabase Storage
    const fileName = `generated/${Date.now()}_${backgroundId}.png`
    console.log('📁 Upload vers Storage:', fileName)
    
    await $fetch(`${supabaseUrl}/storage/v1/object/photobooth/${fileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'image/png',
        'x-upsert': 'true'
      },
      body: imageBuffer
    })
    
    console.log('✅ Image uploadée vers Storage')
    
    // 2. Mettre à jour le record photo existant avec la nouvelle image
    const photoUrl = `${supabaseUrl}/storage/v1/object/public/photobooth/${fileName}`
    console.log('🔗 Nouvelle URL photo:', photoUrl)
    
    // Chercher la photo existante pour l'utilisateur invité
    if (guestEmail) {
      const { data: existingPhoto, error: searchError } = await supabase
        .from('photos')
        .select('*')
        .eq('guest_email', guestEmail)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (searchError) {
        console.error('❌ Erreur recherche photo existante:', searchError)
      } else if (existingPhoto && existingPhoto.length > 0) {
        const photoData = existingPhoto[0]
        console.log('📸 Photo existante trouvée:', photoData.id)
        
        // Créer une miniature de l'image générée
        const thumbnailUrl = await createThumbnail(imageBuffer, supabaseUrl, supabaseServiceKey)
        
        // Vérifier la limite de changements de fond (5 maximum)
        const currentCount = photoData.count || 0
        if (currentCount >= 5) {
          console.log('🚫 Limite de 5 changements de fond atteinte pour l\'utilisateur invité:', guestEmail)
          throw createError({
            statusCode: 403,
            statusMessage: 'Vous avez atteint la limite de 5 changements de fond. Les utilisateurs invités sont limités à 5 fonds différents.'
          })
        }

        // Données à mettre à jour - incrémenter le count
        const updateData = {
          photo_url: photoUrl,
          photo_thumbnail: thumbnailUrl,
          background_id: backgroundId,
          background_name: backgroundId.replace(/-/g, ' '),
          count: currentCount + 1 // Incrémenter le compteur
        }
        
        console.log('📊 Données de mise à jour photo:', {
          photo_id: photoData.id,
          guest_email: photoData.guest_email,
          updateData: updateData
        })
        
        // Mettre à jour photo_url, photo_thumbnail et les infos du background
        const { data: updatedPhoto, error: updateError } = await supabase
          .from('photos')
          .update(updateData)
          .eq('id', photoData.id)
          .select()
        
        if (updateError) {
          console.error('❌ Erreur mise à jour photo:', {
            photo_id: photoData.id,
            error: updateError,
            updateData: updateData
          })
          throw updateError
        }
        
        console.log('✅ Photo mise à jour avec succès:', {
          photo_id: updatedPhoto[0].id,
          new_photo_url: updatedPhoto[0].photo_url,
          new_thumbnail_url: updatedPhoto[0].photo_thumbnail,
          new_background_id: updatedPhoto[0].background_id,
          new_background_name: updatedPhoto[0].background_name
        })
      } else {
        console.log('⚠️ Aucune photo existante trouvée pour:', guestEmail)
      }
    }
    
    console.log('🎉 Image générée et sauvegardée avec succès!')
    
    return {
      success: true,
      url: photoUrl,
      backgroundId: backgroundId,
      backgroundName: backgroundId.replace(/-/g, ' ')
    }
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde base de données:', error)
    throw error
  }
}

// Fonction pour créer une miniature
async function createThumbnail(imageBuffer: Buffer, supabaseUrl: string, supabaseServiceKey: string): Promise<string> {
  try {
    console.log('🖼️ Création miniature...')
    
    // Redimensionner l'image à 300x300
    const sharp = await import('sharp')
    const thumbnailBuffer = await sharp.default(imageBuffer)
      .resize(300, 300, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer()
    
    console.log('✅ Miniature créée:', thumbnailBuffer.length, 'bytes')
    
    // Upload de la miniature
    const thumbnailFileName = `thumbnails/${Date.now()}_thumb.png`
    console.log('📁 Upload miniature vers Storage:', thumbnailFileName)
    
    await $fetch(`${supabaseUrl}/storage/v1/object/photobooth/${thumbnailFileName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'image/jpeg',
        'x-upsert': 'true'
      },
      body: thumbnailBuffer
    })
    
    const thumbnailUrl = `${supabaseUrl}/storage/v1/object/public/photobooth/${thumbnailFileName}`
    console.log('✅ Miniature uploadée:', thumbnailUrl)
    
    return thumbnailUrl
    
  } catch (error) {
    console.error('❌ Erreur création miniature:', error)
    throw error
  }
}