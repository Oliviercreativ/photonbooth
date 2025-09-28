-- Création du bucket photobooth pour stocker les photos
-- Ce script doit être exécuté dans l'éditeur SQL de Supabase

-- 1. Créer le bucket photobooth
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photobooth',
  'photobooth',
  true, -- Bucket public pour accès direct aux images
  10485760, -- 10MB max par fichier
  ARRAY['image/jpeg', 'image/png', 'image/webp'] -- Types de fichiers autorisés
);

-- 2. Politique RLS pour INSERT (upload de photos)
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'photobooth' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Politique RLS pour SELECT (lecture des photos)
CREATE POLICY "Anyone can view photos" ON storage.objects
FOR SELECT USING (bucket_id = 'photobooth');

-- 4. Politique RLS pour UPDATE (mise à jour des métadonnées)
CREATE POLICY "Users can update their own photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'photobooth' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Politique RLS pour DELETE (suppression de photos)
CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'photobooth' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Fonction helper pour obtenir l'URL publique d'une photo
CREATE OR REPLACE FUNCTION get_photo_url(photo_path text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT concat('https://[VOTRE-PROJECT-REF].supabase.co/storage/v1/object/public/photobooth/', photo_path);
$$;

-- 7. Fonction pour uploader une photo (à utiliser côté client)
CREATE OR REPLACE FUNCTION upload_photo(
  user_id uuid,
  photo_data bytea,
  file_name text,
  content_type text DEFAULT 'image/jpeg'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  file_path text;
  file_url text;
BEGIN
  -- Générer un nom de fichier unique
  file_path := user_id::text || '/' || extract(epoch from now())::text || '_' || file_name;
  
  -- Upload du fichier (cette fonction sera appelée côté client avec le SDK Supabase)
  -- Le retour sera l'URL publique
  file_url := 'https://[VOTRE-PROJECT-REF].supabase.co/storage/v1/object/public/photobooth/' || file_path;
  
  RETURN file_url;
END;
$$;

-- 8. Vérification que le bucket a été créé
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'photobooth';

-- 9. Vérification des politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
