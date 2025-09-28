-- =============================================
-- AJOUT DU CHAMP PHOTO_THUMBNAIL
-- =============================================

-- Ajouter la colonne photo_thumbnail à la table photos
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS photo_thumbnail TEXT;

-- Ajouter un commentaire pour documenter le champ
COMMENT ON COLUMN public.photos.photo_thumbnail IS 'URL de la miniature de la photo';

-- =============================================
-- MISE À JOUR DES POLICIES RLS (si nécessaire)
-- =============================================

-- Les policies existantes fonctionnent déjà pour le nouveau champ
-- car elles utilisent auth.uid() = user_id qui couvre tous les champs

-- Vérifier que les policies existent toujours :
-- 1. SELECT : Users can view their own active photos
-- 2. INSERT : Users can create their own photos  
-- 3. UPDATE : Users can update their own photos

-- =============================================
-- EXEMPLE D'UTILISATION
-- =============================================

-- Maintenant vous pouvez insérer avec thumbnail :
-- INSERT INTO public.photos (
--   user_id, 
--   background_id, 
--   background_name, 
--   photo_url, 
--   photo_thumbnail,
--   watermark_removed, 
--   is_active
-- ) VALUES (
--   '27c2a406-65a0-421d-af06-d0ebf2f0123e',
--   'pixar-france',
--   'Pixar France',
--   'https://bucket.supabase.co/storage/v1/object/public/photobooth/photo.jpg',
--   'https://bucket.supabase.co/storage/v1/object/public/photobooth/photo_thumb.jpg',
--   false,
--   true
-- );
