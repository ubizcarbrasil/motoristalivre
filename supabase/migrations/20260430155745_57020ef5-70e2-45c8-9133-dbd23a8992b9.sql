-- Bucket público para imagens de portfólio dos profissionais
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas: leitura pública, escrita pelo dono (path começa com {auth.uid()}/)
DROP POLICY IF EXISTS "Portfolio publicly readable" ON storage.objects;
CREATE POLICY "Portfolio publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio');

DROP POLICY IF EXISTS "Owner uploads own portfolio" ON storage.objects;
CREATE POLICY "Owner uploads own portfolio"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Owner updates own portfolio" ON storage.objects;
CREATE POLICY "Owner updates own portfolio"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'portfolio'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Owner deletes own portfolio" ON storage.objects;
CREATE POLICY "Owner deletes own portfolio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolio'
  AND auth.uid()::text = (storage.foldername(name))[1]
);