-- Reativa leitura pública dos arquivos do bucket branding (logos e capas).
-- Mantém o bucket privado (sem listagem direta), mas permite GET via getPublicUrl.
CREATE POLICY "Public can read branding files"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'branding');