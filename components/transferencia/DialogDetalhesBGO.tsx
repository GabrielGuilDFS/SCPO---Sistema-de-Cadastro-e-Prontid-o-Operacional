"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, Trash2, Edit } from "lucide-react"
import { getTransferenciasPorBGO, deletarTransferencia, updateTransferenciaIndividual, getSubunidadesOptions } from "@/app/actions/transferencia"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

interface DialogDetalhesBGOProps {
  numeroBGO: string | null
  onClose: () => void
  onUpdate?: () => void
}

const GRAU_SIGLA: Record<string, string> = {
  SOLDADO: "SD", CABO: "CB", SARGENTO: "SGT", SUBTENENTE: "SUB TEN",
  TENENTE: "TEN", CAPITAO: "CAP", MAJOR: "MAJ", TENENTE_CORONEL: "TEN CEL", CORONEL: "CEL",
}

export function DialogDetalhesBGO({ numeroBGO, onClose, onUpdate }: DialogDetalhesBGOProps) {
  const router = useRouter()
  const [transferencias, setTransferencias] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [busca, setBusca] = useState("")

  // Estado para exclusão
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [reverterLotacao, setReverterLotacao] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  // Estado para edição
  const [editData, setEditData] = useState<any | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editDestinoId, setEditDestinoId] = useState<string>("")
  const [editTipo, setEditTipo] = useState<"INTERNA" | "EXTERNA">("INTERNA")
  const [subunidades, setSubunidades] = useState<{ id: number, sigla: string }[]>([])

  useEffect(() => {
    getSubunidadesOptions().then(setSubunidades)
  }, [])

  useEffect(() => {
    if (numeroBGO) {
      carregarTransferencias()
    } else {
      setTransferencias([])
    }
  }, [numeroBGO])

  const carregarTransferencias = async () => {
    setLoading(true)
    const data = await getTransferenciasPorBGO(numeroBGO!)
    setTransferencias(data)
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const result = await deletarTransferencia(deleteId, reverterLotacao)
      if (result.success) {
        toast.success(result.message)
        await carregarTransferencias()
        onUpdate?.()
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Erro ao deletar transferência.")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleOpenEdit = (t: any) => {
    setEditData(t)
    setEditDestinoId(t.subunidadeDestinoId?.toString() || "")
    setEditTipo(t.tipoTransferencia)
  }

  const handleSaveEdit = async () => {
    if (!editData || !editDestinoId) return
    setIsEditing(true)
    try {
      const res = await updateTransferenciaIndividual(editData.id, parseInt(editDestinoId), editTipo)
      if (res.success) {
        toast.success(res.message)
        setEditData(null)
        await carregarTransferencias()
        onUpdate?.()
        router.refresh()
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      toast.error("Erro ao atualizar transferência.")
    } finally {
      setIsEditing(false)
    }
  }

  const filtrados = transferencias.filter(t => {
    const term = busca.toLowerCase()
    return (
      t.policial.nomeCompleto.toLowerCase().includes(term) ||
      (t.policial.nomeGuerra && t.policial.nomeGuerra.toLowerCase().includes(term)) ||
      t.policial.matricula.toLowerCase().includes(term)
    )
  })

  return (
    <>
      <Dialog open={!!numeroBGO} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl text-[#3c342a]">
              Detalhes do BGO: <span className="text-[#97836a]">{numeroBGO}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4 bg-slate-50">
            <div className="flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm">
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou matrícula..."
                  className="pl-9 h-9"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
              <div className="text-sm text-slate-500 font-medium">
                {filtrados.length} militar(es)
              </div>
            </div>

            <div className="flex-1 bg-white border rounded-md overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Policial</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filtrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                        Nenhum militar encontrado neste BGO.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtrados.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium text-sm text-slate-700">
                          {GRAU_SIGLA[t.policial.grauHierarquico ?? ""]} {t.policial.nomeGuerra || t.policial.nomeCompleto}
                        </TableCell>
                        <TableCell className="text-sm">{t.policial.matricula}</TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {t.subunidadeOrigem ? t.subunidadeOrigem.sigla : "—"}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-800">
                          {t.subunidadeDestino.sigla}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={t.tipoTransferencia === "INTERNA" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}>
                            {t.tipoTransferencia === "INTERNA" ? "Interna" : "Externa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {/* Edit feature */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-slate-600"
                              onClick={() => handleOpenEdit(t)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteId(t.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transferência?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o registro desta transferência do histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex items-start space-x-3 my-4 p-4 border rounded-md bg-amber-50/50">
            <Checkbox
              id="reverter"
              checked={reverterLotacao}
              onCheckedChange={(c) => setReverterLotacao(!!c)}
              className="mt-1 border-amber-600 data-[state=checked]:bg-amber-600 data-[state=checked]:text-white"
            />
            <div className="space-y-1">
              <label htmlFor="reverter" className="text-sm font-medium text-amber-900 cursor-pointer">
                Reverter Lotação
              </label>
              <p className="text-xs text-amber-700">
                Se marcado, a lotação atual do policial será revertida para a subunidade de origem desta transferência.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Edição Individual */}
      <Dialog open={!!editData} onOpenChange={(open) => !open && setEditData(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-[#3c342a]">Editar Transferência</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-slate-500 text-xs">Policial</Label>
              <div className="font-medium text-sm bg-slate-50 p-2 rounded border border-slate-100">
                {editData && `${GRAU_SIGLA[editData.policial.grauHierarquico ?? ""]} ${editData.policial.nomeGuerra || editData.policial.nomeCompleto} (${editData.policial.matricula})`}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Subunidade de Destino</Label>
              <Select value={editDestinoId} onValueChange={(val) => { if (val) setEditDestinoId(val as string) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o destino">
                    {editDestinoId
                      ? subunidades.find(s => s.id.toString() === editDestinoId)?.sigla
                      : "Selecione o destino"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {subunidades.map(sub => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>
                      {sub.sigla}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Tipo de Transferência</Label>
              <Select value={editTipo} onValueChange={(val) => { if (val) setEditTipo(val as "INTERNA" | "EXTERNA") }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo">
                    {editTipo === "INTERNA" ? "Interna" : "Externa"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNA">Interna</SelectItem>
                  <SelectItem value="EXTERNA">Externa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditData(null)} disabled={isEditing}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isEditing}
              style={{ backgroundColor: "#97836a", color: "#fff" }}
              className="hover:opacity-90"
            >
              {isEditing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isEditing ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
