// server/api/live-photobooth.post.ts
import {GoogleGenerativeAI} from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  const imageFile = formData?.find((field) => field.name === 'image')
  const backgroundId = formData
    ?.find((field) => field.name === 'background')
    ?.data.toString()

  if (!imageFile || !backgroundId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image et fond requis'
    })
  }

  const config = useRuntimeConfig()

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Clé API Gemini manquante'
    })
  }

  const imageBase64 = Buffer.from(imageFile.data).toString('base64')

  // Prompts optimisés pour traitement rapide (live preview)
  const quickPrompts = {
    'brussels-grand-place':
      'Replace green background with Brussels Grand-Place guild houses, warm golden lighting, realistic integration',
    'paris-eiffel':
      'Replace green background with Eiffel Tower Paris, romantic evening lighting, natural perspective',
    'chimay-cathedral':
      'Replace green background with Gothic Cathedral Chimay Belgium, natural afternoon lighting, authentic setting',
    'tropical-beach':
      'Replace green background with tropical beach paradise, golden hour lighting, vacation atmosphere',
    'tokyo-street':
      'Replace green background with Tokyo neon street, modern city lighting, urban energy',
    'mountain-alps':
      'Replace green background with Swiss Alps mountains, crisp mountain lighting, alpine scenery'
  }

  const prompt =
    quickPrompts[backgroundId] ||
    'Replace green screen background with beautiful landscape'

  try {
    console.log(
      'Traitement live avec Gemini 2.5 Flash Preview:',
      backgroundId,
      'taille:',
      imageFile.data.length
    )

    const genAI = new GoogleGenerativeAI(config.geminiApiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image-preview'
    })

    const parts = [
      {text: prompt},
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageFile.type || 'image/jpeg'
        }
      }
    ]

    const result = await model.generateContent(parts)
    const response = await result.response

    console.log('Réponse Gemini 2.5 Flash Preview reçue')

    // Extraire l'image générée
    const candidates = response.candidates
    if (!candidates || !candidates[0]?.content?.parts) {
      console.log('Pas de candidats dans la réponse')
      throw new Error('Aucun résultat généré par Gemini 2.5')
    }

    const imagePart = candidates[0].content.parts.find(
      (part) => part.inlineData
    )

    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
      const imageBuffer = Buffer.from(imagePart.inlineData.data, 'base64')

      console.log(
        'Image traitée avec succès par Gemini 2.5, taille:',
        imageBuffer.length
      )

      setHeader(event, 'Content-Type', 'image/jpeg')
      setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
      setHeader(event, 'Pragma', 'no-cache')
      setHeader(event, 'Expires', '0')

      return imageBuffer
    } else {
      console.log("Pas d'image dans les parties de la réponse")
      console.log('Structure de réponse:', JSON.stringify(response, null, 2))
      throw new Error('Aucune image générée dans la réponse')
    }
  } catch (error) {
    console.error('Erreur Gemini 2.5 Flash Preview:', error)

    // En cas d'erreur, retourner l'image originale avec un overlay d'erreur
    console.log("Fallback: retour de l'image originale")
    setHeader(event, 'Content-Type', 'image/jpeg')
    setHeader(event, 'Cache-Control', 'no-cache')

    return imageFile.data
  }
})
