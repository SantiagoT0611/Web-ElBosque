-- Origen del restaurante (para calcular distancia Haversine hasta el
-- cliente) y tramos de recargo por distancia. Nullable/vacío por defecto:
-- mientras el admin no los configure, el cálculo automático de domicilio
-- queda inactivo y todo sigue funcionando exactamente igual que hoy
-- (retrocompatibilidad, mismo principio ya aplicado a zonas_domicilio).
alter table public.configuracion_restaurante
  add column latitud double precision,
  add column longitud double precision,
  add column tramos_domicilio jsonb not null default '[]'::jsonb;
