-- Hallazgo del linter de seguridad de Supabase (function_search_path_mutable):
-- ninguna de las funciones fijaba su search_path. Las 4 son SECURITY INVOKER
-- y ya califican todo con "public.", así que el riesgo real era bajo, pero
-- fijar el search_path es la práctica recomendada y no cambia el comportamiento.
alter function public.set_updated_at() set search_path = public, pg_temp;
alter function public.generar_codigo_seguimiento() set search_path = public, pg_temp;
alter function public.aplicar_cambio_estado_pedido(uuid, estado_pedido_enum, estado_pago_enum, uuid, text)
  set search_path = public, pg_temp;
alter function public.crear_pedido(jsonb) set search_path = public, pg_temp;
