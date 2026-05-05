"use client"

import { useState, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, ArrowRightLeft, Loader2, Check, ChevronsUpDown } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { registrarTransferenciasEmLote } from "@/app/actions/transferencia"

const GRAU_SIGLA: Record<string, string> = {
  SOLDADO: "SD", CABO: "CB", SARGENTO: "SGT", SUBTENENTE: "SUB TEN",
  TENENTE: "TEN", CAPITAO: "CAP", MAJOR: "MAJ", TENENTE_CORONEL: "TEN CEL", CORONEL: "CEL",
}

const TIPO_LABELS: Record<string, string> = {
  INTERNA: "Interna",
  EXTERNA: "Externa",
}

// Schemas do Form (Client Side)
const itemSchema = z.object({
  policialId: z.number(),
  policialNome: z.string(),
  policialMatricula: z.string(),
  subunidadeDestinoId: z.number(),
  subunidadeDestinoNome: z.string(),
  tipoTransferencia: z.enum(["INTERNA", "EXTERNA"]),
})

const loteSchema = z.object({
  numeroBGO: z.string().min(1, "O número do BGO é obrigatório"),
  dataTransferencia: z.string().min(1, "A data de publicação é obrigatória"),
  transferencias: z.array(itemSchema).min(1, "Adicione pelo menos um policial ao lote"),
})

type FormValues = z.infer<typeof loteSchema>

interface Policial {
  id: number
  nomeCompleto: string
  nomeGuerra: string | null
  matricula: string
  grauHierarquico: string | null
  subunidadeId: number | null
  subunidade: { nome: string; sigla: string } | null
}

interface Subunidade {
  id: number
  nome: string
  sigla: string
}

interface Props {
  policiais: Policial[]
  subunidades: Subunidade[]
  onSuccess?: () => void
}

export function TransferenciaLoteForm({ policiais, subunidades, onSuccess }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Estados temporários para adicionar itens
  const [openPolicial, setOpenPolicial] = useState(false)
  const [tempPolicialId, setTempPolicialId] = useState<number | null>(null)
  const [tempSubunidadeDestinoId, setTempSubunidadeDestinoId] = useState<number | null>(null)
  const [tempTipo, setTempTipo] = useState<string>("INTERNA")

  const form = useForm<FormValues>({
    resolver: zodResolver(loteSchema),
    defaultValues: {
      numeroBGO: "",
      dataTransferencia: new Date().toISOString().split("T")[0],
      transferencias: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "transferencias",
  })

  const selectedPolicial = policiais.find(p => p.id === tempPolicialId)
  const subunidadesDestino = subunidades.filter(s => s.id !== selectedPolicial?.subunidadeId)

  // Policiais disponíveis para seleção (remove os que já estão no lote)
  const policiaisDisponiveis = useMemo(() => {
    return policiais.filter(p => !fields.some(item => item.policialId === p.id))
  }, [policiais, fields])

  const handleAddItem = () => {
    if (!tempPolicialId || !tempSubunidadeDestinoId || !tempTipo) {
      toast.error("Preencha policial, destino e tipo para adicionar à lista.")
      return
    }

    if (fields.some(f => f.policialId === tempPolicialId)) {
      toast.error("Este policial já está na lista do lote atual.")
      return
    }

    const policial = policiais.find(p => p.id === tempPolicialId)
    const subunidade = subunidades.find(s => s.id === tempSubunidadeDestinoId)

    if (policial && subunidade) {
      append({
        policialId: policial.id,
        policialNome: `${GRAU_SIGLA[policial.grauHierarquico ?? ""]} ${policial.nomeGuerra || policial.nomeCompleto}`,
        policialMatricula: policial.matricula,
        subunidadeDestinoId: subunidade.id,
        subunidadeDestinoNome: subunidade.sigla,
        tipoTransferencia: tempTipo as any,
      })

      // Reset temporários
      setTempPolicialId(null)
      setTempSubunidadeDestinoId(null)
      setTempTipo("INTERNA")
    }
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const payload = {
        numeroBGO: data.numeroBGO,
        dataTransferencia: data.dataTransferencia,
        transferencias: data.transferencias.map(t => ({
          policialId: t.policialId,
          subunidadeDestinoId: t.subunidadeDestinoId,
          tipoTransferencia: t.tipoTransferencia as any
        }))
      }

      const result = await registrarTransferenciasEmLote(payload)

      if (result.success) {
        toast.success("Lote Registrado", { description: result.message })
        form.reset()
        if (onSuccess) onSuccess()
        router.refresh()
      } else {
        toast.error("Erro no Lote", { description: result.error })
      }
    } catch (error) {
      toast.error("Erro inesperado ao salvar lote.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-[#3c342a] px-6 py-4 flex items-center gap-3 shrink-0">
        <div className="h-9 w-9 rounded-full bg-[#97836a]/20 flex items-center justify-center">
          <ArrowRightLeft className="h-4 w-4 text-[#cca471]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">Novo Lote de Transferências</h3>
          <p className="text-slate-400 text-xs">Adicione os militares à lista antes de salvar</p>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6">
        {/* Cabeçalho Fixo do Lote */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-100 shrink-0">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Número do BGO *</label>
            <Input
              {...form.register("numeroBGO")}
              placeholder="Ex: BGO Nº 042/2026"
              className={cn("h-10", form.formState.errors.numeroBGO && "border-red-500")}
            />
            {form.formState.errors.numeroBGO && (
              <p className="text-xs text-red-500">{form.formState.errors.numeroBGO.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Data de Publicação *</label>
            <Input
              type="date"
              {...form.register("dataTransferencia")}
              max={new Date().toISOString().split("T")[0]}
              className={cn("h-10", form.formState.errors.dataTransferencia && "border-red-500")}
            />
            {form.formState.errors.dataTransferencia && (
              <p className="text-xs text-red-500">{form.formState.errors.dataTransferencia.message}</p>
            )}
          </div>
        </div>

        {/* Adição Dinâmica */}
        <div className="space-y-4 shrink-0 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <h4 className="text-sm font-semibold text-slate-800">Adicionar Policial ao Lote</h4>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[250px] space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Policial</label>
              <Popover open={openPolicial} onOpenChange={setOpenPolicial}>
                <PopoverTrigger
                  role="combobox"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full justify-between h-9 bg-white font-normal",
                    !tempPolicialId && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {selectedPolicial
                      ? `${GRAU_SIGLA[selectedPolicial.grauHierarquico ?? ""]} ${selectedPolicial.nomeGuerra || selectedPolicial.nomeCompleto} (${selectedPolicial.matricula})`
                      : "Selecionar..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar..." className="h-9" />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      {policiaisDisponiveis.length === 0 ? (
                        <div className="py-6 text-center text-sm text-slate-500">
                          Todos os militares desta unidade já foram adicionados.
                        </div>
                      ) : (
                        <>
                          <CommandEmpty>Não encontrado.</CommandEmpty>
                          <CommandGroup>
                            {policiaisDisponiveis.map((p) => (
                              <CommandItem
                                key={p.id}
                                value={`${p.nomeCompleto} ${p.nomeGuerra || ""} ${p.matricula}`}
                                onSelect={() => {
                                  setTempPolicialId(p.id)
                                  setTempSubunidadeDestinoId(null)
                                  setOpenPolicial(false)
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", tempPolicialId === p.id ? "opacity-100" : "opacity-0")} />
                                <span className="truncate">{GRAU_SIGLA[p.grauHierarquico ?? ""]} {p.nomeGuerra || p.nomeCompleto}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-[180px] flex-none space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Destino</label>
              <Select value={tempSubunidadeDestinoId?.toString() || ""} onValueChange={(val) => val && setTempSubunidadeDestinoId(parseInt(val))}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue placeholder="Selecione...">
                    {tempSubunidadeDestinoId
                      ? subunidades.find(s => s.id === tempSubunidadeDestinoId)?.sigla
                      : ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subunidadesDestino.map(s => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.sigla}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[140px] flex-none space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Tipo</label>
              <Select value={tempTipo} onValueChange={(val) => val && setTempTipo(val)}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue placeholder="Selecione...">
                    {tempTipo === "INTERNA" ? "Interna" : tempTipo === "EXTERNA" ? "Externa" : ""}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNA">Interna</SelectItem>
                  <SelectItem value="EXTERNA">Externa</SelectItem>
                </SelectContent>
              </Select>

            </div>

            <div className="w-[140px] flex-none">
              <Button type="button" onClick={handleAddItem} className="w-full h-9 bg-[#97836a] hover:bg-[#97836a]/90 text-white">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>

        {/* Tabela de Prévia */}
        <div className="flex-1 min-h-[200px] border rounded-md flex flex-col overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b">
            <h4 className="text-sm font-semibold text-slate-700">Lista do Lote ({fields.length})</h4>
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Policial</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                      Nenhum policial adicionado ao lote.
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium text-xs">
                        {field.policialNome}
                        <div className="text-[10px] text-slate-500">Mat: {field.policialMatricula}</div>
                      </TableCell>
                      <TableCell className="text-xs">{field.subunidadeDestinoNome}</TableCell>
                      <TableCell className="text-xs">{TIPO_LABELS[field.tipoTransferencia]}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => remove(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {form.formState.errors.transferencias && (
            <div className="p-2 bg-red-50 border-t border-red-100 text-xs text-red-600 text-center">
              {form.formState.errors.transferencias.message}
            </div>
          )}
        </div>

      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
        <Button
          type="button"
          onClick={form.handleSubmit(onSubmit)}
          disabled={(loading || fields.length === 0) ? true : undefined}
          className="w-full"
          style={{ backgroundColor: "#97836a", color: "#fff" }}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando Lote...</>
          ) : (
            `Salvar Lote de Transferências (${fields.length})`
          )}
        </Button>
      </div>

    </div>
  )
}
