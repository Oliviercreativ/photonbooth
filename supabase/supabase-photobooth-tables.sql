-- =============================================
-- TABLES PHOTOBOOTH - Made in Conflans
-- =============================================

-- Table pour les sessions de photobooth
CREATE TABLE IF NOT EXISTS public.photobooth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photos_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Table pour stocker les photos
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.photobooth_sessions(id) ON DELETE CASCADE,
  background_id TEXT NOT NULL,
  background_name TEXT NOT NULL,
  photo_url TEXT NOT NULL, -- URL publique du Storage Supabase
  watermark_removed BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE, -- Pour "supprimer" au lieu de DELETE
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEX POUR LES PERFORMANCES
-- =============================================

-- Index pour les sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.photobooth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.photobooth_sessions(created_at);

-- Index pour les photos
CREATE INDEX IF NOT EXISTS idx_photos_user_id ON public.photos(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_session_id ON public.photos(session_id);
CREATE INDEX IF NOT EXISTS idx_photos_created_at ON public.photos(created_at);
CREATE INDEX IF NOT EXISTS idx_photos_is_active ON public.photos(is_active);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Activer RLS sur les tables
ALTER TABLE public.photobooth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLITIQUES RLS POUR PHOTOBOOTH_SESSIONS
-- =============================================

-- Politique SELECT : L'utilisateur peut voir ses propres sessions
CREATE POLICY "Users can view their own sessions" ON public.photobooth_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Politique INSERT : L'utilisateur peut créer ses propres sessions
CREATE POLICY "Users can create their own sessions" ON public.photobooth_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique UPDATE : L'utilisateur peut modifier ses propres sessions
CREATE POLICY "Users can update their own sessions" ON public.photobooth_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- POLITIQUES RLS POUR PHOTOS
-- =============================================

-- Politique SELECT : L'utilisateur peut voir ses propres photos actives
CREATE POLICY "Users can view their own active photos" ON public.photos
  FOR SELECT USING (auth.uid() = user_id AND is_active = TRUE);

-- Politique INSERT : L'utilisateur peut créer ses propres photos
CREATE POLICY "Users can create their own photos" ON public.photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique UPDATE : L'utilisateur peut modifier ses propres photos (pour désactiver)
CREATE POLICY "Users can update their own photos" ON public.photos
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- FONCTIONS UTILITAIRES
-- =============================================

-- Fonction pour créer une nouvelle session
CREATE OR REPLACE FUNCTION public.create_photobooth_session()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_uuid UUID;
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Créer la session
  INSERT INTO public.photobooth_sessions (user_id)
  VALUES (auth.uid())
  RETURNING id INTO session_uuid;

  RETURN session_uuid;
END;
$$;

-- Fonction pour désactiver une photo (au lieu de DELETE)
CREATE OR REPLACE FUNCTION public.deactivate_photo(photo_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Désactiver la photo
  UPDATE public.photos 
  SET is_active = FALSE 
  WHERE id = photo_uuid 
    AND user_id = auth.uid()
    AND is_active = TRUE;

  -- Vérifier si la mise à jour a réussi
  IF FOUND THEN
    RETURN TRUE;
  ELSE
    RAISE EXCEPTION 'Photo not found or already deactivated';
  END IF;
END;
$$;

-- Fonction pour compter les photos d'une session
CREATE OR REPLACE FUNCTION public.count_session_photos(session_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  photo_count INTEGER;
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Compter les photos actives de la session
  SELECT COUNT(*) INTO photo_count
  FROM public.photos
  WHERE session_id = session_uuid
    AND user_id = auth.uid()
    AND is_active = TRUE;

  RETURN photo_count;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Trigger pour mettre à jour le compteur de photos dans la session
CREATE OR REPLACE FUNCTION public.update_session_photo_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mettre à jour le compteur de photos dans la session
  UPDATE public.photobooth_sessions
  SET photos_count = (
    SELECT COUNT(*) 
    FROM public.photos 
    WHERE session_id = NEW.session_id 
      AND is_active = TRUE
  )
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$;

-- Créer le trigger
CREATE TRIGGER trigger_update_session_photo_count
  AFTER INSERT OR UPDATE OR DELETE ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_session_photo_count();

-- =============================================
-- COMMENTAIRES
-- =============================================

COMMENT ON TABLE public.photobooth_sessions IS 'Sessions de photobooth pour regrouper les photos d''une visite';
COMMENT ON TABLE public.photos IS 'Photos du photobooth avec watermark et gestion de suppression';

COMMENT ON COLUMN public.photos.is_active IS 'TRUE = photo visible, FALSE = photo "supprimée"';
COMMENT ON COLUMN public.photos.watermark_removed IS 'TRUE = watermark supprimé (payé), FALSE = watermark présent';
COMMENT ON COLUMN public.photobooth_sessions.photos_count IS 'Nombre de photos actives dans cette session';

-- =============================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =============================================

-- Insérer des données de test si nécessaire
-- INSERT INTO public.photobooth_sessions (user_id) VALUES ('user-uuid-here');
-- INSERT INTO public.photos (user_id, session_id, background_id, background_name, photo_url) 
-- VALUES ('user-uuid-here', 'session-uuid-here', 'pixar-france', 'Pixar France', 'https://example.com/photo.jpg');
