-- Snapshot en el pedido: distancia calculada (camino automático) y las
-- coordenadas crudas que la originaron, para auditar/mostrar en el
-- detalle admin y la comanda. zona_domicilio (ya existente) se sigue
-- usando para cuando se usó el camino de respaldo manual.
alter table public.pedidos
  add column distancia_km numeric(6,2),
  add column cliente_lat double precision,
  add column cliente_lng double precision;

-- Redefine crear_pedido sobre el cuerpo vigente (0016_zonas_domicilio.sql).
-- Repite "set search_path" explícitamente: un CREATE OR REPLACE resetea lo
-- fijado antes con ALTER FUNCTION en 0014/0015 si no se repite aquí.
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
  v_tramos_domicilio jsonb;
  v_recargo_zona integer;
  v_recargo_distancia integer;
  v_origen_lat double precision;
  v_origen_lng double precision;
  v_cliente_lat double precision := nullif(payload->>'cliente_lat', '')::double precision;
  v_cliente_lng double precision := nullif(payload->>'cliente_lng', '')::double precision;
  v_distancia_km numeric;
  v_haversine_a double precision;
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
    select costo_domicilio_default, zonas_domicilio, tramos_domicilio, latitud, longitud
      into v_costo_domicilio, v_zonas_domicilio, v_tramos_domicilio, v_origen_lat, v_origen_lng
      from public.configuracion_restaurante where id = 1;

    -- Camino primario: distancia automática. Solo se activa si el
    -- restaurante tiene origen configurado, hay tramos definidos, Y el
    -- cliente mandó coordenadas crudas (nunca una distancia ya calculada).
    if v_origen_lat is not null and v_origen_lng is not null
       and jsonb_array_length(v_tramos_domicilio) > 0
       and v_cliente_lat is not null and v_cliente_lng is not null
    then
      v_haversine_a := sin(radians(v_cliente_lat - v_origen_lat) / 2) ^ 2
        + cos(radians(v_origen_lat)) * cos(radians(v_cliente_lat))
        * sin(radians(v_cliente_lng - v_origen_lng) / 2) ^ 2;
      v_distancia_km := 6371 * 2 * atan2(sqrt(v_haversine_a), sqrt(1 - v_haversine_a));

      select (elem->>'recargo')::integer into v_recargo_distancia
        from jsonb_array_elements(v_tramos_domicilio) as elem
        where (elem->>'hasta_km')::numeric >= v_distancia_km
        order by (elem->>'hasta_km')::numeric asc
        limit 1;

      -- Si la distancia supera todos los tramos, se cobra el más lejano.
      if v_recargo_distancia is null then
        select (elem->>'recargo')::integer into v_recargo_distancia
          from jsonb_array_elements(v_tramos_domicilio) as elem
          order by (elem->>'hasta_km')::numeric desc
          limit 1;
      end if;

      v_costo_domicilio := v_costo_domicilio + coalesce(v_recargo_distancia, 0);

    -- Camino de respaldo: zona manual (idéntico a 0016) — se usa cuando el
    -- cálculo automático no está disponible o el cliente no mandó lat/lng.
    elsif jsonb_array_length(v_zonas_domicilio) > 0 then
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
    -- Si ni tramos_domicilio ni zonas_domicilio tienen elementos, el
    -- domicilio cobra solo el valor por defecto (retrocompat total).
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
    subtotal, costo_domicilio, propina, total, efectivo_paga_con, zona_domicilio,
    distancia_km, cliente_lat, cliente_lng
  ) values (
    payload->>'cliente_nombre', payload->>'cliente_telefono', nullif(payload->>'cliente_email', ''),
    nullif(payload->>'cliente_direccion', ''), nullif(payload->>'cliente_barrio', ''),
    nullif(payload->>'cliente_referencia', ''), nullif(payload->>'cliente_notas', ''),
    v_tipo_entrega, v_metodo_pago, v_estado_pago,
    v_subtotal, v_costo_domicilio, v_propina, v_subtotal + v_costo_domicilio + v_propina, v_efectivo_paga_con,
    v_zona_domicilio, v_distancia_km, v_cliente_lat, v_cliente_lng
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
