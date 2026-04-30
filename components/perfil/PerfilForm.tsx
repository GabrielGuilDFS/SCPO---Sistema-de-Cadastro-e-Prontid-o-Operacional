"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { atualizarSenha } from "@/app/actions/perfil"
import { toast } from "sonner"
import { Loader2, Lock, Eye, EyeOff } from "lucide-react"

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual"),
  novaSenha: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string().min(1, "Confirme a nova senha"),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
})

type SenhaFormValues = z.infer<typeof senhaSchema>

export function PerfilForm() {
  const [loading, setLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const form = useForm<SenhaFormValues>({
    resolver: zodResolver(senhaSchema),
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    },
  })

  async function onSubmit(data: SenhaFormValues) {
    setLoading(true)
    try {
      const result = await atualizarSenha(data.senhaAtual, data.novaSenha)

      if (result.success) {
        toast.success("Senha atualizada", {
          description: result.message,
        })
        form.reset()
      } else {
        toast.error("Erro na atualização", {
          description: result.message,
        })
      }
    } catch (error) {
      toast.error("Erro inesperado ao atualizar a senha.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="senhaAtual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-700 font-semibold">Senha Atual</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={showCurrent ? "text" : "password"}
                      placeholder="Digite sua senha atual"
                      className="h-11 pr-10"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-semibold">Nova Senha</p>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="novaSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Nova Senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showNew ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          className="h-11 pr-10"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmarSenha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Confirmar Nova Senha</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Repita a nova senha"
                          className="h-11 pr-10"
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#3c342a] hover:bg-[#2a2218] text-white px-8 h-11"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Alterar Senha
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
