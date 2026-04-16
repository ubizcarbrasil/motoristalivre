-- Enum para tipo de favorito
CREATE TYPE public.favorite_type AS ENUM ('home', 'work', 'other');

-- Tabela de favoritos do passageiro
CREATE TABLE public.passenger_favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  passenger_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type public.favorite_type NOT NULL DEFAULT 'other',
  label text NOT NULL,
  address text NOT NULL,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Garante apenas 1 home e 1 work por passageiro (other é livre)
CREATE UNIQUE INDEX passenger_favorites_unique_home_work
  ON public.passenger_favorites (passenger_id, type)
  WHERE type IN ('home', 'work');

CREATE INDEX passenger_favorites_passenger_idx
  ON public.passenger_favorites (passenger_id);

-- RLS
ALTER TABLE public.passenger_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Passengers can view own favorites"
  ON public.passenger_favorites FOR SELECT
  USING (passenger_id = auth.uid());

CREATE POLICY "Passengers can insert own favorites"
  ON public.passenger_favorites FOR INSERT
  WITH CHECK (passenger_id = auth.uid());

CREATE POLICY "Passengers can update own favorites"
  ON public.passenger_favorites FOR UPDATE
  USING (passenger_id = auth.uid());

CREATE POLICY "Passengers can delete own favorites"
  ON public.passenger_favorites FOR DELETE
  USING (passenger_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER set_passenger_favorites_updated_at
  BEFORE UPDATE ON public.passenger_favorites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();