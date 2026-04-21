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
import { ShieldCheck } from "lucide-react"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface PolicialViewModalProps {
  isOpen: boolean
  onClose: () => void
  policial: any | null
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
// Componente principal
// ---------------------------------------------------------------------------

export function PolicialViewModal({
  isOpen,
  onClose,
  policial,
}: PolicialViewModalProps) {
  if (!policial) return null

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
                {policial.status === "afastado" && (
                  <Badge
                    variant="destructive"
                    className="text-[10px] h-4 uppercase tracking-wider"
                  >
                    Afastado
                  </Badge>
                )}
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
          <Tabs defaultValue="identificacao" className="w-full">
            <TabsList className="w-full grid grid-cols-4 rounded-none border-b border-slate-100 bg-slate-50 h-auto p-0">
              {[
                { value: "identificacao", label: "Identificação" },
                { value: "profissional", label: "Profissional" },
                { value: "contato", label: "Contato" },
                { value: "observacoes", label: "Observações" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-none border-b-2 border-transparent py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 data-active:border-[#cca471] data-active:text-[#3c342a] data-active:bg-white data-active:shadow-none hover:text-slate-700"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

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
                  value={policial.funcaoAtual?.nome ?? "Não Informada"}
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
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
