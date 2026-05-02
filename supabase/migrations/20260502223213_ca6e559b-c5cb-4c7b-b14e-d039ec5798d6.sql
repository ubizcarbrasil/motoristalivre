ALTER TABLE public.tenant_settings
  ADD COLUMN IF NOT EXISTS quote_menu_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS quote_menu_label text,
  ADD COLUMN IF NOT EXISTS quote_menu_icon text,
  ADD COLUMN IF NOT EXISTS quote_menu_color text;