// scripts/test-gemini.js
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const TEST_IMAGE_PATH = './test_debug.jpg' // Image de test dans le dossier racine

if (!GEMINI_API_KEY) {
  console.error('❌ ERREUR: Variable GEMINI_API_KEY manquante')
  console.log('💡 Ajoutez votre clé API Gemini dans le fichier .env:')
  console.log('   GEMINI_API_KEY=your_api_key_here')
  process.exit(1)
}

async function testGemini25FlashPreview() {
  console.log('🧪 Test de Gemini 2.5 Flash Image Preview')
  console.log('=' .repeat(50))

  try {
    // Vérifier que l'image de test existe
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      console.error(`❌ Image de test introuvable: ${TEST_IMAGE_PATH}`)
      console.log('💡 Placez une image de test nommée "test_debug.jpg" dans le dossier racine')
      process.exit(1)
    }

    // Lire l'image de test
    console.log(`📸 Lecture de l'image de test: ${TEST_IMAGE_PATH}`)
    const imageBuffer = fs.readFileSync(TEST_IMAGE_PATH)
    const imageBase64 = imageBuffer.toString('base64')

    console.log(`✅ Image chargée: ${imageBuffer.length} bytes`)

    // Initialiser Gemini
    console.log('🤖 Initialisation de Gemini 2.5 Flash Preview...')
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-image-preview'
    })

    // Prompt de test pour la cathédrale de Chimay
    const prompt = `Replace the green screen background with the beautiful Gothic Cathedral of Chimay in Belgium with natural afternoon lighting. Show the detailed stone architecture and spires with warm, realistic lighting that naturally illuminates both the person and the cathedral. Ensure the person appears to be genuinely visiting this historic Belgian landmark.`

    console.log('📝 Prompt utilisé:')
    console.log(`   ${prompt.substring(0, 100)}...`)

    // Préparer les données
    const parts = [
      { text: prompt },
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      }
    ]

    console.log('⏳ Envoi de la requête à Gemini...')
    const startTime = Date.now()

    // Générer le contenu
    const result = await model.generateContent(parts)
    const response = await result.response

    const endTime = Date.now()
    const duration = endTime - startTime

    console.log(`✅ Réponse reçue en ${duration}ms`)
    console.log('📊 Métadonnées d\'usage:')

    if (response.usageMetadata) {
      console.log(`   - Tokens prompt: ${response.usageMetadata.promptTokenCount}`)
      console.log(`   - Tokens total: ${response.usageMetadata.totalTokenCount}`)

      if (response.usageMetadata.promptTokensDetails) {
        const details = response.usageMetadata.promptTokensDetails
        details.forEach(detail => {
          console.log(`   - ${detail.modality}: ${detail.tokenCount} tokens`)
        })
      }
    }

    // Vérifier la réponse
    console.log('🔍 Analyse de la réponse...')

    if (!response.candidates || response.candidates.length === 0) {
      console.error('❌ Aucun candidat dans la réponse')
      return false
    }

    const candidate = response.candidates[0]
    console.log(`📋 Statut: ${candidate.finishReason}`)

    if (!candidate.content || !candidate.content.parts) {
      console.error('❌ Aucune partie de contenu dans la réponse')
      return false
    }

    // Chercher l'image générée
    const imagePart = candidate.content.parts.find(part => part.inlineData)

    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
      const generatedImageData = imagePart.inlineData.data
      console.log(`✅ Image générée trouvée: ${generatedImageData.length} caractères base64`)

      // Sauvegarder l'image de test
      const outputPath = './test_gemini_chimay_output.jpg'
      const outputBuffer = Buffer.from(generatedImageData, 'base64')
      fs.writeFileSync(outputPath, outputBuffer)

      console.log(`💾 Image sauvegardée: ${outputPath} (${outputBuffer.length} bytes)`)
      console.log('🎉 TEST RÉUSSI ! Gemini 2.5 Flash Preview fonctionne correctement')

      return true
    } else {
      console.error('❌ Aucune image générée dans la réponse')
      console.log('📝 Structure de la réponse:')
      console.log(JSON.stringify(response, null, 2))

      return false
    }

  } catch (error) {
    console.error('❌ ERREUR lors du test:')
    console.error(`   Type: ${error.name}`)
    console.error(`   Message: ${error.message}`)

    if (error.stack) {
      console.error('📚 Stack trace:')
      console.error(error.stack)
    }

    return false
  }
}

async function testBackgroundPrompts() {
  console.log('\n🎨 Test des prompts d\'arrière-plans')
  console.log('=' .repeat(50))

  const backgrounds = {
    'brussels-grand-place': 'Replace the green screen background with the magnificent UNESCO World Heritage Grand-Place in Brussels, Belgium. Show the stunning ornate baroque and gothic guild houses with their detailed facades surrounding the historic cobblestone square. Use warm golden hour lighting.',
    'chimay-cathedral': 'Replace the green screen background with the beautiful Gothic Cathedral of Chimay in Belgium with natural afternoon lighting. Show the detailed stone architecture and spires.',
    'paris-eiffel': 'Replace the green background with an iconic Parisian scene featuring the Eiffel Tower. Position the person as if they\'re at Trocadéro Gardens with the Iron Lady majestically rising in the background.',
    'tropical-beach': 'Replace the green background with a stunning tropical paradise beach scene. Feature crystal clear turquoise water, pristine white sand, and swaying palm trees during golden hour.'
  }

  Object.entries(backgrounds).forEach(([id, prompt]) => {
    console.log(`\n🏷️  ${id}:`)
    console.log(`   ${prompt.substring(0, 120)}...`)
  })
}

async function main() {
  console.log('🚀 Démarrage des tests Gemini 2.5 Flash Preview')
  console.log('⏰ ' + new Date().toLocaleString())
  console.log()

  // Test des prompts
  await testBackgroundPrompts()

  console.log()

  // Test principal
  const success = await testGemini25FlashPreview()

  console.log('\n' + '=' .repeat(50))

  if (success) {
    console.log('✅ TOUS LES TESTS RÉUSSIS !')
    console.log('🎯 Votre application photobooth devrait fonctionner correctement')
    console.log('💡 Essayez maintenant avec: bun run dev')
  } else {
    console.log('❌ ÉCHEC DES TESTS')
    console.log('🔧 Vérifiez votre configuration et réessayez')
  }

  console.log('\n🏁 Fin des tests')
}

// Exécuter le script
main().catch(error => {
  console.error('💥 Erreur fatale:', error)
  process.exit(1)
})
