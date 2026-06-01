"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Loader2, ArrowRightLeft, Save } from "lucide-react"
import { registrarTransferenciasEmLote, updateTransferenciaIndividual } from "@/app/actions/transferencia"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// ---------------------------------------------------------------------------
// Schema Zod — campos de BGO/Data são opcionais (validados apenas na criação)
// ---------------------------------------------------------------------------

const formSchema = z.object({
  subunidadeDestinoId: z.number({ message: "Selecione a subunidade de destino" }),
  tipoTransferencia: z.enum(["INTERNA", "EXTERNA"], { message: "Selecione o tipo" }),
  numeroBGO: z.string().optional(),
  dataTransferencia: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

interface TransferenciaInitialData {
  id: number
  subunidadeDestinoId: number
  tipoTransferencia: "INTERNA" | "EXTERNA"
  numeroBGO?: string
  dataTransferencia?: string | Date
}

interface TransferenciaFormProps {
  policialId: number
  policialSubunidadeId?: number | null
  subunidades: { id: number; nome: string; sigla: string }[]
  onSuccess?: () => void
  onCancel?: () => void
  /** Dados iniciais para modo de edição */
  initialData?: TransferenciaInitialData
  hideBGOFields?: boolean
}

export function TransferenciaForm({
  policialId,
  policialSubunidadeId,
  subunidades,
  onSuccess,
  onCancel,
  initialData,
  hideBGOFields,
}: TransferenciaFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditMode = !!initialData
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subunidadeDestinoId: initialData?.subunidadeDestinoId ?? undefined,
      tipoTransferencia: initialData?.tipoTransferencia ?? undefined,
      numeroBGO: "",
      dataTransferencia: "",
    },
  })

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      if (isEditMode) {
        // Modo edição: atualizar transferência existente
        const result = await updateTransferenciaIndividual(
          initialData.id,
          data.subunidadeDestinoId,
          data.tipoTransferencia as "INTERNA" | "EXTERNA"
        )

        if (result.success) {
          toast.success("Transferência Atualizada", {
            description: result.message,
          })
          if (onSuccess) onSuccess()
          else setTimeout(() => router.push("/dashboard/transferencias"), 1500)
        } else {
          toast.error("Erro na Atualização", {
            description: result.error,
          })
        }
      } else {
        // Validação client-side para campos obrigatórios em modo criação
        if (!data.numeroBGO || data.numeroBGO.trim() === "") {
          form.setError("numeroBGO", { message: "O número do BGO é obrigatório" })
          setLoading(false)
          return
        }
        if (!data.dataTransferencia || data.dataTransferencia.trim() === "") {
          form.setError("dataTransferencia", { message: "A data é obrigatória" })
          setLoading(false)
          return
        }

        // Modo criação: registrar nova transferência
        const result = await registrarTransferenciasEmLote({
          numeroBGO: data.numeroBGO,
          dataTransferencia: data.dataTransferencia,
          transferencias: [
            {
              policialId,
              subunidadeDestinoId: data.subunidadeDestinoId,
              tipoTransferencia: data.tipoTransferencia as any,
            }
          ]
        })

        if (result.success) {
          toast.success("Transferência Registrada", {
            description: result.message,
          })
          if (onSuccess) onSuccess()
          else setTimeout(() => router.push("/dashboard/transferencias"), 1500)
        } else {
          toast.error("Erro na Transferência", {
            description: result.error,
          })
        }
      }
    } catch (error) {
      toast.error("Erro inesperado ao processar transferência.")
    } finally {
      setLoading(false)
    }
  }

  // Filtra a subunidade atual do policial do select de destino
  const subunidadesDestino = subunidades.filter(s => s.id !== policialSubunidadeId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="h-10 w-10 rounded-full bg-[#97836a]/10 flex items-center justify-center">
          {isEditMode
            ? <Save className="h-5 w-5 text-[#97836a]" />
            : <ArrowRightLeft className="h-5 w-5 text-[#97836a]" />
          }
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            {isEditMode ? "Editar Transferência" : "Registrar Nova Transferência"}
          </h3>
          <p className="text-xs text-slate-500">
            {isEditMode
              ? "Altere o destino ou tipo da transferência selecionada."
              : "Preencha os dados abaixo para registrar a movimentação do policial."
            }
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Subunidade de Destino */}
            <FormField
              control={form.control}
              name="subunidadeDestinoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subunidade de Destino</FormLabel>
                  <Select
                    onValueChange={(val) => val && field.onChange(parseInt(val))}
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Selecione a subunidade">
                          {field.value
                            ? (() => {
                              const sub = subunidades.find(s => s.id === field.value)
                              return sub ? `${sub.nome} (${sub.sigla})` : ""
                            })()
                            : ""}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      position="popper"
                      sideOffset={4}
                      align="start"
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      {subunidadesDestino.map(sub => (
                        <SelectItem key={sub.id} value={sub.id.toString()}>
                          <span className="truncate whitespace-nowrap">
                            {sub.nome} ({sub.sigla})
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Transferência */}
            <FormField
              control={form.control}
              name="tipoTransferencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Transferência</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Selecione o tipo">
                          {field.value === "INTERNA" ? "Interna" : field.value === "EXTERNA" ? "Externa" : ""}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      position="popper"
                      sideOffset={4}
                      className="w-[var(--radix-select-trigger-width)]"
                    >
                      <SelectItem value="INTERNA">Interna</SelectItem>
                      <SelectItem value="EXTERNA">Externa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos de BGO/Data */}
            {(!isEditMode && !hideBGOFields) ? (
              <>
                {/* Data da Transferência */}
                <FormField
                  control={form.control}
                  name="dataTransferencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Transferência</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-10"
                          max={new Date().toISOString().split("T")[0]}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Número do BGO */}
                <FormField
                  control={form.control}
                  name="numeroBGO"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do BGO</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: BGO Nº 042/2026"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : isEditMode && (
              <>
                {/* Contexto - Data da Transferência (Read-only) */}
                <div className="space-y-2">
                  <FormLabel className="text-slate-500">Data da Transferência</FormLabel>
                  <Input
                    type="date"
                    className="h-10 bg-slate-50 text-slate-500 cursor-not-allowed"
                    disabled
                    value={initialData?.dataTransferencia ? new Date(initialData.dataTransferencia).toISOString().split("T")[0] : ""}
                  />
                </div>

                {/* Contexto - Número do BGO (Read-only) */}
                <div className="space-y-2">
                  <FormLabel className="text-slate-500">Número do BGO</FormLabel>
                  <Input
                    className="h-10 bg-slate-50 text-slate-500 cursor-not-allowed"
                    disabled
                    value={initialData?.numeroBGO || ""}
                  />
                </div>
              </>
            )}
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            {onCancel ? (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/transferencias")}>
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading ? true : undefined}
              style={{ backgroundColor: "#97836a", color: "#fff" }}
              className="hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? "Salvando..." : "Registrando..."}
                </>
              ) : (
                <>
                  {isEditMode
                    ? <><Save className="h-4 w-4 mr-2" /> Salvar Alterações</>
                    : <><ArrowRightLeft className="h-4 w-4 mr-2" /> Confirmar Transferência</>
                  }
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
