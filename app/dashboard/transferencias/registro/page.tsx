import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { TransferenciaForm } from "@/components/transferencia/TransferenciaForm"
import { ArrowRightLeft, Edit } from "lucide-react"

interface RegistroTransferenciaPageProps {
  searchParams: Promise<{ id?: string; policialId?: string }>
}

export default async function RegistroTransferenciaPage({ searchParams }: RegistroTransferenciaPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.perfil !== "ADMINISTRADOR" && session.user.perfil !== "OPERADOR")) {
    redirect("/dashboard")
  }

  const { id, policialId } = await searchParams

  const subunidades = await prisma.subunidade.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, sigla: true },
  })

  let initialData = undefined
  let fixedPolicialId = 0

  if (id) {
    const transferenciaId = parseInt(id)
    if (!isNaN(transferenciaId)) {
      const transferencia = await prisma.transferencia.findUnique({
        where: { id: transferenciaId },
        include: { policial: true }
      })
      if (transferencia) {
        initialData = {
          id: transferencia.id,
          subunidadeDestinoId: transferencia.subunidadeDestinoId,
          tipoTransferencia: transferencia.tipoTransferencia as "INTERNA" | "EXTERNA",
          numeroBGO: transferencia.numeroBGO || "",
          dataTransferencia: transferencia.dataTransferencia,
        }
        fixedPolicialId = transferencia.policialId
      }
    }
  } else if (policialId) {
    fixedPolicialId = parseInt(policialId)
  }

  if (!fixedPolicialId || isNaN(fixedPolicialId)) {
    redirect("/dashboard/transferencias")
  }

  const policial = await prisma.policial.findUnique({
    where: { id: fixedPolicialId },
    select: {
      id: true,
      nomeCompleto: true,
      nomeGuerra: true,
      grauHierarquico: true,
      subunidadeId: true,
    }
  })

  if (!policial) {
    redirect("/dashboard/transferencias")
  }

  return (
    <div className="min-h-full p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            {initialData ? (
              <>
                <Edit className="h-8 w-8 text-[#cca471]" />
                Edição de Transferência
              </>
            ) : (
              <>
                <ArrowRightLeft className="h-8 w-8 text-[#cca471]" />
                Registrar Transferência
              </>
            )}
          </h2>
          <p className="text-[#b1a99f] mt-1">
            {initialData 
              ? `Editando transferência de ${policial.grauHierarquico} ${policial.nomeGuerra || policial.nomeCompleto}` 
              : `Registrando nova transferência para ${policial.grauHierarquico} ${policial.nomeGuerra || policial.nomeCompleto}`}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-black/10 p-6 md:p-8">
          <TransferenciaForm 
            policialId={fixedPolicialId}
            policialSubunidadeId={policial.subunidadeId}
            subunidades={subunidades}
            initialData={initialData}
            hideBGOFields={false}
          />
        </div>
      </div>
    </div>
  )
}
