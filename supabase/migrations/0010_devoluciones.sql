-- Registro de devoluciones completas de pedidos ya entregados. Solo se
-- soporta devolución total (no parcial) — un pedido se devuelve una sola
-- vez. Sin políticas públicas: mismo patrón deny-all que pedidos/cierres_caja,
-- solo accesible vía service_role desde los Route Handlers de admin.

create table public.devoluciones (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null unique references public.pedidos(id),
  motivo text not null,
  registrado_por uuid references public.admin_users(id),
  created_at timestamptz not null default now()
);

alter table public.devoluciones enable row level security;
