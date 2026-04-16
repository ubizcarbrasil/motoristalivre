
SET session_replication_role = 'replica';

INSERT INTO public.users (id, tenant_id, role, full_name, email, phone, status) VALUES
  ('d0000001-a000-4000-b000-000000000001', 'c543a569-e034-4024-9ba9-711e7291dcae', 'driver', 'Carlos Silva', 'carlos.seed@teste.com', '5511999990001', 'active'),
  ('d0000001-a000-4000-b000-000000000002', 'c543a569-e034-4024-9ba9-711e7291dcae', 'driver', 'Ana Souza', 'ana.seed@teste.com', '5511999990002', 'active'),
  ('d0000001-a000-4000-b000-000000000003', 'c543a569-e034-4024-9ba9-711e7291dcae', 'driver', 'Pedro Lima', 'pedro.seed@teste.com', '5511999990003', 'active'),
  ('d0000001-a000-4000-b000-000000000004', 'c543a569-e034-4024-9ba9-711e7291dcae', 'affiliate', 'Maria Santos', 'maria.seed@teste.com', '5511999990004', 'active'),
  ('d0000001-a000-4000-b000-000000000005', 'c543a569-e034-4024-9ba9-711e7291dcae', 'passenger', 'Joao Passageiro', 'joao.seed@teste.com', '5511999990005', 'active'),
  ('d0000001-a000-4000-b000-000000000006', 'c543a569-e034-4024-9ba9-711e7291dcae', 'passenger', 'Lucia Cliente', 'lucia.seed@teste.com', '5511999990006', 'active'),
  ('d0000001-a000-4000-b000-000000000007', 'c543a569-e034-4024-9ba9-711e7291dcae', 'passenger', 'Marcos VIP', 'marcos.seed@teste.com', '5511999990007', 'active'),
  ('d0000001-a000-4000-b000-000000000008', 'c543a569-e034-4024-9ba9-711e7291dcae', 'passenger', 'Fernanda Regular', 'fernanda.seed@teste.com', '5511999990008', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.drivers (id, tenant_id, slug, bio, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, is_verified, is_online, cashback_pct) VALUES
  ('d0000001-a000-4000-b000-000000000001', 'c543a569-e034-4024-9ba9-711e7291dcae', 'carlos-silva', 'Motorista experiente, 5 anos de estrada.', 'Toyota Corolla', 2022, 'Preto', 'ABC1D23', true, true, 3),
  ('d0000001-a000-4000-b000-000000000002', 'c543a569-e034-4024-9ba9-711e7291dcae', 'ana-souza', 'Dirigindo com seguranca desde 2019.', 'Honda Civic', 2023, 'Branco', 'XYZ4E56', true, true, 5),
  ('d0000001-a000-4000-b000-000000000003', 'c543a569-e034-4024-9ba9-711e7291dcae', 'pedro-lima', 'Novo na plataforma.', 'VW Polo', 2021, 'Prata', 'QWE7F89', true, false, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.affiliates (id, tenant_id, slug, business_name, business_type, is_approved, referral_code) VALUES
  ('d0000001-a000-4000-b000-000000000004', 'c543a569-e034-4024-9ba9-711e7291dcae', 'posto-shell-centro', 'Posto Shell Centro', 'posto', true, 'SHELL2024')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.passengers (id, tenant_id, total_rides, total_spent, cashback_balance, origin_source, last_ride_at, first_ride_at) VALUES
  ('d0000001-a000-4000-b000-000000000005', 'c543a569-e034-4024-9ba9-711e7291dcae', 15, 450.00, 13.50, 'driver_link', now() - interval '1 hour', now() - interval '30 days'),
  ('d0000001-a000-4000-b000-000000000006', 'c543a569-e034-4024-9ba9-711e7291dcae', 5, 120.00, 3.60, 'affiliate_link', now() - interval '3 days', now() - interval '20 days'),
  ('d0000001-a000-4000-b000-000000000007', 'c543a569-e034-4024-9ba9-711e7291dcae', 25, 780.00, 23.40, 'group_link', now() - interval '2 hours', now() - interval '60 days'),
  ('d0000001-a000-4000-b000-000000000008', 'c543a569-e034-4024-9ba9-711e7291dcae', 2, 45.00, 1.35, 'driver_link', now() - interval '45 days', now() - interval '50 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.ride_requests (id, tenant_id, passenger_id, origin_address, dest_address, origin_lat, origin_lng, dest_lat, dest_lng, distance_km, estimated_min, suggested_price, final_price, status, origin_type, origin_driver_id, created_at) VALUES
  ('e0000001-a000-4000-b000-000000000001', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000005', 'Rua das Flores, 123', 'Shopping Center Norte', -23.5505, -46.6333, -23.5100, -46.6200, 8.5, 22, 28.50, 30.00, 'completed', 'driver_link', 'd0000001-a000-4000-b000-000000000001', now() - interval '3 hours'),
  ('e0000001-a000-4000-b000-000000000002', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000006', 'Av. Paulista, 1000', 'Aeroporto Congonhas', -23.5613, -46.6562, -23.6261, -46.6564, 12.3, 35, 42.00, 45.00, 'completed', 'affiliate_link', null, now() - interval '2 hours'),
  ('e0000001-a000-4000-b000-000000000003', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000007', 'Terminal Rodoviario', 'Hotel Ibis Centro', -23.5200, -46.6350, -23.5450, -46.6400, 5.2, 15, 18.00, 20.00, 'completed', 'group_link', null, now() - interval '1 hour'),
  ('e0000001-a000-4000-b000-000000000004', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000005', 'Shopping Center Norte', 'Rua das Flores, 123', -23.5100, -46.6200, -23.5505, -46.6333, 8.5, 20, 28.50, 28.50, 'completed', 'driver_link', 'd0000001-a000-4000-b000-000000000002', now() - interval '30 minutes'),
  ('e0000001-a000-4000-b000-000000000005', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000007', 'Parque Ibirapuera', 'Moema', -23.5875, -46.6576, -23.6000, -46.6650, 3.1, 10, 12.00, 15.00, 'in_progress', 'driver_link', 'd0000001-a000-4000-b000-000000000001', now() - interval '10 minutes'),
  ('e0000001-a000-4000-b000-000000000006', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000006', 'Centro Historico', 'Vila Madalena', -23.5500, -46.6350, -23.5530, -46.6900, 6.0, 18, 22.00, 25.00, 'completed', 'driver_link', 'd0000001-a000-4000-b000-000000000001', now() - interval '1 day'),
  ('e0000001-a000-4000-b000-000000000007', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000005', 'Estacao Luz', 'Barra Funda', -23.5350, -46.6350, -23.5250, -46.6650, 4.0, 12, 15.00, 18.00, 'completed', 'driver_link', 'd0000001-a000-4000-b000-000000000003', now() - interval '1 day 2 hours'),
  ('e0000001-a000-4000-b000-000000000008', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000007', 'Pinheiros', 'Consolacao', -23.5670, -46.6920, -23.5530, -46.6600, 4.5, 14, 16.00, 16.00, 'cancelled', 'group_link', null, now() - interval '1 day 5 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.rides (id, tenant_id, passenger_id, driver_id, ride_request_id, price_paid, is_transbordo, cashback_amount, started_at, completed_at, created_at, origin_driver_id) VALUES
  ('f0000001-a000-4000-b000-000000000001', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000005', 'd0000001-a000-4000-b000-000000000001', 'e0000001-a000-4000-b000-000000000001', 30.00, false, 0.90, now() - interval '3 hours', now() - interval '2 hours 38 minutes', now() - interval '3 hours', 'd0000001-a000-4000-b000-000000000001'),
  ('f0000001-a000-4000-b000-000000000002', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000006', 'd0000001-a000-4000-b000-000000000002', 'e0000001-a000-4000-b000-000000000002', 45.00, false, 2.25, now() - interval '2 hours', now() - interval '1 hour 25 minutes', now() - interval '2 hours', null),
  ('f0000001-a000-4000-b000-000000000003', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000007', 'd0000001-a000-4000-b000-000000000001', 'e0000001-a000-4000-b000-000000000003', 20.00, false, 0.60, now() - interval '1 hour', now() - interval '45 minutes', now() - interval '1 hour', null),
  ('f0000001-a000-4000-b000-000000000004', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000005', 'd0000001-a000-4000-b000-000000000002', 'e0000001-a000-4000-b000-000000000004', 28.50, true, 0.85, now() - interval '30 minutes', now() - interval '10 minutes', now() - interval '30 minutes', 'd0000001-a000-4000-b000-000000000002'),
  ('f0000001-a000-4000-b000-000000000005', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000006', 'd0000001-a000-4000-b000-000000000001', 'e0000001-a000-4000-b000-000000000006', 25.00, false, 0.75, now() - interval '1 day', now() - interval '23 hours 42 minutes', now() - interval '1 day', 'd0000001-a000-4000-b000-000000000001'),
  ('f0000001-a000-4000-b000-000000000006', 'c543a569-e034-4024-9ba9-711e7291dcae', 'd0000001-a000-4000-b000-000000000005', 'd0000001-a000-4000-b000-000000000003', 'e0000001-a000-4000-b000-000000000007', 18.00, true, 0.54, now() - interval '1 day 2 hours', now() - interval '1 day 1 hour 48 minutes', now() - interval '1 day 2 hours', 'd0000001-a000-4000-b000-000000000003')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wallets (id, tenant_id, owner_type, owner_id, balance, total_earned, total_withdrawn) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-000000000001', 'c543a569-e034-4024-9ba9-711e7291dcae', 'group', 'c543a569-e034-4024-9ba9-711e7291dcae', 85.50, 166.50, 81.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wallet_transactions (id, tenant_id, wallet_id, type, amount, balance_after, description, created_at) VALUES
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', 'ride_earning', 30.00, 30.00, 'Corrida #1 - Carlos Silva', now() - interval '3 hours'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', 'ride_earning', 45.00, 75.00, 'Corrida #2 - Ana Souza', now() - interval '2 hours'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', 'ride_earning', 20.00, 95.00, 'Corrida #3 - Carlos Silva', now() - interval '1 hour'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', 'commission_transbordo', -2.85, 92.15, 'Comissao transbordo - Corrida #4', now() - interval '30 minutes'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', 'ride_earning', 28.50, 120.65, 'Corrida #4 - Ana Souza (transbordo)', now() - interval '30 minutes'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', 'withdrawal', -35.00, 85.65, 'Saque PIX', now() - interval '5 hours'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', 'ride_earning', 25.00, 110.65, 'Corrida #5 - Carlos Silva (ontem)', now() - interval '1 day'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001', 'commission_transbordo', -1.80, 108.85, 'Comissao transbordo - Corrida #6', now() - interval '1 day 2 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.commissions (id, tenant_id, ride_id, commission_type, amount, status, to_wallet_id) VALUES
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'f0000001-a000-4000-b000-000000000004', 'transbordo', 2.85, 'processed', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'f0000001-a000-4000-b000-000000000006', 'transbordo', 1.80, 'processed', 'a1b2c3d4-e5f6-4a7b-8c9d-000000000001'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'f0000001-a000-4000-b000-000000000002', 'affiliate', 2.25, 'processed', null)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reviews (id, tenant_id, ride_id, driver_id, passenger_id, rating, comment) VALUES
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'f0000001-a000-4000-b000-000000000001', 'd0000001-a000-4000-b000-000000000001', 'd0000001-a000-4000-b000-000000000005', 5, 'Excelente motorista!'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'f0000001-a000-4000-b000-000000000002', 'd0000001-a000-4000-b000-000000000002', 'd0000001-a000-4000-b000-000000000006', 4, 'Muito bom, carro limpo'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'f0000001-a000-4000-b000-000000000003', 'd0000001-a000-4000-b000-000000000001', 'd0000001-a000-4000-b000-000000000007', 5, 'Top demais'),
  (gen_random_uuid(), 'c543a569-e034-4024-9ba9-711e7291dcae', 'f0000001-a000-4000-b000-000000000005', 'd0000001-a000-4000-b000-000000000001', 'd0000001-a000-4000-b000-000000000006', 4, null)
ON CONFLICT (id) DO NOTHING;

SET session_replication_role = 'origin';
