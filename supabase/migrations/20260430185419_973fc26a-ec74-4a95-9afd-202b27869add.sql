-- Remove policies antigas conflitantes do bucket "branding"
DROP POLICY IF EXISTS "Authenticated users can upload branding files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding files" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can upload branding" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can update branding" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can delete branding" ON storage.objects;
DROP POLICY IF EXISTS "Branding publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "Branding upload own folder" ON storage.objects;
DROP POLICY IF EXISTS "Branding update own folder" ON storage.objects;
DROP POLICY IF EXISTS "Branding delete own folder" ON storage.objects;

-- SELECT público (bucket é public, mas garante policy explícita)
CREATE POLICY "Branding publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

-- INSERT: pasta = auth.uid() (staging onboarding) OU pasta = tenant_id do usuário
CREATE POLICY "Branding upload own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'branding'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
  )
);

-- UPDATE: mesmo critério
CREATE POLICY "Branding update own folder"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'branding'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
  )
)
WITH CHECK (
  bucket_id = 'branding'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
  )
);

-- DELETE: mesmo critério
CREATE POLICY "Branding delete own folder"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'branding'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
  )
);