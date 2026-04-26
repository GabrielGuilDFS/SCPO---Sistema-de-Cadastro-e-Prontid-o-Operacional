"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { cadastrarPeculio, getPoliciaisDisponiveis, checkPolicialDisponivel } from "@/app/actions/peculio"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  policialId: z.number({ message: "Selecione um policial" }),
  postoDeServicoId: z.number({ message: "Selecione um posto de serviço" }),
  disponibilidade: z.enum(["PRONTO", "INDISPONIVEL", "FORA_DE_ESCALA"], { message: "Selecione a disponibilidade" }),
  situacaoFuncional: z.enum(["ATIVO", "FERIAS", "LICENCA_PREMIO", "LICENCA_MEDICA"], { message: "Selecione a situação funcional" }),
  condicaoOperacional: z.enum(["APTO_TOTAL", "APTO_RESTRICAO", "INAPTO_TEMPORARIO"], { message: "Selecione a condição operacional" }),
  mes: z.number().min(1).max(12),
  ano: z.number().min(2024).max(2050),
  id: z.number().optional(),
}).superRefine(async (data, ctx) => {
  // Só realiza a checagem assíncrona se for um cadastro novo (sem ID).
  // Na edição, Mês, Ano e Policial já estão travados e a verificação no backend já é suficiente.
  if (!data.id && data.policialId && data.mes && data.ano) {
    const isAvailable = await checkPolicialDisponivel(data.policialId, data.mes, data.ano)
    if (!isAvailable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Este policial já possui prontidão lançada para o período selecionado no 20º BPM",
        path: ["policialId"]
      })
    }
  }
})

type FormValues = z.infer<typeof formSchema>

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
  isEditing?: boolean
  fixedPolicialId?: number
  initialData?: any
  onSuccess?: () => void
}

export function PeculioForm({
  policiais,
  postos,
  isEditing = false,
  fixedPolicialId,
  initialData,
  onSuccess
}: PeculioFormProps) {
  const [loading, setLoading] = useState(false)
  const [openPolicial, setOpenPolicial] = useState(false)
  const [availablePoliciais, setAvailablePoliciais] = useState<PolicialOption[]>(policiais)
  const [isLoadingPoliciais, setIsLoadingPoliciais] = useState(false)
  const router = useRouter()

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData?.id ?? undefined,
      policialId: fixedPolicialId || undefined,
      mes: initialData?.mes ?? currentMonth,
      ano: initialData?.ano ?? currentYear,
      disponibilidade: initialData?.disponibilidade ?? undefined,
      situacaoFuncional: initialData?.situacaoFuncional ?? undefined,
      condicaoOperacional: initialData?.condicaoOperacional ?? undefined,
      postoDeServicoId: initialData?.postoDeServicoId ?? undefined,
    },
  })

  const mesWatch = form.watch("mes")
  const anoWatch = form.watch("ano")
  const policialIdWatch = form.watch("policialId")

  useEffect(() => {
    async function loadPoliciais() {
      if (!mesWatch || !anoWatch) return;
      if (fixedPolicialId) return; 
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

      if (policialIdWatch && !mapped.find(p => p.id === policialIdWatch)) {
        form.setValue("policialId", undefined as any, { shouldValidate: true })
        toast.warning("Policial indisponível", {
          description: "O policial selecionado já possui pecúlio para este mês/ano."
        })
      }
      setIsLoadingPoliciais(false)
    }
    loadPoliciais()
  }, [mesWatch, anoWatch])

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      const result = await cadastrarPeculio(data)

      if (result?.error) {
        toast.error("Erro", {
          description: isEditing ? "Erro ao atualizar prontidão: verifique se os dados estão corretos" : result.error,
        })
        return
      }

      toast.success(isEditing ? "Prontidão atualizada com sucesso!" : "Pecúlio registrado com sucesso!")
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.log("Ação finalizada ou redirecionamento capturado.", error)
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!fixedPolicialId && (
            <FormField
              control={form.control}
              name="policialId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Policial</FormLabel>
                  <Popover open={openPolicial} onOpenChange={setOpenPolicial}>
                    <FormControl>
                      <PopoverTrigger
                        role="combobox"
                        className={cn(
                          buttonVariants({ variant: "outline" }),
                          "justify-between w-full h-10 px-4",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? (() => {
                            const p = policiais.find((policial) => policial.id === field.value)
                            return p ? `${p.grauHierarquico || ''} ${p.nomeGuerra || p.nomeCompleto} (${p.matricula})` : "Selecione o policial"
                          })()
                          : "Selecione o policial"}
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
                              availablePoliciais.map((policial) => (
                                <CommandItem
                                  value={`${policial.nomeCompleto} ${policial.nomeGuerra || ""} ${policial.matricula}`}
                                  key={policial.id}
                                  onSelect={() => {
                                    form.setValue("policialId", policial.id, { shouldValidate: true })
                                    setOpenPolicial(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      policial.id === field.value
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
          )}

          <FormField
            control={form.control}
            name="postoDeServicoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posto de Serviço</FormLabel>
                <Select onValueChange={(val) => val && field.onChange(parseInt(val))} value={field.value?.toString() || ""}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione o posto">
                        {field.value ? (() => {
                          const posto = postos.find(p => p.id === field.value);
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="mes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mês</FormLabel>
                <Select disabled={!!initialData} onValueChange={(val) => val && field.onChange(parseInt(val))} value={field.value?.toString() || ""}>
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
                <FormLabel>Ano</FormLabel>
                <Select disabled={!!initialData} onValueChange={(val) => val && field.onChange(parseInt(val))} value={field.value?.toString() || ""}>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="disponibilidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Disponibilidade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione">
                        {field.value === "PRONTO" ? "Pronto" : field.value === "INDISPONIVEL" ? "Indisponível" : field.value === "FORA_DE_ESCALA" ? "Fora de Escala" : ""}
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
            name="situacaoFuncional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Situação Funcional</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione">
                        {field.value === "ATIVO" ? "Ativo" : field.value === "FERIAS" ? "Férias" : field.value === "LICENCA_PREMIO" ? "Licença Prêmio" : field.value === "LICENCA_MEDICA" ? "Licença Médica" : ""}
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
            name="condicaoOperacional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condição Operacional</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Selecione">
                        {field.value === "APTO_TOTAL" ? "Apto Total" : field.value === "APTO_RESTRICAO" ? "Apto com Restrição" : field.value === "INAPTO_TEMPORARIO" ? "Inapto Temporário" : ""}
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

        <div className="flex justify-end pt-4 gap-2">
          {onSuccess && (
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              className="w-full md:w-auto px-8"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: "#97836a", color: "#fff" }}
            className="hover:opacity-90 w-full md:w-auto px-8"
          >
            {loading ? "Salvando..." : (isEditing ? "Salvar Alteração" : "Cadastrar Pecúlio")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
