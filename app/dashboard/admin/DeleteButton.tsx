"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  excluirSubunidade, 
  excluirPosto, 
  excluirFuncao 
} from "@/app/admin/actions"
import { ConfirmDelete } from "./ConfirmDelete"
import { toast } from "sonner"

interface DeleteButtonProps {
  id: number
  type: "subunidade" | "posto" | "funcao"
  label: string
}

export function DeleteButton({ id, type, label }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      let result
      if (type === "subunidade") result = await excluirSubunidade(id)
      else if (type === "posto") result = await excluirPosto(id)
      else result = await excluirFuncao(id)

      if (result.success) {
        toast.success("Registro excluído com sucesso!")
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Erro inesperado ao excluir registro.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDelete
      title={`Excluir ${type === "subunidade" ? "Subunidade" : type === "posto" ? "Posto" : "Função"}`}
      description={`Tem certeza que deseja excluir ${label}? Esta ação não poderá ser desfeita.`}
      onConfirm={handleDelete}
      loading={loading}
    />
  )
}
