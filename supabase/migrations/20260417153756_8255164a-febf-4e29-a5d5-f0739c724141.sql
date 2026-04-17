
-- 1) Tabela guest_passengers
CREATE TABLE IF NOT EXISTS public.guest_passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  whatsapp text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.guest_passengers ENABLE ROW LEVEL SECURITY;

-- Apenas tenant admins podem ver. Inserts são feitos via SECURITY DEFINER RPC.
CREATE POLICY "Tenant admins can view guest passengers"
ON public.guest_passengers
FOR SELECT
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role, 'driver'::app_role])
);

-- 2) Colunas guest em ride_requests e rides
ALTER TABLE public.ride_requests
  ADD COLUMN IF NOT EXISTS guest_passenger_id uuid REFERENCES public.guest_passengers(id) ON DELETE SET NULL;

ALTER TABLE public.ride_requests ALTER COLUMN passenger_id DROP NOT NULL;

ALTER TABLE public.ride_requests
  DROP CONSTRAINT IF EXISTS ride_requests_passenger_or_guest_chk;
ALTER TABLE public.ride_requests
  ADD CONSTRAINT ride_requests_passenger_or_guest_chk
  CHECK (passenger_id IS NOT NULL OR guest_passenger_id IS NOT NULL);

ALTER TABLE public.rides
  ADD COLUMN IF NOT EXISTS guest_passenger_id uuid REFERENCES public.guest_passengers(id) ON DELETE SET NULL;

ALTER TABLE public.rides ALTER COLUMN passenger_id DROP NOT NULL;

ALTER TABLE public.rides
  DROP CONSTRAINT IF EXISTS rides_passenger_or_guest_chk;
ALTER TABLE public.rides
  ADD CONSTRAINT rides_passenger_or_guest_chk
  CHECK (passenger_id IS NOT NULL OR guest_passenger_id IS NOT NULL);

-- 3) Permitir leitura pública por id da corrida (rastreio anônimo via id salvo no localStorage)
DROP POLICY IF EXISTS "Public can view ride request by id" ON public.ride_requests;
CREATE POLICY "Public can view ride request by id"
ON public.ride_requests
FOR SELECT
USING (guest_passenger_id IS NOT NULL);

DROP POLICY IF EXISTS "Public can view ride by guest" ON public.rides;
CREATE POLICY "Public can view ride by guest"
ON public.rides
FOR SELECT
USING (guest_passenger_id IS NOT NULL);

-- 4) RPC para criar corrida como guest
CREATE OR REPLACE FUNCTION public.create_guest_ride_request(
  _tenant_id uuid,
  _full_name text,
  _whatsapp text,
  _origin_lat numeric,
  _origin_lng numeric,
  _origin_address text,
  _dest_lat numeric,
  _dest_lng numeric,
  _dest_address text,
  _distance_km numeric,
  _estimated_min integer,
  _offered_price numeric,
  _suggested_price numeric,
  _payment_method payment_method,
  _origin_type ride_origin_type,
  _origin_driver_id uuid DEFAULT NULL,
  _origin_affiliate_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _guest_id uuid;
  _request_id uuid;
BEGIN
  IF _full_name IS NULL OR length(trim(_full_name)) < 2 THEN
    RAISE EXCEPTION 'Nome inválido';
  END IF;
  IF _whatsapp IS NULL OR length(regexp_replace(_whatsapp, '\D', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'WhatsApp inválido';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tenants WHERE id = _tenant_id) THEN
    RAISE EXCEPTION 'Tenant inválido';
  END IF;

  INSERT INTO public.guest_passengers (tenant_id, full_name, whatsapp)
  VALUES (_tenant_id, trim(_full_name), trim(_whatsapp))
  RETURNING id INTO _guest_id;

  INSERT INTO public.ride_requests (
    tenant_id, guest_passenger_id, status,
    origin_lat, origin_lng, origin_address,
    dest_lat, dest_lng, dest_address,
    distance_km, estimated_min,
    offered_price, suggested_price,
    payment_method, origin_type,
    origin_driver_id, origin_affiliate_id
  ) VALUES (
    _tenant_id, _guest_id, 'pending',
    _origin_lat, _origin_lng, _origin_address,
    _dest_lat, _dest_lng, _dest_address,
    _distance_km, _estimated_min,
    _offered_price, _suggested_price,
    _payment_method, _origin_type,
    _origin_driver_id, _origin_affiliate_id
  ) RETURNING id INTO _request_id;

  RETURN jsonb_build_object(
    'guest_passenger_id', _guest_id,
    'ride_request_id', _request_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_guest_ride_request(
  uuid, text, text, numeric, numeric, text, numeric, numeric, text,
  numeric, integer, numeric, numeric, payment_method, ride_origin_type, uuid, uuid
) TO anon, authenticated;
