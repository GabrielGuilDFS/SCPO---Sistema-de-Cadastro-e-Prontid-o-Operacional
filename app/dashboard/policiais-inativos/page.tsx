import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LogoutButton } from "@/components/dashboard/LogoutButton"
import { PoliceGrid } from "@/components/dashboard/PoliceGrid"
import Link from "next/link"
import { ArrowLeft, Search, UserX, Info } from "lucide-react"
import prisma from "@/lib/prisma"
import { Input } from "@/components/ui/input"
import { redirect } from "next/navigation"
import { InactiveSearch } from "@/components/dashboard/InactiveSearch"
import { Suspense } from "react"

interface InativosPageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function PoliciaisInativosPage({ searchParams }: InativosPageProps) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/")

  const { search } = await searchParams
  const query = search || ""
  
  // Filtro base para inativos
  const baseInativoFilter = {
    OR: [
      { status: 'INATIVO' },
      { login: { statusAtivo: false } }
    ]
  }

  let finalWhere: any = baseInativoFilter

  if (query) {
    const cleanCpf = query.replace(/\D/g, "")
    finalWhere = {
      AND: [
        baseInativoFilter,
        {
          OR: [
            { nomeCompleto: { contains: query, mode: 'insensitive' } },
            { nomeGuerra: { contains: query, mode: 'insensitive' } },
            { matricula: { contains: query, mode: 'insensitive' } },
            { rg: { contains: query, mode: 'insensitive' } },
            { subunidade: { nome: { contains: query, mode: 'insensitive' } } },
            { funcaoAtual: { nome: { contains: query, mode: 'insensitive' } } },
            ...(cleanCpf ? [{ cpf: { contains: cleanCpf } }] : [])
          ]
        }
      ]
    }
  } else {
    // Filtro de 30 dias se não houver busca
    const trintaDiasAtras = new Date()
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30)
    
    finalWhere = {
      AND: [
        baseInativoFilter,
        { atualizadoEm: { gte: trintaDiasAtras } }
      ]
    }
  }

  const inativosBrutos = await prisma.policial.findMany({
    where: finalWhere,
    orderBy: { atualizadoEm: 'desc' },
    include: {
      subunidade: true,
      funcaoAtual: true,
      endereco: true,
      login: true
    }
  })

  const [subunidades, funcoes] = await Promise.all([
    prisma.subunidade.findMany({ orderBy: { nome: 'asc' } }),
    prisma.funcaoAtual.findMany({ orderBy: { funcao: 'asc' } })
  ])

  const calcularIdade = (data: Date | null): number => {
    if (!data) return 0
    const hoje = new Date()
    let idade = hoje.getFullYear() - data.getFullYear()
    const m = hoje.getMonth() - data.getMonth()
    if (m < 0 || (m === 0 && hoje.getDate() < data.getDate())) idade--
    return idade
  }

  const inativos = inativosBrutos.map(p => ({
    ...p,
    idade: calcularIdade(p.dataNascimento as Date | null),
  }))

  return (
    <div className="min-h-screen bg-[#7f6e59]">
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

      <main className="max-w-7xl mx-auto min-h-[calc(100vh-73px)] p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard" className="text-[#cca471] hover:text-white flex items-center gap-2 transition-colors w-fit font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <UserX className="h-8 w-8 text-[#cca471]" />
                Gestão de Agentes Inativos
              </h2>
              <p className="text-[#b1a99f] mt-1">Consulte baixas e realize a reativação de militares no sistema.</p>
            </div>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl space-y-4">
          <Suspense fallback={<div className="h-12 bg-white/5 animate-pulse rounded-md" />}>
            <InactiveSearch />
          </Suspense>
          
          <div className="flex items-center gap-2 text-[#cca471] bg-[#3c342a]/50 w-fit px-4 py-2 rounded-lg border border-[#cca471]/20">
            <Info className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              {query ? `Exibindo resultados para "${query}"` : 'Exibindo baixas dos últimos 30 dias. Use a busca para registros antigos.'}
            </span>
          </div>
        </div>

        {/* Grid de Resultados */}
        <section className="bg-white/5 rounded-2xl p-1">
          {inativos.length > 0 ? (
            <PoliceGrid 
              policiais={inativos as any[]} 
              subunidades={subunidades}
              funcoes={funcoes}
              highlight={!!query}
            />
          ) : (
            <div className="py-20 text-center space-y-4 bg-[#3c342a]/30 rounded-xl border-2 border-dashed border-white/10">
              <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <UserX className="h-8 w-8 text-white/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">Nenhum inativo encontrado</h3>
                <p className="text-slate-400 max-w-xs mx-auto">
                  {query 
                    ? "Não encontramos nenhum registro com esses termos no histórico de inativos." 
                    : "Não houve baixas registradas nos últimos 30 dias."}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
