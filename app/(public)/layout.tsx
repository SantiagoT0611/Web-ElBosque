import { CartHydration } from "@/components/providers/cart-hydration"
import { CartDrawer } from "@/components/public/cart-drawer"
import { SiteHeader } from "@/components/public/site-header"
import { getConfiguracion } from "@/lib/data/configuracion"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const telefono = await getConfiguracion()
    .then((config) => config.telefono)
    .catch(() => null)

  return (
    <>
      <CartHydration />
      <SiteHeader telefono={telefono} />
      <main className="flex-1">{children}</main>
      <CartDrawer />
    </>
  )
}
