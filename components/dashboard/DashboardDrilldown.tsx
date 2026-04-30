"use client"

import { useState, useEffect, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, ShieldCheck, ShieldAlert, Users, ArrowLeft, CheckCircle, XCircle, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { listarProntidao, listarAfastamentos, listarEfetivoComPeculio } from "@/app/actions/policiais"
import type { DrilldownType } from "./KPIBoard"

interface DashboardDrilldownProps {
  tipo: DrilldownType | null
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Configuração por tipo
// ---------------------------------------------------------------------------

const CONFIG: Record<DrilldownType, { title: string; description: string; icon: typeof Users }> = {
  efetivo: {
    title: "Efetivo Total",
    description: "Lista completa de policiais — sem pecúlio lançado no topo.",
    icon: Users,
  },
  prontidao: {
    title: "Painel de Prontidão",
    description: "Policiais prontos e não prontos no mês atual.",
    icon: ShieldCheck,
  },
  afastamentos: {
    title: "Policiais Afastados",
    description: "Policiais em férias, licença médica ou licença prêmio.",
    icon: ShieldAlert,
  },
}

// ---------------------------------------------------------------------------
// Sub-componentes de tabela
// ---------------------------------------------------------------------------

function TabelaProntidao({ data }: { data: Awaited<ReturnType<typeof listarProntidao>> | null }) {
  if (!data) return null
  return (
    <div className="space-y-6">
      {/* Prontos */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider">
            Em Prontidão ({data.prontos.length})
          </h4>
        </div>
        {data.prontos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8f6f3] hover:bg-[#f8f6f3]">
                <TableHead className="text-slate-600 font-semibold text-xs">Nome de Guerra</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs">Matrícula</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs">Subunidade</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs">Posto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.prontos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-slate-800">{p.nomeGuerra}</TableCell>
                  <TableCell className="font-mono text-slate-600 text-xs">{p.matricula}</TableCell>
                  <TableCell>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">{p.subunidade}</span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{p.postoServico}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-slate-400 italic px-4">Nenhum policial pronto registrado.</p>
        )}
      </div>

      {/* Não Prontos */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <XCircle className="h-4 w-4 text-amber-500" />
          <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wider">
            Não Prontos ({data.naoProntos.length})
          </h4>
        </div>
        {data.naoProntos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f8f6f3] hover:bg-[#f8f6f3]">
                <TableHead className="text-slate-600 font-semibold text-xs">Nome de Guerra</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs">Matrícula</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs">Subunidade</TableHead>
                <TableHead className="text-slate-600 font-semibold text-xs">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.naoProntos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-slate-800">{p.nomeGuerra}</TableCell>
                  <TableCell className="font-mono text-slate-600 text-xs">{p.matricula}</TableCell>
                  <TableCell>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">{p.subunidade}</span>
                  </TableCell>
                  <TableCell>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">
                      {p.disponibilidade}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-slate-400 italic px-4">Todos os policiais estão prontos.</p>
        )}
      </div>
    </div>
  )
}

function TabelaAfastamentos({ data }: { data: Awaited<ReturnType<typeof listarAfastamentos>> | null }) {
  if (!data) return null
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#f8f6f3] hover:bg-[#f8f6f3]">
          <TableHead className="text-slate-600 font-semibold text-xs">Nome de Guerra</TableHead>
          <TableHead className="text-slate-600 font-semibold text-xs">Matrícula</TableHead>
          <TableHead className="text-slate-600 font-semibold text-xs">Subunidade</TableHead>
          <TableHead className="text-slate-600 font-semibold text-xs">Motivo do Afastamento</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium text-slate-800">{p.nomeGuerra}</TableCell>
              <TableCell className="font-mono text-slate-600 text-xs">{p.matricula}</TableCell>
              <TableCell>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">{p.subunidade}</span>
              </TableCell>
              <TableCell>
                <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-xs font-medium">
                  {p.motivo}
                </span>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-slate-400 italic py-8">
              Nenhum policial afastado no mês atual.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function TabelaEfetivo({ data }: { data: Awaited<ReturnType<typeof listarEfetivoComPeculio>> | null }) {
  if (!data) return null
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-[#f8f6f3] hover:bg-[#f8f6f3]">
          <TableHead className="text-slate-600 font-semibold text-xs">Nome de Guerra</TableHead>
          <TableHead className="text-slate-600 font-semibold text-xs">Matrícula</TableHead>
          <TableHead className="text-slate-600 font-semibold text-xs">Subunidade</TableHead>
          <TableHead className="text-slate-600 font-semibold text-xs">Pecúlio</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium text-slate-800">{p.nomeGuerra}</TableCell>
              <TableCell className="font-mono text-slate-600 text-xs">{p.matricula}</TableCell>
              <TableCell>
                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">{p.subunidade}</span>
              </TableCell>
              <TableCell>
                {p.temPeculio ? (
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium">
                    ✓ {p.postoServico || "Lançado"}
                  </span>
                ) : (
                  <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-xs font-medium">
                    ✗ Pendente
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-slate-400 italic py-8">
              Nenhum policial encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

// ---------------------------------------------------------------------------
// Componente Principal
// ---------------------------------------------------------------------------

export function DashboardDrilldown({ tipo, onClose }: DashboardDrilldownProps) {
  const [prontidaoData, setProntidaoData] = useState<Awaited<ReturnType<typeof listarProntidao>> | null>(null)
  const [afastamentosData, setAfastamentosData] = useState<Awaited<ReturnType<typeof listarAfastamentos>> | null>(null)
  const [efetivoData, setEfetivoData] = useState<Awaited<ReturnType<typeof listarEfetivoComPeculio>> | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [subunidadeFilter, setSubunidadeFilter] = useState("all")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!tipo) return

    // Reset filters and data when opening a new type
    setSearchTerm("")
    setSubunidadeFilter("all")
    setProntidaoData(null)
    setAfastamentosData(null)
    setEfetivoData(null)

    startTransition(async () => {
      switch (tipo) {
        case 'prontidao': {
          const data = await listarProntidao()
          setProntidaoData(data)
          break
        }
        case 'afastamentos': {
          const data = await listarAfastamentos()
          setAfastamentosData(data)
          break
        }
        case 'efetivo': {
          const data = await listarEfetivoComPeculio()
          setEfetivoData(data)
          break
        }
      }
    })
  }, [tipo])

  if (!tipo) return null

  const config = CONFIG[tipo]
  const Icon = config.icon

  return (
    <Dialog
      open={!!tipo}
      onOpenChange={(open) => { if (!open) onClose() }}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Icon className="h-5 w-5 text-[#cca471]" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        {/* Barra de Filtros */}
        {!isPending && (
          <div className="flex flex-col sm:flex-row gap-3 py-4 border-b border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={subunidadeFilter} onValueChange={(val) => setSubunidadeFilter(val || "all")}>
                <SelectTrigger className="h-9 text-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                    <SelectValue placeholder="Subunidade" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Subunidades</SelectItem>
                  {/* Extrair subunidades únicas dos dados atuais */}
                  {Array.from(new Set([
                    ...(prontidaoData?.prontos.map(p => p.subunidade) || []),
                    ...(prontidaoData?.naoProntos.map(p => p.subunidade) || []),
                    ...(afastamentosData?.map(p => p.subunidade) || []),
                    ...(efetivoData?.map(p => p.subunidade) || [])
                  ])).sort().map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 pr-1 py-4">
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-[#cca471] animate-spin" />
              <span className="ml-3 text-slate-500">Carregando dados...</span>
            </div>
          ) : (
            <>
              {tipo === 'prontidao' && (
                <TabelaProntidao data={{
                  prontos: prontidaoData?.prontos.filter(p => 
                    (subunidadeFilter === 'all' || p.subunidade === subunidadeFilter) &&
                    (p.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) || p.matricula.includes(searchTerm))
                  ) || [],
                  naoProntos: prontidaoData?.naoProntos.filter(p => 
                    (subunidadeFilter === 'all' || p.subunidade === subunidadeFilter) &&
                    (p.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) || p.matricula.includes(searchTerm))
                  ) || []
                }} />
              )}
              {tipo === 'afastamentos' && (
                <TabelaAfastamentos data={afastamentosData?.filter(p => 
                  (subunidadeFilter === 'all' || p.subunidade === subunidadeFilter) &&
                  (p.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) || p.matricula.includes(searchTerm) || p.motivo.toLowerCase().includes(searchTerm.toLowerCase()))
                ) || []} />
              )}
              {tipo === 'efetivo' && (
                <TabelaEfetivo data={efetivoData?.filter(p => 
                  (subunidadeFilter === 'all' || p.subunidade === subunidadeFilter) &&
                  (p.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) || p.matricula.includes(searchTerm))
                ) || []} />
              )}

              {/* Feedback de Nenhum Resultado */}
              {((tipo === 'prontidao' && prontidaoData && (
                  prontidaoData.prontos.filter(p => (subunidadeFilter === 'all' || p.subunidade === subunidadeFilter) && (p.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) || p.matricula.includes(searchTerm))).length === 0 &&
                  prontidaoData.naoProntos.filter(p => (subunidadeFilter === 'all' || p.subunidade === subunidadeFilter) && (p.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) || p.matricula.includes(searchTerm))).length === 0
                )) ||
                (tipo === 'afastamentos' && afastamentosData && afastamentosData.filter(p => 
                  (subunidadeFilter === 'all' || p.subunidade === subunidadeFilter) &&
                  (p.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) || p.matricula.includes(searchTerm) || p.motivo.toLowerCase().includes(searchTerm.toLowerCase()))
                ).length === 0) ||
                (tipo === 'efetivo' && efetivoData && efetivoData.filter(p => 
                  (subunidadeFilter === 'all' || p.subunidade === subunidadeFilter) &&
                  (p.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) || p.matricula.includes(searchTerm))
                ).length === 0)) && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Search className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Nenhum militar encontrado com esses critérios.</p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
