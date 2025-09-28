-- Créer la table newsletter
CREATE TABLE IF NOT EXISTS public.newsletter (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Non obligatoire (peut être NULL)
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name_nl VARCHAR(255),
    active BOOLEAN DEFAULT true,
    share_email BOOLEAN DEFAULT false,
    fcm_token TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    shop_favorites JSONB DEFAULT '[]'::jsonb
);

-- Créer un index sur l'email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON public.newsletter(email);

-- Créer un index sur user_id pour les jointures
CREATE INDEX IF NOT EXISTS idx_newsletter_user_id ON public.newsletter(user_id);

-- Créer un index sur active pour filtrer les abonnés actifs
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON public.newsletter(active);

-- Activer RLS (Row Level Security)
ALTER TABLE public.newsletter ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion d'emails (pour les invités et les utilisateurs connectés)
CREATE POLICY "Allow newsletter subscription" ON public.newsletter
FOR INSERT TO authenticated, anon
WITH CHECK (true);

-- Politique pour permettre aux utilisateurs de voir leurs propres données
CREATE POLICY "Users can view own newsletter data" ON public.newsletter
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres données
CREATE POLICY "Users can update own newsletter data" ON public.newsletter
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres données
CREATE POLICY "Users can delete own newsletter data" ON public.newsletter
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Politique pour permettre aux invités (anon) de voir les données publiques (si nécessaire)
-- CREATE POLICY "Allow public read access" ON public.newsletter
-- FOR SELECT TO anon
-- USING (true);

-- Commentaires sur les colonnes
COMMENT ON TABLE public.newsletter IS 'Table pour gérer les abonnements à la newsletter Made in Conflans';
COMMENT ON COLUMN public.newsletter.id IS 'Identifiant unique auto-incrémenté';
COMMENT ON COLUMN public.newsletter.created_at IS 'Date de création de l''abonnement';
COMMENT ON COLUMN public.newsletter.user_id IS 'ID utilisateur (optionnel, peut être NULL pour les invités)';
COMMENT ON COLUMN public.newsletter.email IS 'Adresse email de l''abonné (unique)';
COMMENT ON COLUMN public.newsletter.full_name_nl IS 'Nom complet pour la newsletter';
COMMENT ON COLUMN public.newsletter.active IS 'Statut de l''abonnement (actif/inactif)';
COMMENT ON COLUMN public.newsletter.share_email IS 'Autorisation de partage d''email avec les partenaires';
COMMENT ON COLUMN public.newsletter.fcm_token IS 'Token Firebase Cloud Messaging pour les notifications push';
COMMENT ON COLUMN public.newsletter.tags IS 'Tags JSON pour catégoriser les préférences';
COMMENT ON COLUMN public.newsletter.shop_favorites IS 'Boutiques favorites en JSON';
