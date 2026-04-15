import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { KPIBoard } from "@/components/dashboard/KPIBoard"
import { QuickAccess } from "@/components/dashboard/QuickAccess"
import { PoliceGrid } from "@/components/dashboard/PoliceGrid"
import { LogoutButton } from "@/components/dashboard/LogoutButton"

export default async function DashboardHome() {
  const session = await getServerSession(authOptions)

  // Como o usuário fez login com sucesso, ele terá um nome
  const nomeUsuario = session?.user?.name || "Comandante"

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Header Simples Temporário até haver um Layout Global */}
      <header className="bg-[#3c342a] border-b border-black/10 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/Logo-batal-removebg-preview.png" alt="SCPO Logo" className="h-8 object-contain" />
          <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">SCPO</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-white hidden sm:block">
            {session?.user?.perfil || "Operador"}
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto bg-[#7f6e59] min-h-[calc(100vh-73px)] p-4 md:p-6 lg:p-8 space-y-8 shadow-2xl">
        {/* Saudação */}
        <section>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Bom dia, <span className="text-[#cca471]">{nomeUsuario}</span>
          </h2>
          <p className="text-[#b1a99f] mt-1">Bem-vindo(a) ao painel de Prontidão Operacional.</p>
        </section>

        {/* Linha 1: KPIs */}
        <section>
          <KPIBoard />
        </section>

        {/* Linha 2: Grade Principal e Sidebar */}
        <section className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          {/* Grade de Militares - Ocupa o maior espaço */}
          <div className="order-2 lg:order-1">
            <PoliceGrid />
          </div>

          {/* Acesso Rápido - Fica como uma Sidebar lateral na direita no Desktop */}
          <div className="order-1 lg:order-2 sticky top-24">
            <QuickAccess />
          </div>
        </section>
      </main>
    </div>
  )
}
