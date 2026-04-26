import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { PeculioForm } from "@/components/peculio/PeculioForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
    <div className="min-h-screen bg-[#7f6e59] p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden border border-black/10">
        <div className="bg-[#3c342a] px-6 py-4 border-b border-black/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Lançar Pecúlio</h2>
            <p className="text-sm text-[#cca471] mt-1">Registre a prontidão e disponibilidade do policial.</p>
          </div>
          <Link href="/dashboard" passHref>
            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white h-9 px-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
        <div className="p-6">
          <PeculioForm policiais={policiais} postos={postos} />
        </div>
      </div>
    </div>
  )
}
