-- =============================================
-- MIGRATION: Ajout colonne miniature
-- =============================================

-- Ajouter une colonne pour la miniature (URL Supabase Storage)
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS photo_thumbnail TEXT;

-- Commenter la nouvelle colonne
COMMENT ON COLUMN public.photos.photo_thumbnail IS 'URL publique de la miniature (200x200px) pour la galerie';

-- Index pour optimiser les requêtes de galerie
CREATE INDEX IF NOT EXISTS idx_photos_thumbnail_active ON public.photos(is_active) WHERE photo_thumbnail IS NOT NULL;

-- =============================================
-- FONCTION UTILITAIRE POUR CRÉER UNE MINIATURE
-- =============================================

-- Note: Cette fonction sera utilisée côté client JavaScript
-- car PostgreSQL ne peut pas redimensionner les images directement
-- La logique sera dans l'API Node.js pour créer des miniatures