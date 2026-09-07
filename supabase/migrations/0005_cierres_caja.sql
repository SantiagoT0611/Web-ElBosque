-- Cierre de caja diario: registro histórico de los totales del día para
-- control del dueño. No borra ni oculta pedidos — son solo un snapshot.
create table public.cierres_caja (
  id uuid primary key default gen_random_uuid(),
  fecha date not null unique,
  total_pedidos integer not null default 0,
  total_ventas integer not null default 0,
  total_efectivo integer not null default 0,
  total_transferencia integer not null default 0,
  cantidad_efectivo integer not null default 0,
  cantidad_transferencia integer not null default 0,
  cerrado_por uuid references public.admin_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cierres_caja_fecha_idx on public.cierres_caja (fecha desc);

create trigger set_updated_at before update on public.cierres_caja
  for each row execute function public.set_updated_at();

alter table public.cierres_caja enable row level security;
-- Sin políticas públicas a propósito: solo accesible vía service_role
-- desde los Route Handlers de /api/admin/**, igual que el resto de tablas
-- administrativas.
