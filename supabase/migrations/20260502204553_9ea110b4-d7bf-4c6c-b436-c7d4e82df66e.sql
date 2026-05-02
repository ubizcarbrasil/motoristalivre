-- 1. Adicionar avatar_url em drivers
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Criar bucket público para perfis profissionais
INSERT INTO storage.buckets (id, name, public)
VALUES ('perfis-profissionais', 'perfis-profissionais', true)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS no bucket
-- Leitura pública
CREATE POLICY "Perfis profissionais publicamente visiveis"
ON storage.objects FOR SELECT
USING (bucket_id = 'perfis-profissionais');

-- Profissional faz upload na própria pasta {driver_id}/...
CREATE POLICY "Profissional envia propria imagem perfil"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'perfis-profissionais'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Profissional atualiza propria imagem perfil"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'perfis-profissionais'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Profissional remove propria imagem perfil"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'perfis-profissionais'
  AND auth.uid()::text = (storage.foldername(name))[1]
);