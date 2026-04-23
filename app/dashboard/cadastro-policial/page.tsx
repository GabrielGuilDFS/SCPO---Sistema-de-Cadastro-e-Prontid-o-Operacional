import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LogoutButton } from "@/components/dashboard/LogoutButton"
import { PolicialForm } from "@/components/policial/PolicialForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import prisma from "@/lib/prisma"

export default async function CadastroPolicialPage() {
  const session = await getServerSession(authOptions)

  const [subunidades, funcoes] = await Promise.all([
    prisma.subunidade.findMany({ orderBy: { nome: 'asc' } }),
    prisma.funcaoAtual.findMany({ orderBy: { funcao: 'asc' } })
  ])

  return (
    <div className="min-h-screen bg-[#7f6e59]">
      {/* Header */}
      <header className="bg-[#3c342a] border-b border-black/10 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
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

      <main className="max-w-4xl mx-auto min-h-[calc(100vh-73px)] p-4 md:p-6 lg:p-8">
        <div className="mb-6">
           <Link href="/dashboard" className="text-[#cca471] hover:text-white flex items-center gap-2 transition-colors w-fit font-medium">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar ao Dashboard</span>
           </Link>
        </div>
        
        {/* Renderiza o componente de formulário */}
        <PolicialForm subunidades={subunidades} funcoes={funcoes} />
        
      </main>
    </div>
  )
}
