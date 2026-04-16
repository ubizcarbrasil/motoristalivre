CREATE OR REPLACE FUNCTION public.notify_dispatch_ride()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _url text;
  _anon_key text;
BEGIN
  IF NEW.status = 'pending' THEN
    _url := 'https://sulhoaufaifqgnrvstez.supabase.co/functions/v1/dispatch-ride';
    _anon_key := current_setting('app.settings.supabase_anon_key', true);

    BEGIN
      PERFORM net.http_post(
        url := _url,
        body := jsonb_build_object(
          'action', 'trigger',
          'record', jsonb_build_object(
            'id', NEW.id,
            'tenant_id', NEW.tenant_id,
            'passenger_id', NEW.passenger_id,
            'origin_driver_id', NEW.origin_driver_id,
            'origin_affiliate_id', NEW.origin_affiliate_id,
            'status', NEW.status
          )
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || COALESCE(_anon_key, '')
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'notify_dispatch_ride falhou: % - %', SQLSTATE, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$;