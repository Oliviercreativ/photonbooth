-- Activer RLS sur les tables photobooth
ALTER TABLE public.photobooth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Politiques pour photobooth_sessions
CREATE POLICY "Users can insert their own sessions" ON public.photobooth_sessions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own sessions" ON public.photobooth_sessions
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.photobooth_sessions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.photobooth_sessions
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Politiques pour photos
CREATE POLICY "Users can insert their own photos" ON public.photos
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own photos" ON public.photos
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos" ON public.photos
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos" ON public.photos
FOR DELETE TO authenticated
USING (auth.uid() = user_id);
