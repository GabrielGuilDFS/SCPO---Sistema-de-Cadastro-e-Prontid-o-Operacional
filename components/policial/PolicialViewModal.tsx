"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShieldCheck, UserX, Power, CheckCircle2, AlertCircle, Edit, Activity, History, Users, PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { GrauParentesco } from "@prisma/client"
import { desativarPolicial, ativarPolicial } from "@/app/cadastro/policial/actions"
import { getHistoricoPeculio, getPostosOptions } from "@/app/actions/peculio"
import { getDependentesByPolicial, adicionarDependente, removerDependente, atualizarDependente } from "@/app/dashboard/dependentes/actions"
import { toast } from "sonner"
import { PolicialForm } from "./PolicialForm"
import { PeculioFormIndividual } from "@/components/peculio/PeculioFormIndividual"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface PolicialViewModalProps {
  isOpen: boolean
  onClose: () => void
  policial: any | null
  subunidades?: { id: number; nome: string }[]
  funcoes?: { id: number; funcao: string }[]
}

// ---------------------------------------------------------------------------
// Helpers de formatação
// ---------------------------------------------------------------------------

const formatDate = (value?: string | Date | null): string => {
  if (!value) return "—"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

const formatCpf = (value?: string | null): string => {
  if (!value) return "—"
  const n = value.replace(/\D/g, "")
  return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

const formatCep = (value?: string | null): string => {
  if (!value) return "—"
  const n = value.replace(/\D/g, "")
  return n.replace(/(\d{5})(\d{3})/, "$1-$2")
}

const formatPhone = (value?: string | null): string => {
  if (!value) return "—"
  const n = value.replace(/\D/g, "")
  if (n.length === 11)
    return n.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  if (n.length === 10)
    return n.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
  return value
}

const formatTipoSanguineo = (value?: string | null): string => {
  if (!value) return "—"
  return value.replace("_POSITIVO", "+").replace("_NEGATIVO", "-")
}

const GRAU_SIGLA: Record<string, string> = {
  SOLDADO: "SD",
  CABO: "CB",
  SARGENTO: "SGT",
  SUBTENENTE: "SUB TEN",
  TENENTE: "TEN",
  CAPITAO: "CAP",
  MAJOR: "MAJ",
  TENENTE_CORONEL: "TEN CEL",
  CORONEL: "CEL",
}

// ---------------------------------------------------------------------------
// Sub-componente: campo read-only com label e valor
// ---------------------------------------------------------------------------

const Field = ({
  label,
  value,
}: {
  label: string
  value?: string | null
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-medium text-gray-900 leading-snug">
      {value || "—"}
    </span>
  </div>
)

// ---------------------------------------------------------------------------
// Separador de seção
// ---------------------------------------------------------------------------

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="col-span-full border-b border-slate-100 pb-2 mb-1">
    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
      {children}
    </h4>
  </div>
)

// ---------------------------------------------------------------------------
// Componente Aba de Prontidão (Pecúlio)
// ---------------------------------------------------------------------------

function PeculioTabContent({
  policial,
  isEditingPeculio,
  setIsEditingPeculio
}: {
  policial: any,
  isEditingPeculio: boolean,
  setIsEditingPeculio: (val: boolean) => void
}) {
  const [loading, setLoading] = useState(true)
  const [peculioData, setPeculioData] = useState<any>(null)
  const [postos, setPostos] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      if (!policial) return
      setLoading(true)
      const mesAtual = new Date().getMonth() + 1
      const anoAtual = new Date().getFullYear()
      const [data, postosOptions] = await Promise.all([
        getHistoricoPeculio(policial.id, mesAtual, anoAtual),
        getPostosOptions()
      ])
      setPeculioData(data)
      setPostos(postosOptions)
      setLoading(false)
    }
    load()
  }, [policial])

  if (loading) {
    return <div className="py-10 text-center text-sm text-slate-500">Carregando dados operacionais...</div>
  }

  const { peculioAtual, historico } = peculioData || {}

  if (isEditingPeculio) {
    const policialFormatado = {
      id: policial.id,
      nomeGuerra: policial.nomeGuerra,
      nomeCompleto: policial.nomeCompleto,
      matricula: policial.matricula,
      grauHierarquico: policial.grauHierarquico,
      subunidade: policial.subunidade ? { nome: policial.subunidade.nome } : null
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#97836a]" />
            Gerenciar Prontidão do Mês
          </h3>
        </div>
        <div className="-mx-6 px-6">
          <PeculioFormIndividual
            postos={postos}
            fixedPolicialId={policial.id}
            initialData={peculioAtual}
            onSuccess={() => setIsEditingPeculio(false)}
          />
        </div>
      </div>
    )
  }


  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Mês Atual */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#97836a]" />
            Prontidão do Mês Vigente
          </h3>
        </div>

        {peculioAtual ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium block uppercase tracking-wider mb-1">Disponibilidade</span>
              <span className="font-bold text-slate-800">{peculioAtual.disponibilidade.replace(/_/g, " ")}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium block uppercase tracking-wider mb-1">Situação</span>
              <span className="font-bold text-slate-800">{peculioAtual.situacaoFuncional.replace(/_/g, " ")}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium block uppercase tracking-wider mb-1">Condição</span>
              <span className="font-bold text-slate-800">{peculioAtual.condicaoOperacional.replace(/_/g, " ")}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium block uppercase tracking-wider mb-1">Posto</span>
              <span className="font-bold text-slate-800">{peculioAtual.postoDeServico?.nome}</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center shadow-inner">
            <ShieldCheck className="h-12 w-12 text-slate-300 mb-3" />
            <h4 className="text-slate-700 font-semibold text-lg">Nenhuma prontidão lançada</h4>
            <p className="text-sm text-slate-500 mt-1 max-w-md">Este policial não possui registro de pecúlio para o mês atual. Clique no botão acima para iniciar o lançamento.</p>
          </div>
        )}
      </section>

      {/* Histórico */}
      {historico && historico.length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
            <History className="h-5 w-5 text-slate-400" />
            Histórico Recente (Últimos 3 meses)
          </h3>
          <div className="space-y-3">
            {historico.map((hist: any) => {
              const data = new Date(hist.dataMesAno)
              const mesAnoStr = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
              return (
                <div key={hist.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="capitalize font-semibold text-sm text-slate-700">{mesAnoStr}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px] bg-slate-100">{hist.disponibilidade.replace(/_/g, " ")}</Badge>
                    <Badge variant="outline" className="text-[10px] text-[#97836a] border-[#cca471]/30 bg-[#cca471]/10">{hist.postoDeServico?.nome}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente Aba de Família (Dependentes)
// ---------------------------------------------------------------------------

function FamiliaTabContent({ policial }: { policial: any }) {
  const [dependentes, setDependentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadDependentes = async () => {
    setLoading(true)
    const result = await getDependentesByPolicial(policial.id)
    if (result.success) setDependentes(result.data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadDependentes()
  }, [policial.id])

  const calcularIdade = (dataNasc: string | Date) => {
    const hoje = new Date()
    const nasc = new Date(dataNasc)
    let idade = hoje.getFullYear() - nasc.getFullYear()
    const m = hoje.getMonth() - nasc.getMonth()
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
      idade--
    }
    return idade
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Users className="h-5 w-5 text-[#97836a]" />
          Grupo Familiar e Dependentes
        </h3>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-500">Carregando familiares...</div>
      ) : dependentes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dependentes.map((dep) => {
            const idade = calcularIdade(dep.dataNascimento)
            const isMaioridade = idade >= 18 && (dep.grauParentesco === "FILHO" || dep.grauParentesco === "FILHA" || dep.grauParentesco === "ENTEADO")

            return (
              <div key={dep.id} className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-[#cca471]/50 transition-all shadow-sm">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 truncate">{dep.nomeCompleto}</h4>
                    {isMaioridade && (
                      <Badge variant="outline" className="text-[10px] h-4 bg-slate-100 text-slate-500 border-slate-300">Maioridade</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium uppercase tracking-tighter">{dep.grauParentesco}</span>
                    <span>•</span>
                    <span>{idade} anos</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-inner">
          <Users className="h-12 w-12 text-slate-300 mb-3" />
          <h4 className="text-slate-700 font-semibold text-lg">Nenhum dependente registrado</h4>
          <p className="text-sm text-slate-500 mt-1 max-w-md">Os dados de familiares são importantes para o histórico militar. Clique no botão acima para adicionar.</p>
        </div>
      )}

    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export function PolicialViewModal({
  isOpen,
  onClose,
  policial,
  subunidades = [],
  funcoes = []
}: PolicialViewModalProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("rh")
  const [activeInnerTab, setActiveInnerTab] = useState("identificacao")
  const [isEditingPeculio, setIsEditingPeculio] = useState(false)

  // Reset states when modal opens/closes or policial changes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false)
      setIsEditingPeculio(false)
      setActiveTab("rh")
      setActiveInnerTab("identificacao")
    }
  }, [isOpen, policial])

  // Reset isEditingPeculio when tab changes
  useEffect(() => {
    if (activeTab === "rh") {
      setIsEditingPeculio(false)
    }
  }, [activeTab])

  if (!policial) return null

  const isAtivo = policial.status !== 'INATIVO' && (policial.login?.statusAtivo ?? true)

  const handleToggleStatus = async () => {
    setIsLoading(true)
    const result = isAtivo
      ? await desativarPolicial(policial.id)
      : await ativarPolicial(policial.id)

    setIsLoading(false)
    setIsConfirmOpen(false)
    if (result.success) {
      toast.success(result.message)
      onClose()
    } else {
      toast.error(result.message)
    }
  }

  const sigla = GRAU_SIGLA[policial.grauHierarquico ?? ""] ?? ""
  const guerra = policial.nomeGuerra || policial.nomeCompleto?.split(" ")[0] || ""
  const cracha = [sigla, sigla ? "PM" : "", guerra].filter(Boolean).join(" ")
  const iniciais = policial.nomeCompleto?.substring(0, 2).toUpperCase() ?? "PM"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-xl"
      >
        {/* ── Cabeçalho ─────────────────────────────────────────────────── */}
        <DialogHeader className="bg-[#3c342a] px-6 py-5 shrink-0">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <Avatar className="h-16 w-16 border-2 border-[#cca471] shadow">
              <AvatarImage
                src={policial.imagemUrl ?? ""}
                alt={policial.nomeCompleto}
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-200 text-slate-700 text-xl font-bold">
                {iniciais}
              </AvatarFallback>
            </Avatar>

            {/* Identidade */}
            <div className="flex flex-col gap-1">
              {/* Crachá */}
              <DialogTitle className="text-xl font-bold tracking-wide text-white leading-tight flex items-center gap-2">
                {cracha || policial.nomeCompleto}
                <div className="flex gap-2">
                  {policial.status === "afastado" && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] h-4 uppercase tracking-wider"
                    >
                      Afastado
                    </Badge>
                  )}
                  {isAtivo ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-4 uppercase tracking-wider border-none">
                      Conta Ativa
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-500 text-white text-[10px] h-4 uppercase tracking-wider border-none">
                      Inativo
                    </Badge>
                  )}
                </div>
              </DialogTitle>

              {/* Matrícula e Subunidade */}
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <span>
                  Matrícula:{" "}
                  <strong className="text-white">{policial.matricula}</strong>
                </span>
                {policial.subunidade?.nome && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span>{policial.subunidade.nome}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── Corpo com Abas ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-white">
          {isEditing ? (
            <div className="p-0">
              <PolicialForm
                initialData={policial}
                subunidades={subunidades}
                funcoes={funcoes}
                onSuccess={() => {
                  setIsEditing(false)
                  onClose()
                }}
              />
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col h-full">
              {/* ── Nível 1: Abas Mestras ──────────────────────────────────── */}
              <div className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 flex justify-center">
                <TabsList className="flex w-full max-w-md bg-slate-100/70 p-1 rounded-full h-auto border border-slate-200/60">
                  <TabsTrigger
                    value="rh"
                    className="flex-1 rounded-full py-2 text-sm font-semibold transition-all duration-200 text-slate-500 hover:text-slate-700 data-[state=inactive]:bg-transparent data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                  >
                    Cadastro RH
                  </TabsTrigger>
                  <TabsTrigger
                    value="peculio"
                    className="flex-1 rounded-full py-2 text-sm font-semibold transition-all duration-200 text-slate-500 hover:text-slate-700 data-[state=inactive]:bg-transparent data-[state=active]:bg-[#97836a] data-[state=active]:text-white data-[state=active]:shadow-sm"
                  >
                    Prontidão (Pecúlio)
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ── Nível 2: Conteúdo RH (Nested Tabs) ───────────────────────── */}
              <TabsContent value="rh" className="m-0 focus:outline-none flex-1 flex flex-col min-h-0">
                <Tabs value={activeInnerTab} onValueChange={setActiveInnerTab} className="w-full flex-1 flex flex-col">
                  <TabsList className="w-full grid grid-cols-5 rounded-none border-b border-slate-100 bg-slate-50/50 h-auto p-0 shrink-0">
                    {[
                      { value: "identificacao", label: "Identificação" },
                      { value: "profissional", label: "Profissional" },
                      { value: "contato", label: "Contato" },
                      { value: "familia", label: "Família" },
                      { value: "observacoes", label: "Observações" },
                    ].map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="rounded-none border-b-2 border-transparent py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 data-[state=active]:border-[#cca471] data-[state=active]:text-[#3c342a] data-[state=active]:bg-white data-[state=active]:shadow-none hover:text-slate-700"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <div className="flex-1 overflow-y-auto">
                    {/* ── Aba 1: Identificação ──────────────────────────────────── */}

                    <TabsContent value="identificacao" className="p-6 focus:outline-none">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-slate-800">
                          Dados Pessoais
                        </h3>
                        {policial.possuiPlanoSaude && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Possui Plano de Saúde
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                        <Field label="Nome Completo" value={policial.nomeCompleto} />
                        <Field label="Nome de Guerra" value={policial.nomeGuerra} />
                        <Field label="CPF" value={formatCpf(policial.cpf)} />
                        <Field label="RG" value={policial.rg} />
                        <Field
                          label="Data de Nascimento"
                          value={formatDate(policial.dataNascimento)}
                        />

                        <Field label="Sexo" value={policial.sexo} />
                        <Field
                          label="Tipo Sanguíneo"
                          value={formatTipoSanguineo(policial.tipoSanguineo)}
                        />
                        <Field label="Estado Civil" value={policial.estadoCivil} />

                        <Field
                          label="Escolaridade"
                          value={policial.escolaridade?.replace(/_/g, " ")}
                        />
                        <Field label="Religiosidade" value={policial.religiosidade} />
                      </div>
                    </TabsContent>

                    {/* ── Aba 2: Profissional ───────────────────────────────────── */}
                    <TabsContent value="profissional" className="p-6 focus:outline-none">
                      <h3 className="text-base font-semibold text-slate-800 mb-5">
                        Lotação e Dados Funcionais
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
                        <Field
                          label="Subunidade (Lotação)"
                          value={policial.subunidade?.nome ?? "Sem Sede / Não Informada"}
                        />
                        <Field
                          label="Função Atual"
                          value={policial.funcaoAtual?.funcao ?? "Não Informada"}
                        />
                        <Field
                          label="Data de Admissão"
                          value={formatDate(policial.dataAdmissao)}
                        />
                      </div>

                      <div className="mt-8">
                        <div className="border-b border-slate-100 pb-3 mb-5">
                          <h3 className="text-base font-semibold text-slate-800">
                            Habilitação
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                          <Field label="Categoria CNH" value={policial.cnhCategoria} />
                          <Field label="Número CNH" value={policial.cnhNumero} />
                        </div>
                      </div>
                    </TabsContent>

                    {/* ── Aba 3: Contato ────────────────────────────────────────── */}
                    <TabsContent value="contato" className="p-6 focus:outline-none">
                      <h3 className="text-base font-semibold text-slate-800 mb-5">
                        Contatos
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5">
                        <Field label="E-mail" value={policial.email} />
                        <Field label="Telefone Primário" value={formatPhone(policial.telefonePrimario)} />
                        <Field label="Telefone Secundário" value={formatPhone(policial.telefoneSecundario)} />
                      </div>

                      <div className="mt-8">
                        <div className="border-b border-slate-100 pb-3 mb-5">
                          <h3 className="text-base font-semibold text-slate-800">
                            Endereço
                          </h3>
                        </div>

                        {policial.endereco ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5">
                            <Field label="Logradouro" value={policial.endereco.logradouro} />
                            <Field label="Número" value={policial.endereco.numero} />
                            <Field label="Bairro" value={policial.endereco.bairro} />
                            <Field label="Cidade" value={policial.endereco.cidade} />
                            <Field label="Estado (UF)" value={policial.endereco.estado} />
                            <Field label="CEP" value={formatCep(policial.endereco.cep)} />
                          </div>
                        ) : (
                          <div className="rounded-lg bg-slate-50 border border-slate-100 p-6 text-center">
                            <p className="text-sm text-slate-400">
                              Nenhum endereço registrado.
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>


                    {/* ── Aba 4: Observações ────────────────────────────────────── */}
                    <TabsContent value="observacoes" className="p-6 focus:outline-none">
                      <h3 className="text-base font-semibold text-slate-800 mb-5">
                        Observações e Histórico
                      </h3>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-5 min-h-[180px]">
                        {policial.observacoes ? (
                          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {policial.observacoes}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 italic text-center mt-10">
                            Nenhuma observação registrada para este policial.
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    {/* ── Aba 5: Família (Dependentes) ──────────────────────────── */}
                    <TabsContent value="familia" className="p-6 focus:outline-none">
                      <FamiliaTabContent policial={policial} />
                    </TabsContent>
                  </div>
                </Tabs>
              </TabsContent>

              {/* ── Nível 2: Conteúdo Prontidão (Pecúlio) ────────────────────── */}
              <TabsContent value="peculio" className="m-0 p-6 focus:outline-none flex-1 overflow-y-auto">
                <PeculioTabContent
                  policial={policial}
                  isEditingPeculio={isEditingPeculio}
                  setIsEditingPeculio={setIsEditingPeculio}
                />
              </TabsContent>

              {/* ── Nível 2: Conteúdo Família (Dependentes) ────────────────── */}
              <TabsContent value="familia" className="m-0 p-6 focus:outline-none flex-1 overflow-y-auto">
                <FamiliaTabContent policial={policial} />
              </TabsContent>

            </Tabs>
          )}
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              if (isEditing) setIsEditing(false)
              else if (isEditingPeculio) setIsEditingPeculio(false)
              else onClose()
            }}
            className="text-slate-600"
          >
            {isEditing || isEditingPeculio ? "Cancelar" : "Fechar"}
          </Button>

          {!isEditing && activeTab === "rh" && (
            <>
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="mr-2 h-4 w-4" /> Editar Perfil
              </Button>

              <Button
                variant={isAtivo ? "destructive" : "default"}
                className={isAtivo ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                onClick={() => setIsConfirmOpen(true)}
                disabled={isLoading}
              >
                {isAtivo ? (
                  <><UserX className="mr-2 h-4 w-4" /> Desativar Agente</>
                ) : (
                  <><Power className="mr-2 h-4 w-4" /> Reativar Agente</>
                )}
              </Button>
            </>
          )}

          {!isEditingPeculio && activeTab === "peculio" && (
            <Button
              className="bg-[#ffffff] border-2 border-slate-200 text-slate-700 hover:bg-slate-100"
              onClick={() => setIsEditingPeculio(true)}
            >
              <Activity className="mr-2 h-4 w-4" /> Editar Prontidão
            </Button>
          )}
        </div>

        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <AlertDialogContent className="bg-white border-2 border-slate-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#3c342a] flex items-center gap-2">
                {isAtivo ? <AlertCircle className="text-rose-500 h-5 w-5" /> : <CheckCircle2 className="text-emerald-500 h-5 w-5" />}
                {isAtivo ? "Confirmar Desativação" : "Confirmar Reativação"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                {isAtivo
                  ? "Deseja realmente desativar este agente? O acesso ao sistema será bloqueado, mas os dados funcionais serão preservados para histórico."
                  : "Deseja reativar o acesso deste agente ao sistema? Ele poderá realizar login novamente."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-slate-200 text-slate-500 hover:bg-slate-50">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleToggleStatus}
                className={isAtivo ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
              >
                {isLoading ? "Processando..." : (isAtivo ? "Desativar" : "Reativar")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  )
}
