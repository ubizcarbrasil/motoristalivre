ALTER TABLE public.tenant_settings ALTER COLUMN dispatch_timeout_sec SET DEFAULT 120;
UPDATE public.tenant_settings SET dispatch_timeout_sec = 120 WHERE dispatch_timeout_sec = 60;