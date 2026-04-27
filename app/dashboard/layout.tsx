import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar"
import { SidebarProvider } from "@/components/dashboard/SidebarProvider"
import { LayoutWrapper } from "@/components/dashboard/LayoutWrapper"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const nomeUsuario = session.user?.name || "Usuário"
  const userProfile = session.user?.perfil

  return (
    <SidebarProvider>
      {/* Sidebar Única que se adapta aos breakpoints */}
      <DashboardSidebar userProfile={userProfile} nomeUsuario={nomeUsuario} />

      {/* Wrapper que gerencia o padding e o overlay mobile */}
      <LayoutWrapper userProfile={userProfile}>
        {children}
      </LayoutWrapper>
    </SidebarProvider>
  )
}
