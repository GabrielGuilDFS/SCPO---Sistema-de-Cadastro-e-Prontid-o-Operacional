import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LogoutButton } from "@/components/dashboard/LogoutButton"
import Link from "next/link"
import { ArrowLeft, Settings, Building2, MapPin, BriefcaseBusiness } from "lucide-react"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminModals } from "./AdminModals"
import { DeleteButton } from "./DeleteButton"

export default async function AdminPanelPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user?.perfil !== "ADMINISTRADOR") {
    redirect("/dashboard")
  }

  const [subunidades, postos, funcoes] = await Promise.all([
    prisma.subunidade.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { policiais: true, postosServico: true } } }
    }),
    prisma.postoDeServico.findMany({
      orderBy: { nome: 'asc' },
      include: { subunidade: true }
    }),
    prisma.funcaoAtual.findMany({
      orderBy: { funcao: 'asc' },
      include: { _count: { select: { policiais: true } } }
    })
  ])

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

      <main className="max-w-6xl mx-auto min-h-[calc(100vh-73px)] p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-4">
          <Link href="/dashboard" className="text-[#cca471] hover:text-white flex items-center gap-2 transition-colors w-fit font-medium">
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <Settings className="h-8 w-8 text-[#cca471]" />
                Painel Administrativo
              </h2>
              <p className="text-[#b1a99f] mt-1">Gestão de infraestrutura, unidades e atribuições funcionais.</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="subunidades" className="w-full space-y-6">
          <TabsList className="bg-[#3c342a]/50 border border-white/10 p-1">
            <TabsTrigger value="subunidades" className="data-[state=active]:bg-[#cca471] data-[state=active]:text-[#3c342a] text-white">
              Subunidades (CIA/Pelotão)
            </TabsTrigger>
            <TabsTrigger value="postos" className="data-[state=active]:bg-[#cca471] data-[state=active]:text-[#3c342a] text-white">
              Postos de Serviço
            </TabsTrigger>
            <TabsTrigger value="funcoes" className="data-[state=active]:bg-[#cca471] data-[state=active]:text-[#3c342a] text-white">
              Funções (Atribuições)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subunidades" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#cca471]" />
                Lista de Subunidades
              </h3>
              <AdminModals type="subunidade" mode="create" />
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-[#3c342a]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8f9fa] border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase text-xs">Nome da Subunidade</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs">Sigla</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs text-center">Efetivo</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs text-center">Postos</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subunidades.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{sub.nome}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                          {sub.sigla}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">{sub._count.policiais}</td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">{sub._count.postosServico}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <AdminModals 
                            type="subunidade" 
                            mode="edit" 
                            initialData={sub} 
                          />
                          <DeleteButton id={sub.id} type="subunidade" label={`a subunidade ${sub.sigla}`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="postos" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#cca471]" />
                Postos de Serviço
              </h3>
              <AdminModals type="posto" mode="create" subunidades={subunidades} />
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-[#3c342a]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8f9fa] border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase text-xs">Nome do Posto</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs">Vínculo (Subunidade)</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {postos.map((posto) => (
                    <tr key={posto.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{posto.nome}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600 text-sm">{posto.subunidade.nome}</span>
                          <span className="text-[10px] font-bold text-slate-400">({posto.subunidade.sigla})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <AdminModals 
                            type="posto" 
                            mode="edit" 
                            subunidades={subunidades}
                            initialData={posto} 
                          />
                          <DeleteButton id={posto.id} type="posto" label={`o posto ${posto.nome}`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="funcoes" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <BriefcaseBusiness className="h-5 w-5 text-[#cca471]" />
                Funções e Atribuições
              </h3>
              <AdminModals type="funcao" mode="create" />
            </div>

            <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-[#3c342a]">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#f8f9fa] border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-bold uppercase text-xs">Descrição da Função</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs text-center">Militares Vinculados</th>
                    <th className="px-6 py-4 font-bold uppercase text-xs text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {funcoes.map((func) => (
                    <tr key={func.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800">{func.funcao}</td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">
                        {func._count.policiais}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <AdminModals 
                            type="funcao" 
                            mode="edit" 
                            initialData={func} 
                          />
                          <DeleteButton id={func.id} type="funcao" label={`a função ${func.funcao}`} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
