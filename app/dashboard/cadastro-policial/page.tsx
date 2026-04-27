import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PolicialForm } from "@/components/policial/PolicialForm"
import prisma from "@/lib/prisma"

export default async function CadastroPolicialPage() {
  const session = await getServerSession(authOptions)

  const [subunidades, funcoes] = await Promise.all([
    prisma.subunidade.findMany({ orderBy: { nome: 'asc' } }),
    prisma.funcaoAtual.findMany({ orderBy: { funcao: 'asc' } })
  ])

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      {/* Renderiza o componente de formulário */}
      <PolicialForm subunidades={subunidades} funcoes={funcoes} userRole={session?.user?.perfil} />
    </div>
  )
}
