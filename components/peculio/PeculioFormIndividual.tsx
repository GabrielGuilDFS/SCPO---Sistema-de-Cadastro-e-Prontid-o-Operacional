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
import { cadastrarPeculio } from "@/app/actions/peculio"
import { toast } from "sonner"

const formSchema = z.object({
  policialId: z.number({ message: "Selecione um policial" }),
  postoDeServicoId: z.number({ message: "Selecione um posto de serviço" }),
  disponibilidade: z.enum(["PRONTO", "INDISPONIVEL", "FORA_DE_ESCALA"], { message: "Selecione a disponibilidade" }),
  situacaoFuncional: z.enum(["ATIVO", "FERIAS", "LICENCA_PREMIO", "LICENCA_MEDICA"], { message: "Selecione a situação funcional" }),
  condicaoOperacional: z.enum(["APTO_TOTAL", "APTO_RESTRICAO", "INAPTO_TEMPORARIO"], { message: "Selecione a condição operacional" }),
  mes: z.number().min(1).max(12),
  ano: z.number().min(2024).max(2050),
  id: z.number().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface PostoOption {
  id: number
  nome: string
  subunidade?: { nome: string } | null
}

interface PeculioFormIndividualProps {
  postos: PostoOption[]
  fixedPolicialId: number
  initialData?: any
  onSuccess?: () => void
}

/**
 * Formulário individual de pecúlio — usado dentro do PolicialViewModal
 * para edição/criação de pecúlio de um único policial.
 */
export function PeculioFormIndividual({
  postos,
  fixedPolicialId,
  initialData,
  onSuccess
}: PeculioFormIndividualProps) {
  const [loading, setLoading] = useState(false)

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: initialData?.id ?? undefined,
      policialId: fixedPolicialId,
      mes: initialData?.mes ?? currentMonth,
      ano: initialData?.ano ?? currentYear,
      disponibilidade: initialData?.disponibilidade ?? undefined,
      situacaoFuncional: initialData?.situacaoFuncional ?? undefined,
      condicaoOperacional: initialData?.condicaoOperacional ?? undefined,
      postoDeServicoId: initialData?.postoDeServicoId ?? undefined,
    },
  })

  async function onSubmit(data: FormValues) {
    setLoading(true)
    try {
      const result = await cadastrarPeculio(data)

      if (result?.error) {
        toast.error("Erro", {
          description: result.error,
        })
        return
      }

      toast.success(initialData ? "Prontidão atualizada com sucesso!" : "Pecúlio registrado com sucesso!")
      
      if (onSuccess) {
        onSuccess()
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
                  <SelectContent position="popper" sideOffset={4}>
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
                  <SelectContent position="popper" sideOffset={4}>
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
                  <SelectContent position="popper" sideOffset={4}>
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
                  <SelectContent position="popper" sideOffset={4}>
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
                  <SelectContent position="popper" sideOffset={4}>
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
                  <SelectContent position="popper" sideOffset={4}>
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
            {loading ? "Salvando..." : (initialData ? "Salvar Alteração" : "Cadastrar Pecúlio")}
          </Button>
        </div>
      </form>
    </Form>
  )
}
