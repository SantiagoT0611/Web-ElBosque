-- Permite al admin reemplazar la foto panorámica del hero (hoy un
-- placeholder de texto fijo en app/(public)/page.tsx) desde el panel,
-- mismo patrón que qr_transferencia_url: nullable, bucket "configuracion".
alter table public.configuracion_restaurante
  add column foto_panoramica_url text;
