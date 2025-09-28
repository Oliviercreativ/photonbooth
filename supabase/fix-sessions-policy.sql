-- =============================================
-- FIX RLS POLICY POUR PHOTOBOOTH_SESSIONS
-- =============================================

-- Supprimer l'ancienne policy INSERT restrictive
DROP POLICY IF EXISTS "Users can create their own sessions" ON public.photobooth_sessions;

-- Créer une nouvelle policy INSERT plus permissive
CREATE POLICY "Allow insert sessions for fixed user" ON public.photobooth_sessions
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  user_id = '27c2a406-65a0-421d-af06-d0ebf2f0123e'::uuid
);
