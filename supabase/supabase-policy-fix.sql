-- =============================================
-- FIX RLS POLICY POUR L'UUID FIXE
-- =============================================

-- Supprimer l'ancienne policy INSERT restrictive
DROP POLICY IF EXISTS "Users can create their own photos" ON public.photos;

-- Créer une nouvelle policy INSERT plus permissive
CREATE POLICY "Allow insert photos for fixed user" ON public.photos
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  user_id = '27c2a406-65a0-421d-af06-d0ebf2f0123e'::uuid
);

-- Garder les autres policies pour la sécurité
-- SELECT et UPDATE restent restrictives
