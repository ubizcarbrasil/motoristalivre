
-- Tabela de mensagens vinculadas a service_bookings
CREATE TABLE public.service_booking_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('client','driver')),
  sender_id uuid NULL,
  guest_id uuid NULL,
  content text NOT NULL CHECK (length(trim(content)) > 0 AND length(content) <= 4000),
  read_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sbm_booking_created ON public.service_booking_messages(booking_id, created_at);
CREATE INDEX idx_sbm_booking_unread ON public.service_booking_messages(booking_id) WHERE read_at IS NULL;

ALTER TABLE public.service_booking_messages REPLICA IDENTITY FULL;
ALTER TABLE public.service_booking_messages ENABLE ROW LEVEL SECURITY;

-- Cliente logado vê mensagens dos próprios bookings
CREATE POLICY "Client views own booking messages"
ON public.service_booking_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.service_bookings sb
  WHERE sb.id = service_booking_messages.booking_id AND sb.client_id = auth.uid()
));

-- Cliente logado envia mensagens
CREATE POLICY "Client sends booking messages"
ON public.service_booking_messages FOR INSERT
WITH CHECK (
  sender_role = 'client'
  AND sender_id = auth.uid()
  AND guest_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.service_bookings sb
    WHERE sb.id = booking_id AND sb.client_id = auth.uid() AND sb.tenant_id = service_booking_messages.tenant_id
  )
);

-- Profissional vê mensagens dos próprios bookings
CREATE POLICY "Driver views own booking messages"
ON public.service_booking_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.service_bookings sb
  WHERE sb.id = service_booking_messages.booking_id AND sb.driver_id = auth.uid()
));

-- Profissional envia mensagens
CREATE POLICY "Driver sends booking messages"
ON public.service_booking_messages FOR INSERT
WITH CHECK (
  sender_role = 'driver'
  AND sender_id = auth.uid()
  AND guest_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.service_bookings sb
    WHERE sb.id = booking_id AND sb.driver_id = auth.uid() AND sb.tenant_id = service_booking_messages.tenant_id
  )
);

-- Admin/manager do tenant pode visualizar
CREATE POLICY "Tenant admins view booking messages"
ON public.service_booking_messages FOR SELECT
USING (
  tenant_id = public.get_user_tenant_id(auth.uid())
  AND public.get_user_role(auth.uid()) = ANY (ARRAY['root_admin'::app_role, 'tenant_admin'::app_role, 'manager'::app_role])
);

-- Marcar como lida: cliente do booking
CREATE POLICY "Client marks read"
ON public.service_booking_messages FOR UPDATE
USING (
  sender_role = 'driver'
  AND EXISTS (SELECT 1 FROM public.service_bookings sb WHERE sb.id = booking_id AND sb.client_id = auth.uid())
)
WITH CHECK (
  sender_role = 'driver'
  AND EXISTS (SELECT 1 FROM public.service_bookings sb WHERE sb.id = booking_id AND sb.client_id = auth.uid())
);

-- Marcar como lida: profissional do booking
CREATE POLICY "Driver marks read"
ON public.service_booking_messages FOR UPDATE
USING (
  sender_role = 'client'
  AND EXISTS (SELECT 1 FROM public.service_bookings sb WHERE sb.id = booking_id AND sb.driver_id = auth.uid())
)
WITH CHECK (
  sender_role = 'client'
  AND EXISTS (SELECT 1 FROM public.service_bookings sb WHERE sb.id = booking_id AND sb.driver_id = auth.uid())
);

-- RPC: convidado lista mensagens do próprio booking
CREATE OR REPLACE FUNCTION public.listar_mensagens_chat_guest(_booking_id uuid, _guest_id uuid)
RETURNS SETOF public.service_booking_messages
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.service_bookings
    WHERE id = _booking_id AND guest_passenger_id = _guest_id
  ) THEN
    RAISE EXCEPTION 'Booking não encontrado para este convidado';
  END IF;

  RETURN QUERY
  SELECT * FROM public.service_booking_messages
  WHERE booking_id = _booking_id
  ORDER BY created_at ASC;
END;
$$;

-- RPC: convidado envia mensagem
CREATE OR REPLACE FUNCTION public.enviar_mensagem_chat_guest(_booking_id uuid, _guest_id uuid, _content text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tenant_id uuid;
  _msg_id uuid;
BEGIN
  IF _content IS NULL OR length(trim(_content)) = 0 THEN
    RAISE EXCEPTION 'Mensagem vazia';
  END IF;
  IF length(_content) > 4000 THEN
    RAISE EXCEPTION 'Mensagem muito longa';
  END IF;

  SELECT tenant_id INTO _tenant_id
  FROM public.service_bookings
  WHERE id = _booking_id AND guest_passenger_id = _guest_id;

  IF _tenant_id IS NULL THEN
    RAISE EXCEPTION 'Booking não encontrado para este convidado';
  END IF;

  INSERT INTO public.service_booking_messages (
    booking_id, tenant_id, sender_role, sender_id, guest_id, content
  ) VALUES (
    _booking_id, _tenant_id, 'client', NULL, _guest_id, trim(_content)
  ) RETURNING id INTO _msg_id;

  RETURN _msg_id;
END;
$$;

-- RPC: convidado marca mensagens do profissional como lidas
CREATE OR REPLACE FUNCTION public.marcar_lidas_chat_guest(_booking_id uuid, _guest_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _qtd integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.service_bookings
    WHERE id = _booking_id AND guest_passenger_id = _guest_id
  ) THEN
    RAISE EXCEPTION 'Booking não encontrado para este convidado';
  END IF;

  UPDATE public.service_booking_messages
  SET read_at = now()
  WHERE booking_id = _booking_id
    AND sender_role = 'driver'
    AND read_at IS NULL;
  GET DIAGNOSTICS _qtd = ROW_COUNT;
  RETURN _qtd;
END;
$$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_booking_messages;
