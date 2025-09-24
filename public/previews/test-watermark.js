// Test du watermark Grinch
console.log('🎭 Test du watermark Grinch...\n')

// Test 1: Vérifier que l'image est accessible
async function testWatermarkImage() {
  try {
    const response = await fetch('http://localhost:3001/watermark-logo.png')
    
    if (response.ok) {
      console.log('✅ Logo watermark accessible')
      console.log(`   - Taille: ${response.headers.get('content-length')} bytes`)
      console.log(`   - Type: ${response.headers.get('content-type')}`)
    } else {
      console.log('❌ Logo watermark non accessible')
    }
  } catch (error) {
    console.log('❌ Erreur image:', error.message)
  }
}

// Test 2: Vérifier les pages principales
async function testPages() {
  const pages = [
    { name: 'Accueil', url: 'http://localhost:3001/' },
    { name: 'Session', url: 'http://localhost:3001/session' }
  ]
  
  for (const page of pages) {
    try {
      const response = await fetch(page.url)
      if (response.ok) {
        console.log(`✅ Page ${page.name} accessible`)
      } else {
        console.log(`❌ Page ${page.name} non accessible`)
      }
    } catch (error) {
      console.log(`❌ Erreur page ${page.name}:`, error.message)
    }
  }
}

// Exécuter les tests
async function runTests() {
  await testWatermarkImage()
  console.log('\n' + '='.repeat(50) + '\n')
  await testPages()
  
  console.log('\n🎉 Tests terminés !')
  console.log('\n📱 Pour voir le watermark:')
  console.log('   1. Ouvrir http://localhost:3001/')
  console.log('   2. Regarder en bas à droite')
  console.log('   3. Le logo Grinch devrait être visible')
  console.log('   4. Cliquer dessus pour aller sur grinch.fr')
}

runTests()
