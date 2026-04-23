"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Plus, Loader2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  criarSubunidade, criarPostoServico, criarFuncao,
  atualizarSubunidade, atualizarPosto, atualizarFuncao 
} from "@/app/admin/actions"
import { toast } from "sonner"

interface AdminModalsProps {
  type: "subunidade" | "posto" | "funcao"
  subunidades?: { id: number; nome: string; sigla: string }[]
  initialData?: any
  mode?: "create" | "edit"
}

export function AdminModals({ type, subunidades = [], initialData, mode = "create" }: AdminModalsProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [nome, setNome] = useState("")
  const [sigla, setSigla] = useState("")
  const [subId, setSubId] = useState("")

  useEffect(() => {
    if (open && initialData) {
      setNome(initialData.nome || initialData.funcao || "")
      setSigla(initialData.sigla || "")
      setSubId(initialData.subunidadeId?.toString() || "")
    } else if (!open && mode === "create") {
      setNome("")
      setSigla("")
      setSubId("")
    }
  }, [open, initialData, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let result
      if (mode === "create") {
        if (type === "subunidade") result = await criarSubunidade({ nome, sigla })
        else if (type === "posto") result = await criarPostoServico({ nome, subunidadeId: parseInt(subId) })
        else result = await criarFuncao({ funcao: nome })
      } else {
        const id = initialData.id
        if (type === "subunidade") result = await atualizarSubunidade(id, { nome, sigla })
        else if (type === "posto") result = await atualizarPosto(id, { nome, subunidadeId: parseInt(subId) })
        else result = await atualizarFuncao(id, { funcao: nome })
      }

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    } catch (err) {
      const msg = "Erro inesperado ao salvar os dados."
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          mode === "edit" ? (
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-[#97836a] hover:bg-slate-100">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="bg-[#cca471] hover:bg-[#97836a] text-[#3c342a] font-bold gap-2 shadow-lg">
              <Plus className="h-5 w-5" />
              {type === "subunidade" ? "Nova Unidade" : type === "posto" ? "Novo Posto" : "Nova Função"}
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-800">
              {mode === "create" ? "Cadastrar" : "Editar"} {type === "subunidade" ? "Subunidade" : type === "posto" ? "Posto de Serviço" : "Função"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" ? "Preencha os dados abaixo para adicionar um novo registro." : "Altere as informações abaixo para atualizar o registro."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-6">
            <div className="grid gap-2">
              <Label htmlFor="nome">{type === "funcao" ? "Nome da Função" : "Nome Completo"}</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder={type === "subunidade" ? "Ex: 1ª Companhia" : type === "posto" ? "Ex: VTR 9.2011" : "Ex: Armeiro"}
                required
              />
            </div>

            {type === "subunidade" && (
              <div className="grid gap-2">
                <Label htmlFor="sigla">Sigla / Abreviação</Label>
                <Input
                  id="sigla"
                  value={sigla}
                  onChange={(e) => setSigla(e.target.value)}
                  placeholder="Ex: 1ª CIA"
                  required
                />
              </div>
            )}

            {type === "posto" && (
              <div className="grid gap-2">
                <Label htmlFor="subunidade">Subunidade Vinculada</Label>
                <Select onValueChange={(val) => setSubId(val || "")} value={subId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {subunidades.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>
                        {sub.nome} ({sub.sigla})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm font-medium">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#3c342a] hover:bg-black text-white" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                mode === "create" ? "Finalizar Cadastro" : "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
