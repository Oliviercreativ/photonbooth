// server/api/photo/watermark.post.ts
export default defineEventHandler(async (event) => {
  try {
    console.log('🖼️ Endpoint watermark appelé')
    
    const body = await readBody(event)
    const { imageUrl, watermarkText = 'Made in Conflans' } = body
    
    if (!imageUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'imageUrl requis'
      })
    }

    // Télécharger l'image depuis l'URL
    console.log('📥 Téléchargement image pour watermark:', imageUrl)
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Impossible de télécharger l\'image')
    }
    const imageBuffer = await imageResponse.arrayBuffer()

    // Créer le watermark avec Sharp
    console.log('🎨 Ajout du watermark avec logo...')
    const sharp = await import('sharp')
    
    // Obtenir les dimensions de l'image
    const image = sharp.default(imageBuffer)
    const { width, height } = await image.metadata()
    console.log('📏 Dimensions image:', { width, height })
    
    // Calculer les tailles en fonction de l'image
    const logoSize = Math.max(40, Math.min(width || 800, height || 600) / 20)
    const fontSize = Math.max(20, Math.min(width || 800, height || 600) / 30)
    const padding = Math.max(15, Math.min(width || 800, height || 600) / 40)
    
    // Lire le logo depuis le dossier public
    const logoPath = './public/icon.png'
    console.log('🖼️ Chargement du logo:', logoPath)
    
    let logoBuffer
    try {
      const fs = await import('fs')
      logoBuffer = fs.readFileSync(logoPath)
      console.log('✅ Logo chargé:', logoBuffer.length, 'bytes')
    } catch (error) {
      console.error('❌ Erreur chargement logo:', error)
      throw new Error('Impossible de charger le logo')
    }
    
    // Redimensionner le logo
    const resizedLogo = await sharp.default(logoBuffer)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
    
    // Créer un SVG avec le logo et le texte
    const svgWatermark = `
      <svg width="${width}" height="${height}">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.7"/>
          </filter>
        </defs>
        
        <!-- Logo -->
        <image x="${padding}" y="${height - padding - logoSize}" 
               width="${logoSize}" height="${logoSize}"
               href="data:image/png;base64,${resizedLogo.toString('base64')}"
               filter="url(#shadow)"/>
        
        <!-- Texte -->
        <text x="${padding + logoSize + 10}" y="${height - padding - logoSize/2 + fontSize/3}" 
              font-family="Arial, sans-serif" 
              font-size="${fontSize}" 
              font-weight="bold" 
              fill="white" 
              stroke="black" 
              stroke-width="2"
              filter="url(#shadow)">
          ${watermarkText}
        </text>
      </svg>
    `
    
    const watermarkedBuffer = await sharp.default(imageBuffer)
      .composite([
        {
          input: Buffer.from(svgWatermark),
          gravity: 'southwest'
        }
      ])
      .png()
      .toBuffer()

    console.log('✅ Watermark ajouté avec succès')

    // Retourner l'image avec watermark
    setHeader(event, 'Content-Type', 'image/png')
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    
    return watermarkedBuffer

  } catch (error) {
    console.error('❌ Erreur watermark:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Erreur watermark: ${error.message}`
    })
  }
})
