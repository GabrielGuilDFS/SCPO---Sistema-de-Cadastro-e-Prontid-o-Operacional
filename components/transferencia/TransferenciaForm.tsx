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
import { Loader2, ArrowRightLeft } from "lucide-react"
import { registrarTransferenciasEmLote } from "@/app/actions/transferencia"
import { toast } from "sonner"

// ---------------------------------------------------------------------------
// Schema Zod
// ---------------------------------------------------------------------------

const formSchema = z.object({
  subunidadeDestinoId: z.number({ message: "Selecione a subunidade de destino" }),
  tipoTransferencia: z.enum(["INTERNA", "EXTERNA"], { message: "Selecione o tipo" }),
  numeroBGO: z.string().min(1, "O número do BGO é obrigatório"),
  dataTransferencia: z.string().min(1, "A data é obrigatória"),
})

type FormValues = z.infer<typeof formSchema>

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

const TIPO_LABELS: Record<string, string> = {
  INTERNA: "Interna",
  EXTERNA: "Externa",
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

interface TransferenciaFormProps {
  policialId: number
  policialSubunidadeId?: number | null
  subunidades: { id: number; nome: string; sigla: string }[]
  onSuccess?: () => void
  onCancel?: () => void
}

export function TransferenciaForm({
  policialId,
  policialSubunidadeId,
  subunidades,
  onSuccess,
  onCancel,
}: TransferenciaFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subunidadeDestinoId: undefined,
      tipoTransferencia: undefined,
      numeroBGO: "",
      dataTransferencia: "",
    },
  })

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
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
      } else {
        toast.error("Erro na Transferência", {
          description: result.error,
        })
      }
    } catch (error) {
      toast.error("Erro inesperado ao registrar transferência.")
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
          <ArrowRightLeft className="h-5 w-5 text-[#97836a]" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            Registrar Nova Transferência
          </h3>
          <p className="text-xs text-slate-500">
            Preencha os dados abaixo para registrar a movimentação do policial.
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
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
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
                  Registrando...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Confirmar Transferência
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
