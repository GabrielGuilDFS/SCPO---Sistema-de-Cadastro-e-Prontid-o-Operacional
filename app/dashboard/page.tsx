import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { KPIBoard } from "@/components/dashboard/KPIBoard"
import { QuickAccess } from "@/components/dashboard/QuickAccess"
import { PoliceGrid } from "@/components/dashboard/PoliceGrid"
import { LogoutButton } from "@/components/dashboard/LogoutButton"
import prisma from "@/lib/prisma"
import { getPeculioResumoMes } from "@/lib/data/peculio-dashboard"

export default async function DashboardHome() {
  const session = await getServerSession(authOptions)
  const nomeUsuario = session?.user?.name || "Comandante"

  const hoje = new Date()
  const mesAtual = hoje.getMonth() + 1
  const anoAtual = hoje.getFullYear()
  const dataMesAtual = new Date(anoAtual, mesAtual - 1, 1)

  const activeFilter = {
    AND: [
      { status: { not: 'INATIVO' } },
      { OR: [ { login: null }, { login: { statusAtivo: true } } ] }
    ]
  }

  const efetivoTotal = await prisma.policial.count({ where: activeFilter })

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

  const [subunidades, funcoes, peculioResumo] = await Promise.all([
    prisma.subunidade.findMany({ orderBy: { nome: 'asc' } }),
    prisma.funcaoAtual.findMany({ orderBy: { funcao: 'asc' } }),
    getPeculioResumoMes(mesAtual, anoAtual),
  ])

  // Últimos 10 militares cadastrados — inclui todas as relações para o modal + pecúlio do mês atual
  const ultimosMilitares = await prisma.policial.findMany({
    where: activeFilter,
    orderBy: { id: 'desc' },
    take: 10,
    include: {
      subunidade: true,
      funcaoAtual: true,
      endereco: true,
      login: true,
      peculios: {
        where: { dataMesAno: dataMesAtual },
        take: 1,
        include: {
          postoDeServico: true,
        },
      },
    }
  })

  const calcularIdade = (data: Date | null): number => {
    if (!data) return 0
    const hoje = new Date()
    let idade = hoje.getFullYear() - data.getFullYear()
    const m = hoje.getMonth() - data.getMonth()
    if (m < 0 || (m === 0 && hoje.getDate() < data.getDate())) idade--
    return idade
  }

  // Passa o objeto completo + campo calculado `idade` + posto do pecúlio atual
  const policiaisProps = ultimosMilitares.map(p => ({
    ...p,
    idade: calcularIdade(p.dataNascimento as Date | null),
    postoAtual: p.peculios?.[0]?.postoDeServico?.nome ?? null,
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
            totalProntos={peculioResumo.totalProntos}
            totalAfastados={peculioResumo.totalAfastados}
            totalLancamentos={peculioResumo.totalLancamentos}
            dataDistribuicao={peculioResumo.distribuicaoPorPosto}
          />
        </section>

        <section className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <div className="order-2 lg:order-1">
            <PoliceGrid 
              policiais={policiaisProps as any[]} 
              subunidades={subunidades}
              funcoes={funcoes}
            />
          </div>
          <div className="order-1 lg:order-2 lg:sticky lg:top-24">
            <QuickAccess userProfile={session?.user?.perfil} />
          </div>
        </section>
      </main>
    </div>
  )
}
