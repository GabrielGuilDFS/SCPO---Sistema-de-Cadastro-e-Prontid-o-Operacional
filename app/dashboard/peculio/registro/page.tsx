import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { PeculioFormIndividual } from "@/components/peculio/PeculioFormIndividual"
import { ClipboardCheck, Edit } from "lucide-react"

interface RegistroPeculioPageProps {
  searchParams: Promise<{ id?: string; policialId?: string }>
}

export default async function RegistroPeculioPage({ searchParams }: RegistroPeculioPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.perfil !== "ADMINISTRADOR" && session.user.perfil !== "OPERADOR")) {
    redirect("/dashboard")
  }

  const { id, policialId } = await searchParams

  const postosBrutos = await prisma.postoDeServico.findMany({
    include: { subunidade: true },
    orderBy: { nome: 'asc' }
  })

  const postos = postosBrutos.map(p => ({
    id: p.id,
    nome: p.nome,
    subunidade: p.subunidade ? { nome: p.subunidade.nome } : null
  }))

  let initialData = undefined
  let fixedPolicialId = 0

  if (id) {
    const peculioId = parseInt(id)
    if (!isNaN(peculioId)) {
      const peculio = await prisma.peculio.findUnique({
        where: { id: peculioId },
        include: { policial: true }
      })
      if (peculio) {
        initialData = peculio
        fixedPolicialId = peculio.policialId
      }
    }
  } else if (policialId) {
    fixedPolicialId = parseInt(policialId)
  }

  // Verifica se temos um policialId válido, pois a criação individual necessita dele
  if (!fixedPolicialId || isNaN(fixedPolicialId)) {
    redirect("/dashboard/peculio")
  }

  const policial = await prisma.policial.findUnique({
    where: { id: fixedPolicialId }
  })

  if (!policial) {
    redirect("/dashboard/peculio")
  }

  return (
    <div className="min-h-full p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {initialData ? (
              <>
                <Edit className="h-8 w-8 text-[#cca471]" />
                Editar Prontidão
              </>
            ) : (
              <>
                <ClipboardCheck className="h-8 w-8 text-[#cca471]" />
                Cadastrar Prontidão
              </>
            )}
          </h2>
          <p className="text-[#b1a99f] mt-1">
            {initialData 
              ? `Editando prontidão de ${policial.grauHierarquico} ${policial.nomeGuerra || policial.nomeCompleto}` 
              : `Registrando prontidão para ${policial.grauHierarquico} ${policial.nomeGuerra || policial.nomeCompleto}`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-black/10 p-6 md:p-8">
          <PeculioFormIndividual 
            postos={postos} 
            fixedPolicialId={fixedPolicialId} 
            initialData={initialData} 
          />
        </div>
      </div>
    </div>
  )
}
