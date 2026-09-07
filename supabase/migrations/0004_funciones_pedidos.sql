-- Funciones que agrupan escrituras multi-tabla en una sola transacción.
-- La validación de reglas de negocio (transición de estado permitida,
-- bloqueo de "confirmar" en transferencia sin pago verificado, etc.) vive
-- en TypeScript (lib/orders/state-machine.ts) para no duplicar esa lógica
-- en dos lenguajes; estas funciones solo garantizan que la escritura en
-- pedidos + detalle_pedido / historial_estado_pedido sea atómica.
-- Ambas se restringen a service_role: todo el acceso pasa por los Route
-- Handlers de Next.js, nunca por PostgREST directo desde el cliente.

create or replace function public.crear_pedido(payload jsonb)
returns public.pedidos
language plpgsql
as $$
declare
  nuevo_pedido public.pedidos;
  item jsonb;
  producto_row public.productos;
  v_subtotal integer := 0;
  v_costo_domicilio integer := 0;
  v_tipo_entrega public.tipo_entrega_enum := (payload->>'tipo_entrega')::public.tipo_entrega_enum;
  v_metodo_pago public.metodo_pago_enum := (payload->>'metodo_pago')::public.metodo_pago_enum;
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
    select costo_domicilio_default into v_costo_domicilio
      from public.configuracion_restaurante where id = 1;
  end if;

  v_estado_pago := case when v_metodo_pago = 'transferencia' then 'por_verificar' else 'pendiente' end;

  insert into public.pedidos (
    cliente_nombre, cliente_telefono, cliente_email, cliente_direccion, cliente_barrio,
    cliente_referencia, cliente_notas, tipo_entrega, metodo_pago, estado_pago,
    subtotal, costo_domicilio, total
  ) values (
    payload->>'cliente_nombre', payload->>'cliente_telefono', nullif(payload->>'cliente_email', ''),
    nullif(payload->>'cliente_direccion', ''), nullif(payload->>'cliente_barrio', ''),
    nullif(payload->>'cliente_referencia', ''), nullif(payload->>'cliente_notas', ''),
    v_tipo_entrega, v_metodo_pago, v_estado_pago,
    v_subtotal, v_costo_domicilio, v_subtotal + v_costo_domicilio
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

revoke execute on function public.crear_pedido(jsonb) from public;
grant execute on function public.crear_pedido(jsonb) to service_role;

create or replace function public.aplicar_cambio_estado_pedido(
  p_pedido_id uuid,
  p_estado_nuevo public.estado_pedido_enum,
  p_estado_pago_nuevo public.estado_pago_enum,
  p_admin_id uuid,
  p_nota text default null
)
returns public.pedidos
language plpgsql
as $$
declare
  v_estado_anterior public.estado_pedido_enum;
  v_pedido public.pedidos;
begin
  select estado_pedido into v_estado_anterior from public.pedidos where id = p_pedido_id for update;
  if not found then
    raise exception 'Pedido no encontrado.';
  end if;

  update public.pedidos
    set estado_pedido = p_estado_nuevo, estado_pago = p_estado_pago_nuevo
    where id = p_pedido_id
    returning * into v_pedido;

  insert into public.historial_estado_pedido (pedido_id, estado_anterior, estado_nuevo, cambiado_por, nota)
  values (p_pedido_id, v_estado_anterior, p_estado_nuevo, p_admin_id, nullif(p_nota, ''));

  return v_pedido;
end;
$$;

revoke execute on function public.aplicar_cambio_estado_pedido(
  uuid, public.estado_pedido_enum, public.estado_pago_enum, uuid, text
) from public;
grant execute on function public.aplicar_cambio_estado_pedido(
  uuid, public.estado_pedido_enum, public.estado_pago_enum, uuid, text
) to service_role;
