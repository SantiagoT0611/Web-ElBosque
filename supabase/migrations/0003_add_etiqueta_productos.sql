-- Etiqueta visual opcional para una tarjeta de producto (p. ej. "MÁS PEDIDA",
-- "VEGETARIANA"). Puramente presentacional, no implica lógica de destacados/V2.
alter table public.productos add column etiqueta text;
