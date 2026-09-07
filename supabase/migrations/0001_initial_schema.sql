-- El Bosque Hamburguesería — esquema inicial V1.0

create extension if not exists pgcrypto;

-- ── Enums ──────────────────────────────────────────────────────────────────

create type public.tipo_entrega_enum as enum ('domicilio', 'recoger');
create type public.metodo_pago_enum as enum ('efectivo', 'transferencia');
create type public.estado_pedido_enum as enum (
  'pendiente', 'confirmado', 'preparando', 'en_ruta', 'listo_para_recoger', 'entregado', 'cancelado'
);
create type public.estado_pago_enum as enum ('pendiente', 'por_verificar', 'confirmado', 'rechazado');
create type public.rol_admin as enum ('admin');

-- ── Funciones auxiliares ─────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generar_codigo_seguimiento()
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- sin 0/O/1/I/L para evitar ambigüedad
  bytes bytea := gen_random_bytes(8);
  codigo text := '';
  i int;
  idx int;
begin
  for i in 0..7 loop
    idx := get_byte(bytes, i) % length(alphabet) + 1;
    codigo := codigo || substr(alphabet, idx, 1);
  end loop;
  return 'EB-' || codigo;
end;
$$;

-- ── Tablas ─────────────────────────────────────────────────────────────────

create table public.categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.productos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  nombre text not null,
  descripcion text,
  precio integer not null check (precio >= 0),
  imagen_url text,
  disponible boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index productos_categoria_id_idx on public.productos (categoria_id);
create index productos_disponible_idx on public.productos (disponible);

create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  rol public.rol_admin not null default 'admin',
  created_at timestamptz not null default now()
);

create table public.configuracion_restaurante (
  id smallint primary key default 1 check (id = 1),
  nombre_restaurante text not null default 'El Bosque Hamburguesería',
  direccion text,
  telefono text,
  horario_atencion jsonb not null default '{}'::jsonb,
  costo_domicilio_default integer not null default 0 check (costo_domicilio_default >= 0),
  banco_nombre text,
  banco_tipo_cuenta text,
  banco_numero_cuenta text,
  banco_titular text,
  banco_documento text,
  qr_transferencia_url text,
  updated_at timestamptz not null default now()
);
insert into public.configuracion_restaurante (id) values (1);

create table public.pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo_seguimiento text not null unique default public.generar_codigo_seguimiento(),
  cliente_nombre text not null,
  cliente_telefono text not null,
  cliente_direccion text,
  cliente_barrio text,
  cliente_referencia text,
  cliente_notas text,
  tipo_entrega public.tipo_entrega_enum not null,
  metodo_pago public.metodo_pago_enum not null,
  estado_pedido public.estado_pedido_enum not null default 'pendiente',
  estado_pago public.estado_pago_enum not null,
  pago_reportado_cliente_at timestamptz,
  subtotal integer not null check (subtotal >= 0),
  costo_domicilio integer not null default 0 check (costo_domicilio >= 0),
  total integer not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint direccion_requerida_domicilio check (
    tipo_entrega <> 'domicilio' or cliente_direccion is not null
  )
);
create index pedidos_estado_pedido_idx on public.pedidos (estado_pedido);
create index pedidos_created_at_idx on public.pedidos (created_at);

create table public.detalle_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete set null,
  producto_nombre text not null,
  producto_precio integer not null check (producto_precio >= 0),
  cantidad integer not null check (cantidad > 0),
  subtotal_linea integer not null check (subtotal_linea >= 0)
);
create index detalle_pedido_pedido_id_idx on public.detalle_pedido (pedido_id);

create table public.historial_estado_pedido (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  estado_anterior public.estado_pedido_enum,
  estado_nuevo public.estado_pedido_enum not null,
  cambiado_por uuid references public.admin_users(id),
  nota text,
  created_at timestamptz not null default now()
);
create index historial_estado_pedido_pedido_id_idx on public.historial_estado_pedido (pedido_id);

-- ── Triggers de updated_at ───────────────────────────────────────────────

create trigger set_updated_at before update on public.categorias
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.productos
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.pedidos
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.configuracion_restaurante
  for each row execute function public.set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────
-- La capa de API (Next.js, con service-role key) es la que realmente aplica
-- las reglas de negocio. RLS aquí es defensa en profundidad: solo se expone
-- lectura pública del menú activo/disponible; todo lo demás queda denegado
-- por defecto para los roles anon/authenticated (solo service_role, que
-- ignora RLS, puede leer/escribir el resto).

alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.admin_users enable row level security;
alter table public.configuracion_restaurante enable row level security;
alter table public.pedidos enable row level security;
alter table public.detalle_pedido enable row level security;
alter table public.historial_estado_pedido enable row level security;

create policy "categorias publicas activas" on public.categorias
  for select using (activo = true);

create policy "productos publicos disponibles" on public.productos
  for select using (disponible = true);

-- ── Storage buckets ──────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('configuracion', 'configuracion', true)
on conflict (id) do nothing;

create policy "lectura publica bucket productos" on storage.objects
  for select using (bucket_id = 'productos');

create policy "lectura publica bucket configuracion" on storage.objects
  for select using (bucket_id = 'configuracion');
