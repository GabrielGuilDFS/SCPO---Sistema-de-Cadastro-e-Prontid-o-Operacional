import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PolicialForm } from "@/components/policial/PolicialForm"
import prisma from "@/lib/prisma"

interface CadastroPolicialPageProps {
  searchParams: Promise<{ id?: string }>
}

export default async function CadastroPolicialPage({ searchParams }: CadastroPolicialPageProps) {
  const session = await getServerSession(authOptions)
  const { id } = await searchParams

  const [subunidades, funcoes] = await Promise.all([
    prisma.subunidade.findMany({ orderBy: { nome: 'asc' } }),
    prisma.funcaoAtual.findMany({ orderBy: { funcao: 'asc' } })
  ])

  // Se houver ID na URL, buscar policial para modo de edição
  let initialData = undefined
  if (id) {
    const policialId = parseInt(id)
    if (!isNaN(policialId)) {
      const policial = await prisma.policial.findUnique({
        where: { id: policialId },
        include: {
          subunidade: true,
          funcaoAtual: true,
          endereco: true,
          login: true,
          dependentes: true,
        }
      })
      if (policial) {
        initialData = policial
      }
    }
  }

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      {/* Renderiza o componente de formulário */}
      <PolicialForm
        subunidades={subunidades}
        funcoes={funcoes}
        userRole={session?.user?.perfil}
        initialData={initialData}
      />
    </div>
  )
}
