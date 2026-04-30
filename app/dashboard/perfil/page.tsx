import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { PerfilForm } from "@/components/perfil/PerfilForm"
import { User, Shield, IdCard, Award } from "lucide-react"

const GRAU_SIGLA: Record<string, string> = {
  SOLDADO: "SD PM",
  CABO: "CB PM",
  SARGENTO: "SGT PM",
  SUBTENENTE: "SUB TEN PM",
  TENENTE: "TEN PM",
  CAPITAO: "CAP PM",
  MAJOR: "MAJ PM",
  TENENTE_CORONEL: "TEN CEL PM",
  CORONEL: "CEL PM",
}

export default async function PerfilPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.matricula) {
    redirect("/login")
  }

  const login = await prisma.login.findUnique({
    where: { matricula: session.user.matricula },
    include: {
      policial: {
        include: {
          subunidade: true,
          funcaoAtual: true,
        },
      },
    },
  })

  if (!login?.policial) {
    redirect("/dashboard")
  }

  const policial = login.policial
  const grauFormatado = GRAU_SIGLA[policial.grauHierarquico ?? ""] ?? policial.grauHierarquico ?? "—"

  return (
    <div className="min-h-full p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <User className="h-8 w-8 text-[#cca471]" />
            Meu Perfil
          </h2>
          <p className="text-[#b1a99f] mt-1">Gerencie suas informações e credenciais de acesso.</p>
        </div>

        {/* Card de Identificação (Read-Only) */}
        <div className="bg-white rounded-xl shadow-md border border-black/10 overflow-hidden">
          <div className="bg-[#3c342a] px-6 py-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#cca471]" />
              Dados Funcionais
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Nome Completo
                </span>
                <span className="text-slate-800 font-bold text-base">{policial.nomeCompleto}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <IdCard className="h-3.5 w-3.5" />
                  Matrícula
                </span>
                <span className="text-slate-800 font-bold text-base font-mono">{policial.matricula}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" />
                  Posto / Graduação
                </span>
                <span className="text-slate-800 font-bold text-base">{grauFormatado}</span>
              </div>
            </div>

            {(policial.subunidade || policial.funcaoAtual) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
                {policial.subunidade && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Lotação</span>
                    <span className="text-slate-700 font-medium">{policial.subunidade.nome}</span>
                  </div>
                )}
                {policial.funcaoAtual && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Função Atual</span>
                    <span className="text-slate-700 font-medium">{policial.funcaoAtual.funcao}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Nível de Acesso:</span>
                <span className="text-xs font-bold bg-[#cca471]/20 text-[#7a6656] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {login.perfilAcesso}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Alteração de Senha */}
        <div className="bg-white rounded-xl shadow-md border border-black/10 overflow-hidden">
          <div className="bg-[#3c342a] px-6 py-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#cca471]" />
              Alterar Senha de Acesso
            </h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 mb-6">
              Para sua segurança, informe a senha atual antes de definir uma nova. A nova senha deve ter no mínimo 6 caracteres.
            </p>
            <PerfilForm />
          </div>
        </div>
      </div>
    </div>
  )
}
