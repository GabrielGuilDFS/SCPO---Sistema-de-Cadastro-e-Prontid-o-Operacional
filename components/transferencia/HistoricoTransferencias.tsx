"use client"

import { ArrowRight, ArrowRightLeft, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface TransferenciaItem {
  id: number
  dataTransferencia: string | Date
  tipoTransferencia: string
  numeroBGO: string
  subunidadeDestino: { nome: string; sigla: string } | null
  subunidadeOrigem: { nome: string; sigla: string } | null
}

interface HistoricoTransferenciasProps {
  transferencias: TransferenciaItem[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const formatDate = (value: string | Date): string => {
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" })
}

const TIPO_LABELS: Record<string, string> = {
  INTERNA: "Interna",
  EXTERNA: "Externa",
}

const TIPO_COLORS: Record<string, string> = {
  INTERNA: "bg-blue-50 text-blue-700 border-blue-200",
  EXTERNA: "bg-amber-50 text-amber-700 border-amber-200",
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export function HistoricoTransferencias({ transferencias }: HistoricoTransferenciasProps) {
  if (!transferencias || transferencias.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 p-10 text-center">
        <ArrowRightLeft className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">
          Nenhuma transferência registrada.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          As movimentações entre subunidades aparecerão aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {transferencias.map((t, index) => {
        const isFirst = index === 0
        const isLast = index === transferencias.length - 1

        return (
          <div key={t.id} className="relative flex gap-4">
            {/* Linha vertical da timeline */}
            <div className="flex flex-col items-center">
              {/* Nó/círculo */}
              <div
                className={`relative z-10 h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  isFirst
                    ? "bg-[#97836a] border-[#97836a] text-white"
                    : "bg-white border-slate-300 text-slate-400"
                }`}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </div>
              {/* Linha conectora */}
              {!isLast && (
                <div className="w-0.5 flex-1 bg-slate-200" />
              )}
            </div>

            {/* Conteúdo do item */}
            <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
              <div
                className={`rounded-lg border p-4 transition-colors ${
                  isFirst
                    ? "bg-[#97836a]/5 border-[#97836a]/20"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* De → Para */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-sm font-medium text-slate-600">
                    {t.subunidadeOrigem
                      ? `${t.subunidadeOrigem.nome} (${t.subunidadeOrigem.sigla})`
                      : "Sem lotação anterior"}
                  </span>
                  <ArrowRight className="h-4 w-4 text-[#97836a] shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">
                    {t.subunidadeDestino
                      ? `${t.subunidadeDestino.nome} (${t.subunidadeDestino.sigla})`
                      : "—"}
                  </span>
                </div>

                {/* Metadados */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-slate-500">
                    {formatDate(t.dataTransferencia)}
                  </span>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 ${
                      TIPO_COLORS[t.tipoTransferencia] || "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {TIPO_LABELS[t.tipoTransferencia] || t.tipoTransferencia}
                  </Badge>

                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <FileText className="h-3 w-3" />
                    BGO: {t.numeroBGO}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
