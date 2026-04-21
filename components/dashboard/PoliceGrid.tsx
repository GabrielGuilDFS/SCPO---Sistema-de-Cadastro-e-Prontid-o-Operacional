"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PolicialViewModal } from "@/components/policial/PolicialViewModal"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface PoliceGridProps {
  policiais: any[] // objeto completo do Prisma com relações
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

export function PoliceGrid({ policiais }: PoliceGridProps) {
  const [selectedPolicial, setSelectedPolicial] = useState<any | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const handleOpenModal = (policial: any) => {
    setSelectedPolicial(policial)
    setIsOpen(true)
  }

  const handleCloseModal = () => {
    setIsOpen(false)
    // Limpa o selecionado após a animação de fechamento
    setTimeout(() => setSelectedPolicial(null), 300)
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-white text-lg mb-1">Efetivo Recente</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {policiais.map((policial) => {
            const cracha = buildCracha(policial)
            const iniciais = policial.nomeCompleto?.substring(0, 2).toUpperCase() ?? "PM"
            const companhia = policial.subunidade?.nome ?? "Sem Cia"

            return (
              <Card
                key={policial.id}
                onClick={() => handleOpenModal(policial)}
                className="border-2 border-black shadow-sm hover:shadow-md transition-all bg-white overflow-hidden group cursor-pointer hover:border-[#97836a]"
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
                        className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          policial.status === "pronto"
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
      </div>

      {/* Modal de visualização do perfil */}
      <PolicialViewModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        policial={selectedPolicial}
      />
    </>
  )
}
