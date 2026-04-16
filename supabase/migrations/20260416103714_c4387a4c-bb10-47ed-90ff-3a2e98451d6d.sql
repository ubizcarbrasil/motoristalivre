
-- Criar bucket público para branding (logos, capas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('branding', 'branding', true)
ON CONFLICT (id) DO NOTHING;

-- Qualquer pessoa pode visualizar arquivos do bucket branding
CREATE POLICY "Public read branding files"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

-- Usuários autenticados podem fazer upload no bucket branding
CREATE POLICY "Authenticated users can upload branding files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'branding');

-- Usuários autenticados podem atualizar seus próprios arquivos
CREATE POLICY "Authenticated users can update branding files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'branding');
