-- Torna o bucket branding public=true para que getPublicUrl funcione.
-- A escrita continua protegida pelas policies de INSERT/UPDATE/DELETE com prefixo {tenant_id}/.
UPDATE storage.buckets SET public = true WHERE id = 'branding';

-- Remove a policy SELECT redundante (bucket público já permite leitura via /object/public)
DROP POLICY IF EXISTS "Public can read branding files" ON storage.objects;