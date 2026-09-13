-- Reseñas de clientes sobre un pedido ya entregado (opcionalmente sobre un
-- producto puntual dentro de ese pedido). Quedan ocultas hasta que el admin
-- las aprueba. Elegibilidad para reseñar: haber recibido el pedido — se
-- valida con el codigo_seguimiento, mismo patrón anti-adivinanza que el
-- seguimiento del pedido, sin necesidad de cuenta/login.

create table public.resenas (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  cliente_nombre text not null,
  calificacion smallint not null check (calificacion between 1 and 5),
  comentario text not null,
  aprobado boolean not null default false,
  created_at timestamptz not null default now()
);

create index resenas_pedido_id_idx on public.resenas (pedido_id);

alter table public.resenas enable row level security;

create policy "resenas publicas aprobadas" on public.resenas
  for select using (aprobado = true);
