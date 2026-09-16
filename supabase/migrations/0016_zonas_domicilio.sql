-- Domicilio por zona: en vez de un costo_domicilio_default único, el admin
-- define zonas con su propio recargo (ej. "Zona 2 (3-8 km)" -> +2000). El
-- cliente elige su zona en el checkout; el recargo se suma sobre
-- costo_domicilio_default, siempre calculado y validado en el servidor.
alter table public.configuracion_restaurante
  add column zonas_domicilio jsonb not null default '[]'::jsonb;

-- Snapshot del nombre de la zona elegida al momento del pedido (igual que
-- producto_nombre se congela en detalle_pedido) — si el admin borra o
-- renombra una zona después, los pedidos ya hechos no cambian de significado.
alter table public.pedidos
  add column zona_domicilio text;

-- Redefine crear_pedido sobre el cuerpo vigente (0007_add_propina.sql),
-- agregando el recargo de zona. Repite "set search_path" explícitamente:
-- un CREATE OR REPLACE resetea lo que 0014/0015 habían fijado con ALTER
-- FUNCTION si no se repite aquí.
create or replace function public.crear_pedido(payload jsonb)
returns public.pedidos
language plpgsql
set search_path = public, extensions, pg_temp
as $$
declare
  nuevo_pedido public.pedidos;
  item jsonb;
  producto_row public.productos;
  v_subtotal integer := 0;
  v_costo_domicilio integer := 0;
  v_zonas_domicilio jsonb;
  v_recargo_zona integer;
  v_propina integer := 0;
  v_efectivo_paga_con integer := nullif(payload->>'efectivo_paga_con', '')::integer;
  v_tipo_entrega public.tipo_entrega_enum := (payload->>'tipo_entrega')::public.tipo_entrega_enum;
  v_metodo_pago public.metodo_pago_enum := (payload->>'metodo_pago')::public.metodo_pago_enum;
  v_zona_domicilio text := nullif(payload->>'zona_domicilio', '');
  v_estado_pago public.estado_pago_enum;
begin
  if jsonb_array_length(payload->'items') = 0 then
    raise exception 'El pedido no tiene productos.';
  end if;

  for item in select * from jsonb_array_elements(payload->'items')
  loop
    select * into producto_row from public.productos
      where id = (item->>'producto_id')::uuid and disponible = true;
    if not found then
      raise exception 'Producto no disponible: %', item->>'producto_id';
    end if;
    v_subtotal := v_subtotal + producto_row.precio * (item->>'cantidad')::integer;
  end loop;

  if v_tipo_entrega = 'domicilio' then
    select costo_domicilio_default, zonas_domicilio into v_costo_domicilio, v_zonas_domicilio
      from public.configuracion_restaurante where id = 1;

    -- Las zonas son opcionales: si el restaurante todavía no configuró
    -- ninguna, el domicilio se cobra igual que antes (solo el valor por
    -- defecto), sin exigirle al cliente una zona que no existe.
    if jsonb_array_length(v_zonas_domicilio) > 0 then
      if v_zona_domicilio is null then
        raise exception 'Debes indicar tu zona de domicilio.';
      end if;

      select (elem->>'recargo')::integer into v_recargo_zona
        from jsonb_array_elements(v_zonas_domicilio) as elem
        where elem->>'nombre' = v_zona_domicilio;

      if v_recargo_zona is null then
        raise exception 'Zona de domicilio no válida.';
      end if;

      v_costo_domicilio := v_costo_domicilio + v_recargo_zona;
    end if;
  end if;

  if (payload->>'quiere_propina')::boolean then
    v_propina := round(v_subtotal * 0.10);
  end if;

  if v_metodo_pago = 'efectivo' then
    if v_efectivo_paga_con is null then
      raise exception 'Debes indicar con qué billete vas a pagar en efectivo.';
    elsif v_efectivo_paga_con < v_subtotal + v_costo_domicilio + v_propina then
      raise exception 'El billete seleccionado no alcanza para cubrir el total del pedido.';
    end if;
  end if;

  v_estado_pago := case when v_metodo_pago = 'transferencia' then 'por_verificar' else 'pendiente' end;

  insert into public.pedidos (
    cliente_nombre, cliente_telefono, cliente_email, cliente_direccion, cliente_barrio,
    cliente_referencia, cliente_notas, tipo_entrega, metodo_pago, estado_pago,
    subtotal, costo_domicilio, propina, total, efectivo_paga_con, zona_domicilio
  ) values (
    payload->>'cliente_nombre', payload->>'cliente_telefono', nullif(payload->>'cliente_email', ''),
    nullif(payload->>'cliente_direccion', ''), nullif(payload->>'cliente_barrio', ''),
    nullif(payload->>'cliente_referencia', ''), nullif(payload->>'cliente_notas', ''),
    v_tipo_entrega, v_metodo_pago, v_estado_pago,
    v_subtotal, v_costo_domicilio, v_propina, v_subtotal + v_costo_domicilio + v_propina, v_efectivo_paga_con,
    v_zona_domicilio
  ) returning * into nuevo_pedido;

  for item in select * from jsonb_array_elements(payload->'items')
  loop
    select * into producto_row from public.productos where id = (item->>'producto_id')::uuid;
    insert into public.detalle_pedido (
      pedido_id, producto_id, producto_nombre, producto_precio, cantidad, subtotal_linea
    ) values (
      nuevo_pedido.id, producto_row.id, producto_row.nombre, producto_row.precio,
      (item->>'cantidad')::integer, producto_row.precio * (item->>'cantidad')::integer
    );
  end loop;

  insert into public.historial_estado_pedido (pedido_id, estado_anterior, estado_nuevo, cambiado_por, nota)
  values (nuevo_pedido.id, null, 'pendiente', null, 'Pedido creado por el cliente.');

  return nuevo_pedido;
end;
$$;
