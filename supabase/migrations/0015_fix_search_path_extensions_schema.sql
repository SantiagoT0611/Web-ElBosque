-- La migración anterior (0014) fijó search_path = public, pg_temp en
-- generar_codigo_seguimiento(), pero gen_random_bytes() vive en el schema
-- "extensions" de Supabase (no en public) — quedó rota. Se agrega
-- "extensions" al search_path de esa función puntual.
alter function public.generar_codigo_seguimiento() set search_path = public, extensions, pg_temp;
