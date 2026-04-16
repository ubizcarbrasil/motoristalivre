-- Housekeeping: mover arquivos antigos do bucket "branding" para a estrutura {tenant_id}/{pasta}/{arquivo}
-- e atualizar URLs em public.tenant_branding para os novos caminhos.
DO $$
DECLARE
  _obj record;
  _tenant_id uuid;
  _new_name text;
  _old_url text;
  _new_url text;
  _base_url text := 'https://sulhoaufaifqgnrvstez.supabase.co/storage/v1/object/public/branding/';
BEGIN
  FOR _obj IN
    SELECT id, name
    FROM storage.objects
    WHERE bucket_id = 'branding'
      AND (storage.foldername(name))[1] IN ('logos', 'capas')
  LOOP
    -- Tenta achar o tenant pelo logo_url
    SELECT tenant_id INTO _tenant_id
    FROM public.tenant_branding
    WHERE logo_url LIKE '%/branding/' || _obj.name
       OR cover_url LIKE '%/branding/' || _obj.name
    LIMIT 1;

    IF _tenant_id IS NULL THEN
      -- Sem tenant identificável; pular para evitar perda de associação
      CONTINUE;
    END IF;

    _new_name := _tenant_id::text || '/' || _obj.name;

    -- Renomear objeto no storage (apenas se ainda não existe destino)
    IF NOT EXISTS (
      SELECT 1 FROM storage.objects
      WHERE bucket_id = 'branding' AND name = _new_name
    ) THEN
      UPDATE storage.objects
      SET name = _new_name
      WHERE id = _obj.id;
    END IF;

    -- Atualizar URLs em tenant_branding
    _old_url := _base_url || _obj.name;
    _new_url := _base_url || _new_name;

    UPDATE public.tenant_branding
    SET logo_url = _new_url, updated_at = now()
    WHERE logo_url = _old_url;

    UPDATE public.tenant_branding
    SET cover_url = _new_url, updated_at = now()
    WHERE cover_url = _old_url;
  END LOOP;
END $$;