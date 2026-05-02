
-- 1) Toggle "aceitando agendamentos"
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS accepting_bookings boolean NOT NULL DEFAULT true;

-- 2) Tabela de bloqueios pontuais
CREATE TABLE IF NOT EXISTS public.provider_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  reason text,
  all_day boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_time_off_driver
  ON public.provider_time_off(driver_id, starts_at);

ALTER TABLE public.provider_time_off ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view time off" ON public.provider_time_off;
CREATE POLICY "Public can view time off"
  ON public.provider_time_off FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Driver manages own time off" ON public.provider_time_off;
CREATE POLICY "Driver manages own time off"
  ON public.provider_time_off FOR ALL
  USING (driver_id = auth.uid())
  WITH CHECK (driver_id = auth.uid());

DROP POLICY IF EXISTS "Tenant admins manage time off" ON public.provider_time_off;
CREATE POLICY "Tenant admins manage time off"
  ON public.provider_time_off FOR ALL
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
  )
  WITH CHECK (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
  );

-- 3) Validação: ends_at > starts_at via trigger (evita CHECK com now())
CREATE OR REPLACE FUNCTION public.validate_time_off()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.ends_at <= NEW.starts_at THEN
    RAISE EXCEPTION 'Fim do bloqueio deve ser depois do início';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_time_off ON public.provider_time_off;
CREATE TRIGGER trg_validate_time_off
  BEFORE INSERT OR UPDATE ON public.provider_time_off
  FOR EACH ROW EXECUTE FUNCTION public.validate_time_off();

-- 4) Replace bulk de disponibilidade
CREATE OR REPLACE FUNCTION public.replace_provider_availability(
  _driver_id uuid,
  _tenant_id uuid,
  _slot_min int,
  _buffer_min int,
  _blocos jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _is_owner boolean;
  _is_admin boolean;
  _row jsonb;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  _is_owner := (_user_id = _driver_id);
  _is_admin := (
    public.get_user_tenant_id(_user_id) = _tenant_id
    AND public.get_user_role(_user_id) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
  );

  IF NOT (_is_owner OR _is_admin) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF _slot_min IS NULL OR _slot_min < 5 THEN
    _slot_min := 60;
  END IF;
  IF _buffer_min IS NULL OR _buffer_min < 0 THEN
    _buffer_min := 0;
  END IF;

  DELETE FROM public.professional_availability WHERE driver_id = _driver_id;

  IF _blocos IS NULL OR jsonb_array_length(_blocos) = 0 THEN
    RETURN;
  END IF;

  FOR _row IN SELECT * FROM jsonb_array_elements(_blocos) LOOP
    INSERT INTO public.professional_availability (
      driver_id, tenant_id, day_of_week, start_time, end_time,
      slot_duration_minutes, buffer_minutes, is_active
    ) VALUES (
      _driver_id,
      _tenant_id,
      (_row->>'day_of_week')::int,
      (_row->>'start_time')::time,
      (_row->>'end_time')::time,
      _slot_min,
      _buffer_min,
      true
    );
  END LOOP;
END;
$$;
