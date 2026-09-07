import { requireAdminSession } from "@/lib/auth/dal"
import { AdminSidebar } from "@/components/admin/admin-sidebar"

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar nombre={session.perfil.nombre} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  )
}
