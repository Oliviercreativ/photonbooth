// Fonction utilitaire pour générer un UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const usePhotoboothSession = () => {
  const getSession = () => {
    if (!process.client) return null
    
    try {
      const sessionData = localStorage.getItem('photobooth_session')
      if (!sessionData) return null
      
      return JSON.parse(sessionData)
    } catch (error) {
      console.error('❌ Erreur parsing localStorage photobooth:', error)
      // Supprimer le localStorage corrompu
      localStorage.removeItem('photobooth_session')
      return null
    }
  }

  const createSession = (email: string, fullName?: string) => {
    const sessionId = generateUUID()
    const sessionData = {
      email,
      fullName: fullName || null,
      sessionId,
      timestamp: Date.now()
    }
    
    if (process.client) {
      localStorage.setItem('photobooth_session', JSON.stringify(sessionData))
    }
    console.log('💾 Session photobooth créée:', sessionData)
    return sessionData
  }

  const clearSession = () => {
    if (process.client) {
      localStorage.removeItem('photobooth_session')
    }
    console.log('🗑️ Session photobooth supprimée')
  }

  const forceCleanSession = () => {
    // Forcer la suppression du localStorage
    try {
      if (process.client) {
        localStorage.removeItem('photobooth_session')
      }
      console.log('🧹 Session photobooth forcément nettoyée')
    } catch (error) {
      console.error('❌ Erreur nettoyage forcé:', error)
    }
  }

  const hasSession = () => {
    return !!getSession()
  }

  const getEmail = () => {
    const session = getSession()
    return session?.email || null
  }

  const getSessionId = () => {
    const session = getSession()
    return session?.sessionId || null
  }

  const getFullName = () => {
    const session = getSession()
    return session?.fullName || null
  }

  return {
    getSession,
    createSession,
    clearSession,
    forceCleanSession,
    hasSession,
    getEmail,
    getSessionId,
    getFullName
  }
}
