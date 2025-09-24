// Test du nouveau prompt Pixar
console.log('🎭 Test du prompt Pixar 3D...\n')

// Test 1: Vérifier l'API des fonds
async function testBackgroundsAPI() {
  try {
    const response = await fetch('http://localhost:3001/api/backgrounds')
    const data = await response.json()
    
    const pixarBackground = data.backgrounds.find(bg => bg.id === 'pixar-caricature')
    
    if (pixarBackground) {
      console.log('✅ Fond Pixar trouvé dans l\'API:')
      console.log(`   - Nom: ${pixarBackground.name}`)
      console.log(`   - Emoji: ${pixarBackground.emoji}`)
      console.log(`   - Catégorie: ${pixarBackground.category}`)
      console.log(`   - Featured: ${pixarBackground.featured}`)
      console.log(`   - Preview: ${pixarBackground.preview}`)
    } else {
      console.log('❌ Fond Pixar non trouvé dans l\'API')
    }
    
    console.log(`\n📊 Total des fonds disponibles: ${data.backgrounds.length}`)
    console.log(`📂 Catégories: ${data.categories.join(', ')}`)
    
  } catch (error) {
    console.log('❌ Erreur API fonds:', error.message)
  }
}

// Test 2: Vérifier l'image de prévisualisation
async function testPreviewImage() {
  try {
    const response = await fetch('http://localhost:3001/previews/pixar.jpg')
    
    if (response.ok) {
      console.log('✅ Image de prévisualisation Pixar accessible')
      console.log(`   - Taille: ${response.headers.get('content-length')} bytes`)
      console.log(`   - Type: ${response.headers.get('content-type')}`)
    } else {
      console.log('❌ Image de prévisualisation non accessible')
    }
  } catch (error) {
    console.log('❌ Erreur image:', error.message)
  }
}

// Exécuter les tests
async function runTests() {
  await testBackgroundsAPI()
  console.log('\n' + '='.repeat(50) + '\n')
  await testPreviewImage()
  
  console.log('\n🎉 Tests terminés !')
  console.log('\n📱 Pour tester dans l\'interface:')
  console.log('   1. Ouvrir http://localhost:3001/session')
  console.log('   2. Cliquer sur "🌍 Choisir fond"')
  console.log('   3. Chercher "🎭 Caricature Pixar 3D"')
  console.log('   4. Sélectionner et capturer une photo !')
}

runTests()
