import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { KPIBoard } from "@/components/dashboard/KPIBoard"
import { QuickAccess } from "@/components/dashboard/QuickAccess"
import { PoliceGrid } from "@/components/dashboard/PoliceGrid"
import { LogoutButton } from "@/components/dashboard/LogoutButton"
import prisma from "@/lib/prisma"

export default async function DashboardHome() {
  const session = await getServerSession(authOptions)
  const nomeUsuario = session?.user?.name || "Comandante"

  // Busca dados reais do banco
  const efetivoTotal = await prisma.policial.count()

  if (efetivoTotal === 0) {
    return (
      <div className="min-h-screen bg-[#ffffff]">
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
        <main className="max-w-7xl mx-auto bg-[#7f6e59] min-h-[calc(100vh-73px)] p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">Zero policiais encontrados no banco de dados.</h2>
            <p className="text-[#cca471] text-lg">Por favor, rode o script de seed ou cadastre novos policiais.</p>
          </div>
        </main>
      </div>
    )
  }

  const emProntidao = await prisma.policial.count({ where: { status: 'pronto' } })
  const afastados = await prisma.policial.count({ where: { status: { not: 'pronto' } } }) // Ou especifique os status de afastamento se precisar

  const distribuicaoBruta = await prisma.policial.groupBy({
    by: ['subunidadeId'],
    _count: { id: true }
  })

  const subunidades = await prisma.subunidade.findMany()
  const cores = ['#97836a', '#544634', '#cbd5e1', '#000000', '#f59e0b']

  const distribuicaoData = distribuicaoBruta.map((item, index) => {
    const subunidade = subunidades.find(sub => sub.id === item.subunidadeId)
    return {
      name: subunidade?.nome ?? 'Sem Cia',
      value: item._count.id,
      color: cores[index % cores.length]
    }
  })

  // Últimos 10 militares cadastrados
  const ultimosMilitares = await prisma.policial.findMany({
    orderBy: { id: 'desc' },
    take: 10,
    include: { subunidade: true }
  })

  const policiaisProps = ultimosMilitares.map(p => ({
    id: p.id,
    nomeGuerra: p.nomeGuerra ?? p.nomeCompleto,
    matricula: p.matricula,
    companhia: p.subunidade?.nome ?? 'Sem Cia',
    status: p.status ?? 'pronto',
    idade: p.idade ?? 0
  }))

  return (
    <div className="min-h-screen bg-[#7f6e59]">
      {/* Header */}
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

      <main className="max-w-7xl mx-auto  min-h-[calc(100vh-73px)] p-4 md:p-6 lg:p-8 space-y-8">
        <section>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Bom dia, <span className="text-[#cca471]">{nomeUsuario}</span>
          </h2>
          <p className="text-[#b1a99f] mt-1">Bem-vindo(a) ao painel de Prontidão Operacional.</p>
        </section>

        <section>
          <KPIBoard
            efetivoTotal={efetivoTotal}
            efetivoProntidao={emProntidao}
            efetivoAfastamento={afastados}
            dataDistribuicao={distribuicaoData}
          />
        </section>

        <section className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <div className="order-2 lg:order-1">
            <PoliceGrid policiais={policiaisProps} />
          </div>
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <QuickAccess />
          </div>
        </section>
      </main>
    </div>
  )
}
