"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { cadastrarPeculioEmLote, getPoliciaisDisponiveis } from "@/app/actions/peculio"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// --- Zod Schema para lançamento em lote ---
const lancamentoItemSchema = z.object({
  policialId: z.number({ message: "Selecione um policial" }),
  postoDeServicoId: z.number({ message: "Selecione um posto de serviço" }),
  disponibilidade: z.enum(["PRONTO", "INDISPONIVEL", "FORA_DE_ESCALA"], { message: "Selecione a disponibilidade" }),
  situacaoFuncional: z.enum(["ATIVO", "FERIAS", "LICENCA_PREMIO", "LICENCA_MEDICA"], { message: "Selecione a situação funcional" }),
  condicaoOperacional: z.enum(["APTO_TOTAL", "APTO_RESTRICAO", "INAPTO_TEMPORARIO"], { message: "Selecione a condição operacional" }),
})

const peculioLoteSchema = z.object({
  mes: z.number().min(1).max(12),
  ano: z.number().min(2024).max(2050),
  lancamentos: z.array(lancamentoItemSchema).min(1, "Adicione pelo menos um lançamento à lista."),
})

type LoteFormValues = z.infer<typeof peculioLoteSchema>

const DRAFT_KEY = "scpo_peculio_rascunho"

// --- Interfaces ---
interface PolicialOption {
  id: number
  nomeGuerra: string | null
  nomeCompleto: string
  matricula: string
  grauHierarquico: string | null
  subunidade: { nome: string } | null
}

interface PostoOption {
  id: number
  nome: string
  subunidade: { nome: string } | null
}

interface PeculioFormProps {
  policiais: PolicialOption[]
  postos: PostoOption[]
}

// --- Labels ---
const DISPONIBILIDADE_LABELS: Record<string, string> = {
  PRONTO: "Pronto",
  INDISPONIVEL: "Indisponível",
  FORA_DE_ESCALA: "Fora de Escala"
}

const SITUACAO_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  FERIAS: "Férias",
  LICENCA_PREMIO: "Licença Prêmio",
  LICENCA_MEDICA: "Licença Médica"
}

const CONDICAO_LABELS: Record<string, string> = {
  APTO_TOTAL: "Apto Total",
  APTO_RESTRICAO: "Apto c/ Restrição",
  INAPTO_TEMPORARIO: "Inapto Temporário"
}

export function PeculioForm({ policiais, postos }: PeculioFormProps) {
  const [loading, setLoading] = useState(false)
  const [availablePoliciais, setAvailablePoliciais] = useState<PolicialOption[]>(policiais)
  const [isLoadingPoliciais, setIsLoadingPoliciais] = useState(false)
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [openPolicialIndex, setOpenPolicialIndex] = useState<number | null>(null)
  const router = useRouter()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  // Tenta carregar rascunho do localStorage
  const loadDraft = useCallback((): Partial<LoteFormValues> | null => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed
      }
    } catch (e) {
      console.error("Erro ao carregar rascunho:", e)
    }
    return null
  }, [])

  const savedDraft = loadDraft()

  const form = useForm<LoteFormValues>({
    resolver: zodResolver(peculioLoteSchema),
    defaultValues: {
      mes: savedDraft?.mes ?? currentMonth,
      ano: savedDraft?.ano ?? currentYear,
      lancamentos: savedDraft?.lancamentos ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lancamentos",
  })

  // Sinaliza que carregou rascunho
  useEffect(() => {
    if (savedDraft && savedDraft.lancamentos && savedDraft.lancamentos.length > 0) {
      setDraftLoaded(true)
      toast.info("Rascunho recuperado", {
        description: `${savedDraft.lancamentos.length} lançamento(s) carregado(s) automaticamente.`
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const mesWatch = form.watch("mes")
  const anoWatch = form.watch("ano")

  // Carregar policiais disponíveis quando mês/ano mudar
  useEffect(() => {
    async function loadPoliciais() {
      if (!mesWatch || !anoWatch) return
      setIsLoadingPoliciais(true)
      const fetched = await getPoliciaisDisponiveis(mesWatch, anoWatch)
      const mapped: PolicialOption[] = fetched.map((p: any) => ({
        id: p.id,
        nomeGuerra: p.nomeGuerra,
        nomeCompleto: p.nomeCompleto,
        matricula: p.matricula,
        grauHierarquico: p.grauHierarquico,
        subunidade: p.subunidade ? { nome: p.subunidade.nome } : null
      }))
      setAvailablePoliciais(mapped)
      setIsLoadingPoliciais(false)
    }
    loadPoliciais()
  }, [mesWatch, anoWatch])

  // Persistir rascunho no localStorage
  useEffect(() => {
    const subscription = form.watch((values) => {
      try {
        setDraftStatus("saving")
        localStorage.setItem(DRAFT_KEY, JSON.stringify(values))
        setTimeout(() => setDraftStatus("saved"), 300)
        setTimeout(() => setDraftStatus("idle"), 2500)
      } catch (e) {
        console.error("Erro ao salvar rascunho:", e)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch (e) {
      console.error("Erro ao limpar rascunho:", e)
    }
  }

  // Policiais já selecionados (para filtrar da lista de disponíveis)
  const selectedPolicialIds = form.watch("lancamentos")?.map(l => l.policialId).filter(Boolean) || []

  async function onSubmit(data: LoteFormValues) {
    setLoading(true)
    try {
      const result = await cadastrarPeculioEmLote(data)

      if (result?.error) {
        toast.error("Erro no Lançamento", {
          description: result.error,
        })
        return
      }

      toast.success(result.message || "Lançamento em lote realizado com sucesso!")
      clearDraft()
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (error) {
      console.error("Erro ao processar lote:", error)
      toast.error("Erro inesperado ao processar lançamento em lote.")
    } finally {
      setLoading(false)
    }
  }

  const meses = [
    { value: 1, label: "Janeiro" },
    { value: 2, label: "Fevereiro" },
    { value: 3, label: "Março" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Maio" },
    { value: 6, label: "Junho" },
    { value: 7, label: "Julho" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Setembro" },
    { value: 10, label: "Outubro" },
    { value: 11, label: "Novembro" },
    { value: 12, label: "Dezembro" },
  ]

  const anos = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i)

  const addNewRow = () => {
    append({
      policialId: undefined as any,
      postoDeServicoId: undefined as any,
      disponibilidade: undefined as any,
      situacaoFuncional: undefined as any,
      condicaoOperacional: undefined as any,
    })
  }

  const getPolicialLabel = (id: number) => {
    const p = policiais.find(pol => pol.id === id)
    if (!p) return "Policial não encontrado"
    return `${p.grauHierarquico || ''} ${p.nomeGuerra || p.nomeCompleto} (${p.matricula})`
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* Header: Mês/Ano globais + Indicador de Rascunho */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pb-4 border-b border-slate-200">
          <div className="grid grid-cols-2 gap-4 flex-1">
            <FormField
              control={form.control}
              name="mes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mês de Referência</FormLabel>
                  <Select onValueChange={(val) => val && field.onChange(parseInt(val))} value={field.value?.toString() || ""}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Mês">
                          {field.value ? meses.find(m => m.value === field.value)?.label : ""}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {meses.map(mes => (
                        <SelectItem key={mes.value} value={mes.value.toString()}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ano"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano de Referência</FormLabel>
                  <Select onValueChange={(val) => val && field.onChange(parseInt(val))} value={field.value?.toString() || ""}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Ano">
                          {field.value || ""}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {anos.map(ano => (
                        <SelectItem key={ano} value={ano.toString()}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Indicador de rascunho */}
          <div className="flex items-center gap-2 text-sm shrink-0 min-h-[40px]">
            {draftStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-[#97836a] animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Salvando rascunho...
              </span>
            )}
            {draftStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-emerald-600 animate-pulse">
                <Save className="h-3.5 w-3.5" />
                Rascunho salvo
              </span>
            )}
            {draftStatus === "idle" && draftLoaded && fields.length > 0 && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Save className="h-3.5 w-3.5" />
                Rascunho ativo
              </span>
            )}
          </div>
        </div>

        {/* Lista de lançamentos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Policiais no Lançamento</h3>
              <p className="text-sm text-slate-500">
                {fields.length === 0
                  ? "Adicione policiais à lista para iniciar o lançamento em lote."
                  : `${fields.length} policial(is) na lista`
                }
              </p>
            </div>
            <Button
              type="button"
              onClick={addNewRow}
              className="bg-[#97836a] hover:bg-[#7f6e59] text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar Policial
            </Button>
          </div>

          {/* Mensagem de erro global para lancamentos */}
          {form.formState.errors.lancamentos?.message && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-3">
              {form.formState.errors.lancamentos.message}
            </p>
          )}

          {fields.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">
              <Plus className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Nenhum policial adicionado ao lançamento.</p>
              <p className="text-slate-400 text-xs mt-1">Clique em &quot;Adicionar Policial&quot; para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="relative p-5 bg-slate-50/70 rounded-xl border border-slate-200 hover:border-[#cca471]/50 transition-colors animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  {/* Número da linha + botão remover */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-[#97836a] bg-[#97836a]/10 px-2.5 py-1 rounded-full">
                      #{index + 1}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(index)}
                      className="h-7 w-7 rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  {/* Linha 1: Policial + Posto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Seletor de Policial (Combobox) */}
                    <FormField
                      control={form.control}
                      name={`lancamentos.${index}.policialId`}
                      render={({ field: formField }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-xs">Policial</FormLabel>
                          <Popover
                            open={openPolicialIndex === index}
                            onOpenChange={(open) => setOpenPolicialIndex(open ? index : null)}
                          >
                            <FormControl>
                              <PopoverTrigger
                                role="combobox"
                                className={cn(
                                  buttonVariants({ variant: "outline" }),
                                  "justify-between w-full h-10 px-3 text-sm",
                                  !formField.value && "text-muted-foreground"
                                )}
                              >
                                <span className="truncate">
                                  {formField.value
                                    ? getPolicialLabel(formField.value)
                                    : "Selecione o policial"}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </PopoverTrigger>
                            </FormControl>
                            <PopoverContent className="w-[400px] p-0">
                              <Command>
                                <CommandInput placeholder="Buscar por nome ou matrícula..." />
                                <CommandList>
                                  <CommandEmpty>Nenhum policial encontrado.</CommandEmpty>
                                  <CommandGroup>
                                    {isLoadingPoliciais ? (
                                      <div className="py-6 text-center text-sm text-muted-foreground">
                                        Carregando policiais disponíveis...
                                      </div>
                                    ) : (
                                      availablePoliciais
                                        .filter(p => !selectedPolicialIds.includes(p.id) || p.id === formField.value)
                                        .map((policial) => (
                                          <CommandItem
                                            value={`${policial.nomeCompleto} ${policial.nomeGuerra || ""} ${policial.matricula}`}
                                            key={policial.id}
                                            onSelect={() => {
                                              form.setValue(`lancamentos.${index}.policialId`, policial.id, { shouldValidate: true })
                                              setOpenPolicialIndex(null)
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                policial.id === formField.value
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            {policial.grauHierarquico} {policial.nomeGuerra || policial.nomeCompleto} - Mat: {policial.matricula}
                                          </CommandItem>
                                        ))
                                    )}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Posto de Serviço */}
                    <FormField
                      control={form.control}
                      name={`lancamentos.${index}.postoDeServicoId`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Posto de Serviço</FormLabel>
                          <Select onValueChange={(val) => val && formField.onChange(parseInt(val))} value={formField.value?.toString() || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Selecione o posto">
                                  {formField.value ? (() => {
                                    const posto = postos.find(p => p.id === formField.value);
                                    return posto ? `${posto.nome} ${posto.subunidade ? `(${posto.subunidade.nome})` : ''}` : "";
                                  })() : ""}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {postos.map(posto => (
                                <SelectItem key={posto.id} value={posto.id.toString()}>
                                  {posto.nome} {posto.subunidade ? `(${posto.subunidade.nome})` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Linha 2: Disponibilidade + Situação + Condição */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`lancamentos.${index}.disponibilidade`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Disponibilidade</FormLabel>
                          <Select onValueChange={formField.onChange} value={formField.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Selecione">
                                  {formField.value ? DISPONIBILIDADE_LABELS[formField.value] : ""}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PRONTO">Pronto</SelectItem>
                              <SelectItem value="INDISPONIVEL">Indisponível</SelectItem>
                              <SelectItem value="FORA_DE_ESCALA">Fora de Escala</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`lancamentos.${index}.situacaoFuncional`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Situação Funcional</FormLabel>
                          <Select onValueChange={formField.onChange} value={formField.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Selecione">
                                  {formField.value ? SITUACAO_LABELS[formField.value] : ""}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ATIVO">Ativo</SelectItem>
                              <SelectItem value="FERIAS">Férias</SelectItem>
                              <SelectItem value="LICENCA_PREMIO">Licença Prêmio</SelectItem>
                              <SelectItem value="LICENCA_MEDICA">Licença Médica</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`lancamentos.${index}.condicaoOperacional`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Condição Operacional</FormLabel>
                          <Select onValueChange={formField.onChange} value={formField.value || ""}>
                            <FormControl>
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Selecione">
                                  {formField.value ? CONDICAO_LABELS[formField.value] : ""}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="APTO_TOTAL">Apto Total</SelectItem>
                              <SelectItem value="APTO_RESTRICAO">Apto com Restrição</SelectItem>
                              <SelectItem value="INAPTO_TEMPORARIO">Inapto Temporário</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Ações */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-200">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex-1 sm:flex-none px-6"
            >
              Cancelar
            </Button>
            {fields.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.setValue("lancamentos", [])
                  clearDraft()
                  toast.info("Lista limpa e rascunho removido.")
                }}
                className="flex-1 sm:flex-none px-6 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Limpar Lista
              </Button>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || fields.length === 0}
            style={{ backgroundColor: "#97836a", color: "#fff" }}
            className="hover:opacity-90 w-full sm:w-auto px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando Lote...
              </>
            ) : (
              `Finalizar Lançamento (${fields.length})`
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
