-- Tornar bucket branding privado
UPDATE storage.buckets SET public = false WHERE id = 'branding';

-- Limpar policies antigas se existirem
DROP POLICY IF EXISTS "Branding files are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can upload branding" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can update branding" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can delete branding" ON storage.objects;

-- Leitura pública (continua acessível para mostrar logos em páginas públicas do tenant via signed URL ou via SELECT na object key)
CREATE POLICY "Branding files are publicly viewable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'branding');

-- Upload: apenas admin/manager do tenant correspondente (primeira pasta = tenant_id)
CREATE POLICY "Tenant admins can upload branding"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'branding'
  AND (storage.foldername(name))[1]::uuid = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
);

-- Update: mesma regra
CREATE POLICY "Tenant admins can update branding"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'branding'
  AND (storage.foldername(name))[1]::uuid = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
);

-- Delete: mesma regra
CREATE POLICY "Tenant admins can delete branding"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'branding'
  AND (storage.foldername(name))[1]::uuid = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
);