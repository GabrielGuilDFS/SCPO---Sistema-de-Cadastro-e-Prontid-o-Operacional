"use client"

import { useState, useMemo, useTransition, useCallback, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PolicialViewModal } from "@/components/policial/PolicialViewModal"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { buscarPoliciais } from "@/app/actions/policiais"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface PoliceGridProps {
  policiais: any[]
  subunidades?: { id: number; nome: string }[]
  funcoes?: { id: number; funcao: string }[]
  highlight?: boolean
  sessionMatricula?: string
}

// ---------------------------------------------------------------------------
// Helpers locais
// ---------------------------------------------------------------------------

const GRAU_SIGLA: Record<string, string> = {
  SOLDADO: "SD",
  CABO: "CB",
  SARGENTO: "SGT",
  SUBTENENTE: "SUB TEN",
  TENENTE: "TEN",
  CAPITAO: "CAP",
  MAJOR: "MAJ",
  TENENTE_CORONEL: "TEN CEL",
  CORONEL: "CEL",
}

function buildCracha(policial: any): string {
  const sigla = GRAU_SIGLA[policial.grauHierarquico ?? ""] ?? ""
  const guerra = policial.nomeGuerra || policial.nomeCompleto?.split(" ")[0] || ""
  return [sigla, sigla ? "PM" : "", guerra].filter(Boolean).join(" ")
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function PoliceGrid({ policiais, subunidades = [], funcoes = [], highlight = false, sessionMatricula }: PoliceGridProps) {
  const [selectedPolicial, setSelectedPolicial] = useState<any | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleOpenModal = (policial: any) => {
    setSelectedPolicial(policial)
    setIsOpen(true)
  }

  const handleCloseModal = () => {
    setIsOpen(false)
    setTimeout(() => setSelectedPolicial(null), 300)
  }

  // Debounced server-side search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const results = await buscarPoliciais(query)
        setSearchResults(results as any[])
      })
    }, 400)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const displayPoliciais = searchResults !== null ? searchResults : policiais
  const sectionTitle = searchQuery.trim()
    ? `Resultado da Busca${!isPending && searchResults ? ` (${searchResults.length})` : ''}`
    : "Efetivo Recente"

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-semibold text-white text-lg">{sectionTitle}</h3>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nome ou matrícula..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 bg-white border-none shadow-sm focus-visible:ring-[#cca471]"
            />
            {isPending && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#cca471] animate-spin" />
            )}
          </div>
        </div>

        {displayPoliciais.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-center shadow-inner">
            <p className="text-slate-600 font-medium">
              {isPending ? "Buscando policiais..." : "Nenhum militar encontrado com estes critérios."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayPoliciais.map((policial) => {
              const cracha = buildCracha(policial)
              const iniciais = policial.nomeCompleto?.substring(0, 2).toUpperCase() ?? "PM"
              const companhia = policial.subunidade?.nome ?? "Sem Cia"
              const postoAtual: string | null = policial.postoAtual ?? null

              return (
                <Card
                  key={policial.id}
                  onClick={() => handleOpenModal(policial)}
                  className={`border-2 shadow-sm hover:shadow-md transition-all bg-white overflow-hidden group cursor-pointer hover:border-[#97836a] ${highlight && policiais.length === 1 ? "border-[#cca471] ring-2 ring-[#cca471]/20 scale-[1.02]" : "border-black"
                    }`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center p-4 gap-4">
                      {/* Avatar com dot de status */}
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12 border-2 border-black shadow-sm">
                          <AvatarImage
                            src={policial.imagemUrl || ""}
                            alt={policial.nomeCompleto}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-slate-200 text-slate-700 font-bold text-sm">
                            {iniciais}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${policial.status === "pronto"
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                            }`}
                          title={policial.status === "pronto" ? "Em Prontidão" : "Afastado"}
                        />
                      </div>

                      {/* Informações principais */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-bold text-slate-700 text-sm group-hover:text-[#97836a] transition-colors truncate">
                          {cracha || policial.nomeCompleto}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[120px]">
                            {companhia}
                          </span>
                          {policial.idade > 0 && (
                            <>
                              <span>•</span>
                              <span>{policial.idade} anos</span>
                            </>
                          )}
                        </div>
                        {/* Posto de Serviço do Pecúlio */}
                        <div className="mt-1 flex items-center gap-1">
                          {postoAtual ? (
                            <span className="text-[10px] bg-[#97836a]/10 text-[#7a6656] px-1.5 py-0.5 rounded font-medium truncate max-w-[150px]">
                              📍 {postoAtual}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Não Escalado
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                          MAT: {policial.matricula}
                        </span>
                      </div>

                      {/* Indicador de clique */}
                      <span className="text-slate-300 group-hover:text-[#97836a] transition-colors text-xs shrink-0">
                        ›
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de visualização do perfil */}
      <PolicialViewModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        policial={selectedPolicial}
        subunidades={subunidades}
        funcoes={funcoes}
        sessionMatricula={sessionMatricula}
      />
    </>
  )
}
