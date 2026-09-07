-- Correo electrónico opcional del cliente en el checkout (sección 8 del brief).
alter table public.pedidos add column cliente_email text;
