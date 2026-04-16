-- Remove policies SELECT amplas que permitiam LIST do bucket branding inteiro.
-- O bucket é public=true, então o endpoint /object/public/{path} continua servindo
-- arquivos individualmente sem precisar de policy SELECT.
DROP POLICY IF EXISTS "Branding files are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Public read branding files" ON storage.objects;