## Problema
Upload de logo/capa no onboarding falha com **"new row violates row-level security policy"**.

**Causa raiz:** as RLS policies do bucket `branding` no Storage só permitem upload por `tenant_admin` em pasta com tenant_id válido. Durante o onboarding o usuário ainda **não tem `tenant_id`** em `public.users` (a tribo está sendo criada agora), então nenhuma policy `WITH CHECK` aprova o INSERT.

## Solução
Reescrever as policies do bucket `branding` para aceitar uploads em uma pasta cujo primeiro segmento seja **`auth.uid()`** (staging do onboarding) **OU** o `tenant_id` do usuário (uso normal pós-criação).

O componente `campo_upload_imagem.tsx` já usa `tenant_id ?? userId` como pasta, então só falta liberar isso no Storage.

## Migration

```sql
-- Remove policies antigas conflitantes
DROP POLICY IF EXISTS "Authenticated users can upload branding files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding files" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can upload branding" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can update branding" ON storage.objects;
DROP POLICY IF EXISTS "Tenant admins can delete branding" ON storage.objects;

-- SELECT público (bucket já é public)
CREATE POLICY "Branding publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'branding');

-- INSERT/UPDATE/DELETE: pasta = auth.uid() OU pasta = tenant_id do usuário
CREATE POLICY "Branding upload own folder"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'branding' AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR (storage.foldername(name))[1] = public.get_user_tenant_id(auth.uid())::text
    )
  );

-- (mesma regra para UPDATE e DELETE)
```

## Resultado
- Onboarding: usuário sobe imagem em `{userId}/logo/...` ✅
- Pós-criação: usuário sobe em `{tenantId}/logo/...` ✅
- Outros tenants continuam isolados (não conseguem mexer em pastas alheias).
- Bucket continua público para leitura (URLs funcionam normalmente).