-- Links a redes sociales del restaurante, configurables desde el panel
-- admin. jsonb flexible (par nombre-valor) igual que horario_atencion,
-- para no necesitar una migración nueva si mañana se agrega otra red.

alter table public.configuracion_restaurante add column redes_sociales jsonb not null default '{}'::jsonb;
