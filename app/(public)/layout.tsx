import { CartHydration } from "@/components/providers/cart-hydration"
import { CartDrawer } from "@/components/public/cart-drawer"
import { SiteHeader } from "@/components/public/site-header"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CartHydration />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <CartDrawer />
    </>
  )
}
