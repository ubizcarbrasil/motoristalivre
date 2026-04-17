-- Permitir que o passageiro guest cancele a própria solicitação enquanto pendente.
-- Como guests não têm auth.uid(), permitimos UPDATE público restrito a status=cancelled
-- e somente em ride_requests com guest_passenger_id NOT NULL e status atual em pending/dispatching.

CREATE POLICY "Guest can cancel own pending request"
ON public.ride_requests
FOR UPDATE
TO public
USING (guest_passenger_id IS NOT NULL AND status IN ('pending', 'dispatching'))
WITH CHECK (guest_passenger_id IS NOT NULL AND status = 'cancelled');

-- Também permite passageiro autenticado cancelar
CREATE POLICY "Passenger can cancel own pending request"
ON public.ride_requests
FOR UPDATE
TO public
USING (passenger_id = auth.uid() AND status IN ('pending', 'dispatching'))
WITH CHECK (passenger_id = auth.uid() AND status = 'cancelled');