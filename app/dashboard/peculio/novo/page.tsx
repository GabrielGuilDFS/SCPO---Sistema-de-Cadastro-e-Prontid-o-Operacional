import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { PeculioForm } from "@/components/peculio/PeculioForm"
import { ClipboardCheck } from "lucide-react"

export default async function NovoPeculioPage() {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.perfil !== "ADMINISTRADOR" && session.user.perfil !== "OPERADOR")) {
    redirect("/dashboard")
  }

  const policiaisBrutos = await prisma.policial.findMany({
    where: {
      status: { not: 'INATIVO' },
      OR: [ { login: null }, { login: { statusAtivo: true } } ]
    },
    include: {
      subunidade: true
    },
    orderBy: {
      nomeCompleto: 'asc'
    }
  })

  const policiais = policiaisBrutos.map(p => ({
    id: p.id,
    nomeGuerra: p.nomeGuerra,
    nomeCompleto: p.nomeCompleto,
    matricula: p.matricula,
    grauHierarquico: p.grauHierarquico,
    subunidade: p.subunidade ? { nome: p.subunidade.nome } : null
  }))

  const postosBrutos = await prisma.postoDeServico.findMany({
    include: {
      subunidade: true
    },
    orderBy: {
      nome: 'asc'
    }
  })

  const postos = postosBrutos.map(p => ({
    id: p.id,
    nome: p.nome,
    subunidade: p.subunidade ? { nome: p.subunidade.nome } : null
  }))

  return (
    <div className="min-h-full p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ClipboardCheck className="h-8 w-8 text-[#cca471]" />
            Lançamento em Lote de Pecúlio
          </h2>
          <p className="text-[#b1a99f] mt-1">Registre a prontidão e disponibilidade de múltiplos policiais de uma vez.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-black/10 p-6 md:p-8">
          <PeculioForm policiais={policiais} postos={postos} />
        </div>
      </div>
    </div>
  )
}

