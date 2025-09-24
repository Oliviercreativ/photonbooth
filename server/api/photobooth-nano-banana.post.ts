// server/api/photobooth-nano-banana.post.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  const imageFile = formData?.find(field => field.name === 'image')
  const backgroundId = formData?.find(field => field.name === 'background')?.data.toString()
  const highQuality = formData?.find(field => field.name === 'high_quality')?.data.toString() === 'true'
  
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
      ? `Replace the green screen background with the magnificent UNESCO World Heritage Grand-Place in Brussels, Belgium. Show the stunning ornate baroque and gothic guild houses with their detailed facades surrounding the historic cobblestone square. Use warm golden hour lighting that naturally illuminates both the person and the architectural masterpieces. Ensure the person appears to be genuinely visiting this iconic Belgian landmark with proper perspective and realistic shadows.`
      : `Replace green screen with Brussels Grand-Place, ornate guild houses, golden lighting, realistic shadows`,
    
    'paris-eiffel': highQuality
      ? `Replace the green background with an iconic Parisian scene featuring the Eiffel Tower. Position the person as if they're at Trocadéro Gardens with the Iron Lady majestically rising in the background. Use romantic Parisian lighting - either golden sunset or charming evening illumination of the tower. Create natural depth and perspective so it looks like an authentic Paris vacation photo.`
      : `Replace green with Eiffel Tower Paris from Trocadéro, sunset lighting, authentic vacation feel`,
    
    'chimay-cathedral': highQuality
      ? `Replace the green screen with the magnificent Gothic Cathedral of Chimay in Belgium. Show the towering limestone spires and detailed Gothic architecture with natural European afternoon lighting casting soft shadows. The person should appear naturally positioned in front of this historic cathedral as if they're genuinely exploring this beautiful Belgian heritage site.`
      : `Replace green with Gothic Cathedral Chimay Belgium, limestone spires, afternoon lighting`,
    
    'tropical-beach': highQuality
      ? `Replace the green background with a stunning tropical paradise beach scene. Feature crystal clear turquoise water, pristine white sand, and swaying palm trees during golden hour. Create warm, natural sunset lighting with gentle shadows. The person should look like they're enjoying a perfect tropical vacation with the ocean breeze and paradise surroundings.`
      : `Replace green with tropical beach paradise, turquoise water, palm trees, golden hour`,
    
    'tokyo-street': highQuality
      ? `Replace the green screen with a vibrant modern Tokyo street scene. Show neon signs, modern architecture, and the bustling urban atmosphere of Shibuya or Harajuku. Use dynamic city lighting with colorful neon reflections. The person should appear as if they're experiencing the energy of modern Japan's capital city.`
      : `Replace green with Tokyo street, neon signs, modern city, dynamic lighting`,
    
    'mountain-alps': highQuality
      ? `Replace the green background with majestic Swiss Alps mountain scenery. Show snow-capped peaks, alpine meadows, and crystal clear mountain air. Use natural mountain lighting with crisp, clean shadows. The person should appear as if they're hiking or exploring these breathtaking Alpine landscapes with proper mountain perspective.`
      : `Replace green with Swiss Alps, snow peaks, alpine meadows, mountain lighting`,
    
    'pixar-caricature': highQuality
      ? `Transform the person into a charming Pixar-style 3D caricature character. Create a stylized, cartoon-like version with exaggerated features typical of Pixar animation - large expressive eyes, simplified facial features, and a warm, friendly appearance. Use vibrant Pixar-style colors with soft lighting and subtle subsurface scattering. The character should have that distinctive Pixar 3D rendering with smooth surfaces, gentle shadows, and the characteristic "plastic" material look. Make it look like a character that could appear in a Pixar movie with personality and charm.`
      : `Transform person into Pixar 3D caricature character, stylized cartoon features, vibrant colors, soft lighting`,
    
    'belgium-patriotic': highQuality
      ? `Replace the green screen background with a patriotic Belgian scene featuring the iconic Belgian flag (black, yellow, red vertical stripes) prominently displayed. Include classic Belgian culinary specialties like golden Belgian waffles with whipped cream and strawberries, a glass of Belgian beer with foam, Belgian chocolate truffles, and Belgian fries in a paper cone. Add Belgian landmarks like the Atomium structure or Brussels architecture in the background. Use warm, inviting lighting that celebrates Belgian culture and heritage. The person should appear naturally integrated into this Belgian celebration scene.`
      : `Replace green with Belgian flag, waffles, beer, chocolate, fries, Atomium, patriotic Belgian scene`,
    
    'pixar-belgium': highQuality
      ? `Transform the person into a charming Pixar-style 3D caricature character and place them in a delightful Belgian-themed environment. Create a stylized, cartoon-like version with exaggerated Pixar features - large expressive eyes, simplified facial features, and warm personality. The character should be positioned in a Belgian celebration scene featuring the iconic Belgian flag (black, yellow, red vertical stripes), golden Belgian waffles with whipped cream, Belgian beer with foam, Belgian chocolate truffles, Belgian fries, and the Atomium structure in the background. Use vibrant Pixar-style colors with soft lighting, subsurface scattering, and the characteristic "plastic" material look. The entire scene should look like it could be from a Pixar movie celebrating Belgian culture with authentic Belgian elements rendered in Pixar's signature 3D style.`
      : `Transform person into Pixar 3D character in Belgian scene with flag, waffles, beer, chocolate, Atomium`,
    
    'pixar-uk': highQuality
      ? `Transform the person into a charming Pixar-style 3D caricature character and place them in a delightful British-themed environment. Create a stylized, cartoon-like version with exaggerated Pixar features - large expressive eyes, simplified facial features, and warm personality. The character should be positioned in a British celebration scene featuring the iconic Union Jack flag (red, white, blue), traditional British elements like Big Ben clock tower, red double-decker bus, black taxi cab, British tea service with scones and jam, fish and chips, and London landmarks in the background. Use vibrant Pixar-style colors with soft lighting, subsurface scattering, and the characteristic "plastic" material look. The entire scene should look like it could be from a Pixar movie celebrating British culture with authentic British elements rendered in Pixar's signature 3D style.`
      : `Transform person into Pixar 3D character in British scene with Union Jack, Big Ben, tea, fish and chips`,
    
    'pixar-germany': highQuality
      ? `Transform the person into a charming Pixar-style 3D caricature character and place them in a delightful German Oktoberfest-themed environment. Create a stylized, cartoon-like version with exaggerated Pixar features - large expressive eyes, simplified facial features, and warm personality. The character should be positioned in a German Oktoberfest celebration scene featuring the iconic German flag (black, red, yellow horizontal stripes), traditional German elements like beer steins with foam, pretzels, bratwurst sausages, sauerkraut, German beer hall with wooden tables, lederhosen and dirndl clothing elements, and Bavarian architecture in the background. Use vibrant Pixar-style colors with soft lighting, subsurface scattering, and the characteristic "plastic" material look. The entire scene should look like it could be from a Pixar movie celebrating German Oktoberfest culture with authentic German elements rendered in Pixar's signature 3D style.`
      : `Transform person into Pixar 3D character in Oktoberfest scene with German flag, beer steins, pretzels, bratwurst`
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