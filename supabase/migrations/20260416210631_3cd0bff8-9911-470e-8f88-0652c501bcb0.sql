-- Reverte os name no índice storage.objects para os caminhos antigos
-- onde o blob físico realmente está. Em seguida uma edge function fará o move correto.
UPDATE storage.objects
SET name = 'logos/26b2f68f-8462-4728-affd-6e3a75dde7be.png'
WHERE id = '2e395ead-7343-445e-920b-fa176fd1f1e2'
  AND bucket_id = 'branding';

UPDATE storage.objects
SET name = 'capas/da0f4549-6929-422c-a01f-0c763f3d305a.png'
WHERE id = '167f755b-e7c9-4593-ae02-adb44bb81653'
  AND bucket_id = 'branding';

-- Reverte também as URLs em tenant_branding para apontar para os caminhos antigos temporariamente
UPDATE public.tenant_branding
SET logo_url = 'https://sulhoaufaifqgnrvstez.supabase.co/storage/v1/object/public/branding/logos/26b2f68f-8462-4728-affd-6e3a75dde7be.png'
WHERE tenant_id = 'c543a569-e034-4024-9ba9-711e7291dcae';

UPDATE public.tenant_branding
SET cover_url = 'https://sulhoaufaifqgnrvstez.supabase.co/storage/v1/object/public/branding/capas/da0f4549-6929-422c-a01f-0c763f3d305a.png'
WHERE tenant_id = 'c543a569-e034-4024-9ba9-711e7291dcae';