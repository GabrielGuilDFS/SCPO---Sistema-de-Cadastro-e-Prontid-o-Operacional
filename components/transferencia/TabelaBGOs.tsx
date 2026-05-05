"use client"

import { useState, useTransition, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRightLeft, Search, Calendar, FileText, Loader2, Eye, Pencil, Trash2 } from "lucide-react"
import { getBGOsAgrupados, deletarLoteTransferencia, editarLoteTransferencia } from "@/app/actions/transferencia"
import { useDebounce } from "@/hooks/use-debounce"
import { DialogDetalhesBGO } from "./DialogDetalhesBGO"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface BGOAgrupado {
  numeroBGO: string
  dataTransferencia: Date
  quantidade: number
}

interface TabelaBGOsProps {
  bgosIniciais: BGOAgrupado[]
}

const formatDate = (value: string | Date): string => {
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

export function TabelaBGOs({ bgosIniciais }: TabelaBGOsProps) {
  const router = useRouter()
  const [bgos, setBgos] = useState<BGOAgrupado[]>(bgosIniciais)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Filtros
  const [bgoFilter, setBgoFilter] = useState("")
  const [dataInicial, setDataInicial] = useState("")
  const [dataFinal, setDataFinal] = useState("")

  const debouncedBgo = useDebounce(bgoFilter, 300)
  const debouncedDataInicial = useDebounce(dataInicial, 300)
  const debouncedDataFinal = useDebounce(dataFinal, 300)

  const [isPending, startTransition] = useTransition()

  // Seleção para o modal de detalhes
  const [selectedBGO, setSelectedBGO] = useState<string | null>(null)

  // Estados para Edição
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [bgoParaEditar, setBgoParaEditar] = useState<BGOAgrupado | null>(null)
  const [editNovoBGO, setEditNovoBGO] = useState("")
  const [editNovaData, setEditNovaData] = useState("")

  // Estados para Exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bgoParaDeletar, setBgoParaDeletar] = useState<string | null>(null)

  const fetchBGOs = async (bgo: string, init: string, end: string) => {
    const result = await getBGOsAgrupados({
      bgo,
      dataInicial: init,
      dataFinal: end
    })
    setBgos(result as any[])
  }

  // Efeito principal de busca reativa
  useEffect(() => {
    startTransition(() => {
      fetchBGOs(debouncedBgo, debouncedDataInicial, debouncedDataFinal)
    })
  }, [debouncedBgo, debouncedDataInicial, debouncedDataFinal])

  const handleClear = async () => {
    setBgoFilter("")
    setDataInicial("")
    setDataFinal("")
    setLoading(true)
    const result = await getBGOsAgrupados()
    setBgos(result as any[])
    setLoading(false)
  }

  const handleOpenEdit = (bgo: BGOAgrupado) => {
    setBgoParaEditar(bgo)
    setEditNovoBGO(bgo.numeroBGO)
    // Format date to YYYY-MM-DD
    const dateObj = new Date(bgo.dataTransferencia)
    const year = dateObj.getUTCFullYear()
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getUTCDate()).padStart(2, '0')
    setEditNovaData(`${year}-${month}-${day}`)
    setEditDialogOpen(true)
  }

  const handleConfirmEdit = async () => {
    if (!bgoParaEditar) return
    setActionLoading(true)
    const res = await editarLoteTransferencia(bgoParaEditar.numeroBGO, editNovoBGO, editNovaData)
    if (res.success) {
      toast.success(res.message)
      setEditDialogOpen(false)
      startTransition(() => {
        fetchBGOs(debouncedBgo, debouncedDataInicial, debouncedDataFinal)
      })
      router.refresh()
    } else {
      toast.error(res.error)
    }
    setActionLoading(false)
  }

  const handleOpenDelete = (numeroBGO: string) => {
    setBgoParaDeletar(numeroBGO)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!bgoParaDeletar) return
    setActionLoading(true)
    const res = await deletarLoteTransferencia(bgoParaDeletar)
    if (res.success) {
      toast.success(res.message)
      setDeleteDialogOpen(false)
      startTransition(() => {
        fetchBGOs(debouncedBgo, debouncedDataInicial, debouncedDataFinal)
      })
      router.refresh()
    } else {
      toast.error(res.error)
    }
    setActionLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      <div className="bg-[#3c342a] px-6 py-4 flex items-center gap-3 shrink-0">
        <div className="h-9 w-9 rounded-full bg-[#97836a]/20 flex items-center justify-center">
          <ArrowRightLeft className="h-4 w-4 text-[#cca471]" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-base">Histórico de Transferências (BGOs)</h3>
          <p className="text-slate-400 text-xs">Visualize os lotes e policiais transferidos</p>
        </div>
      </div>

      <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por Nº do BGO..."
              className="pl-9 h-9"
              value={bgoFilter}
              onChange={(e) => setBgoFilter(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              className="h-9 w-36" 
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
            />
            <span className="text-sm text-slate-500">até</span>
            <Input 
              type="date" 
              className="h-9 w-36"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleClear} variant="outline" className="h-9">Limpar Filtros</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 relative">
        <Table className={cn("transition-opacity duration-300", isPending || loading ? "opacity-40 pointer-events-none" : "opacity-100")}>
          <TableHeader>
            <TableRow>
              <TableHead>Número do BGO</TableHead>
              <TableHead>Data de Publicação</TableHead>
              <TableHead className="text-center">Qtd. Policiais</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400 mx-auto" />
                </TableCell>
              </TableRow>
            ) : bgos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="h-8 w-8 text-slate-300 mb-2" />
                    <p>Nenhum BGO encontrado com os filtros atuais.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              bgos.map((bgo, idx) => (
                <TableRow key={`${bgo.numeroBGO}-${idx}`} className="hover:bg-slate-50">
                  <TableCell className="font-semibold text-[#3c342a]">
                    {bgo.numeroBGO}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(bgo.dataTransferencia)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      {bgo.quantidade} militar(es)
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedBGO(bgo.numeroBGO)}
                        className="text-[#97836a] hover:text-[#3c342a] hover:bg-[#97836a]/10"
                        title="Ver Detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenEdit(bgo)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        title="Editar Lote"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenDelete(bgo.numeroBGO)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        title="Excluir Lote"
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

      <DialogDetalhesBGO 
        numeroBGO={selectedBGO} 
        onClose={() => setSelectedBGO(null)} 
        onUpdate={() => {
          startTransition(() => {
            fetchBGOs(debouncedBgo, debouncedDataInicial, debouncedDataFinal)
          })
        }} 
      />

      {/* Modal de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lote de Transferências</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Número do BGO</Label>
              <Input 
                value={editNovoBGO} 
                onChange={e => setEditNovoBGO(e.target.value)} 
                placeholder="Ex: BGO Nº 123/2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Publicação</Label>
              <Input 
                type="date" 
                value={editNovaData} 
                onChange={e => setEditNovaData(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={actionLoading}>Cancelar</Button>
            <Button onClick={handleConfirmEdit} disabled={actionLoading || !editNovoBGO || !editNovaData}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lote de Transferências?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente todas as transferências vinculadas ao <strong>{bgoParaDeletar}</strong>.
              <br/><br/>
              A lotação de todos os policiais deste lote será revertida para a unidade de origem anterior.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 focus:ring-red-600">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Excluir Lote
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}
