// utils/imageUtils.ts

/**
 * Crée une miniature à partir d'une image base64
 * @param base64Image - Image en base64
 * @param maxWidth - Largeur maximale (défaut: 200px)
 * @param maxHeight - Hauteur maximale (défaut: 200px)
 * @param quality - Qualité JPEG (défaut: 0.7)
 * @returns Promise<string> - Miniature en base64
 */
export async function createThumbnail(
  base64Image: string,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Impossible de créer le contexte canvas'))
        return
      }
      
      // Calculer les nouvelles dimensions en gardant le ratio
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
      const newWidth = img.width * ratio
      const newHeight = img.height * ratio
      
      canvas.width = newWidth
      canvas.height = newHeight
      
      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, newWidth, newHeight)
      
      // Convertir en base64 avec compression
      const thumbnail = canvas.toDataURL('image/jpeg', quality)
      resolve(thumbnail)
    }
    
    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'))
    }
    
    img.src = base64Image
  })
}

/**
 * Convertit un Blob en base64
 * @param blob - Le blob à convertir
 * @returns Promise<string> - Données en base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Redimensionne une image côté serveur (Node.js uniquement)
 * Utilise Sharp si disponible
 */
export async function createThumbnailServer(
  imageBuffer: Buffer,
  maxWidth: number = 200,
  maxHeight: number = 200,
  quality: number = 70
): Promise<Buffer> {
  try {
    // Essayer d'utiliser Sharp si disponible
    const sharp = await import('sharp').catch(() => null)
    
    if (sharp) {
      return await sharp.default(imageBuffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toBuffer()
    } else {
      // Fallback: retourner l'image originale (sera redimensionnée côté client)
      return imageBuffer
    }
  } catch (error) {
    console.error('Erreur création miniature serveur:', error)
    return imageBuffer
  }
}