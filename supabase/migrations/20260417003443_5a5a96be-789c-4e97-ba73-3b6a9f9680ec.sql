-- Adiciona preferência de som de chamada do motorista
ALTER TABLE public.drivers
ADD COLUMN alert_sound text NOT NULL DEFAULT 'padrao'
CHECK (alert_sound IN ('suave', 'padrao', 'sirene'));