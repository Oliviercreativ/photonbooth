-- Policy pour permettre l'insertion dans la table photos
CREATE POLICY "Allow insert on photos" ON "public"."photos"
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Policy pour permettre la lecture des photos
CREATE POLICY "Allow select on photos" ON "public"."photos"
FOR SELECT 
TO anon, authenticated
USING (true);
