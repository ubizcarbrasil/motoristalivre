-- 1. Adicionar category_id em service_types
ALTER TABLE public.service_types
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.service_categories(id);

CREATE INDEX IF NOT EXISTS idx_service_types_category ON public.service_types(category_id);

-- 2. Estender enums
ALTER TYPE commission_type ADD VALUE IF NOT EXISTS 'service_coverage';
ALTER TYPE commission_type ADD VALUE IF NOT EXISTS 'service_referral';

ALTER TYPE wallet_transaction_type ADD VALUE IF NOT EXISTS 'commission_service_coverage';
ALTER TYPE wallet_transaction_type ADD VALUE IF NOT EXISTS 'commission_service_referral';