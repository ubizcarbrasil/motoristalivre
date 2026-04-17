-- Atualiza notify_dispatch_ride com anon key hardcoded (publishable, sem risco)
CREATE OR REPLACE FUNCTION public.notify_dispatch_ride()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _url text;
  _anon_key text;
BEGIN
  IF NEW.status = 'pending' THEN
    _url := 'https://sulhoaufaifqgnrvstez.supabase.co/functions/v1/dispatch-ride';
    _anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1bGhvYXVmYWlmcWducnZzdGV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyOTU5MTMsImV4cCI6MjA5MTg3MTkxM30.S9yhvZjNjjJouTN617gskskH_UXY4m3pax7JyYE1FIA';

    BEGIN
      PERFORM net.http_post(
        url := _url,
        body := jsonb_build_object(
          'action', 'trigger',
          'record', jsonb_build_object(
            'id', NEW.id,
            'tenant_id', NEW.tenant_id,
            'passenger_id', NEW.passenger_id,
            'guest_passenger_id', NEW.guest_passenger_id,
            'origin_driver_id', NEW.origin_driver_id,
            'origin_affiliate_id', NEW.origin_affiliate_id,
            'status', NEW.status
          )
        ),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || _anon_key
        )
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'notify_dispatch_ride falhou: % - %', SQLSTATE, SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$function$;

-- Cria o trigger faltante na tabela ride_requests
DROP TRIGGER IF EXISTS trg_notify_dispatch_ride ON public.ride_requests;
CREATE TRIGGER trg_notify_dispatch_ride
AFTER INSERT ON public.ride_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_dispatch_ride();