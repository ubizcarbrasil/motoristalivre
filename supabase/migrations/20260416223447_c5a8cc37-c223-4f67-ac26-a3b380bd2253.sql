CREATE OR REPLACE FUNCTION public.ensure_passenger(_tenant_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.passengers (id, tenant_id)
  VALUES (_user_id, _tenant_id)
  ON CONFLICT (id) DO NOTHING;

  RETURN _user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_passenger(uuid) TO authenticated;