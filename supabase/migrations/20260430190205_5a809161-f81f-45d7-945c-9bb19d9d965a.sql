-- Adiciona modo de cobrança aos tipos de serviço
CREATE TYPE public.service_pricing_mode AS ENUM ('fixed','hourly','daily');

ALTER TABLE public.service_types
  ADD COLUMN pricing_mode public.service_pricing_mode NOT NULL DEFAULT 'fixed';