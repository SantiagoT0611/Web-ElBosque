-- Habilita Supabase Realtime para el panel admin. La escritura sigue
-- pasando exclusivamente por Route Handlers con service-role (sin cambios
-- ahí) — esto solo abre LECTURA en tiempo real para admins ya autenticados,
-- vía el cliente del navegador (publishable key + sesión de Supabase Auth).
--
-- admin_users necesita su propia política porque la política de pedidos de
-- abajo depende de una subconsulta a admin_users, que también corre bajo RLS.

create policy "admin lee su propia fila" on public.admin_users
  for select using (id = auth.uid());

create policy "admins leen pedidos en tiempo real" on public.pedidos
  for select using (exists (select 1 from public.admin_users where id = auth.uid()));

create policy "admins leen historial en tiempo real" on public.historial_estado_pedido
  for select using (exists (select 1 from public.admin_users where id = auth.uid()));

alter publication supabase_realtime add table public.pedidos, public.historial_estado_pedido;
