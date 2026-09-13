-- La foto única del hero (0012) se reemplaza por un arreglo de hasta 4,
-- para el carrusel del inicio. Todavía no había ninguna en producción
-- (columna agregada la migración pasada, sin usar aún), así que se
-- reemplaza directo en vez de mantener las dos columnas en paralelo.
alter table public.configuracion_restaurante
  drop column foto_panoramica_url;

alter table public.configuracion_restaurante
  add column fotos_panoramicas text[] not null default '{}',
  add constraint fotos_panoramicas_max_4
    check (array_length(fotos_panoramicas, 1) is null or array_length(fotos_panoramicas, 1) <= 4);
