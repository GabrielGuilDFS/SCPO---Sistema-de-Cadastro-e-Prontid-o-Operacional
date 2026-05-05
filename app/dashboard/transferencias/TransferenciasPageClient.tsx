"use client"

import { TransferenciaLoteForm } from "@/components/transferencia/TransferenciaLoteForm"
import { TabelaBGOs } from "@/components/transferencia/TabelaBGOs"

interface Policial {
  id: number
  nomeCompleto: string
  nomeGuerra: string | null
  matricula: string
  grauHierarquico: string | null
  subunidadeId: number | null
  subunidade: { nome: string; sigla: string } | null
}

interface Subunidade {
  id: number
  nome: string
  sigla: string
}

interface BGOAgrupado {
  numeroBGO: string
  dataTransferencia: Date
  quantidade: number
}

interface TransferenciasPageClientProps {
  subunidades: Subunidade[]
  policiais: Policial[]
  bgosIniciais: BGOAgrupado[]
}

export function TransferenciasPageClient({
  subunidades,
  policiais,
  bgosIniciais,
}: TransferenciasPageClientProps) {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full pb-10 items-stretch">
      {/* ── Formulário de Nova Transferência em Lote ─────────────────────── */}
      <div className="w-full">
        <TransferenciaLoteForm 
          policiais={policiais} 
          subunidades={subunidades} 
        />
      </div>

      {/* ── Histórico Agrupado (BGOs) ────────────────────────────────────── */}
      <div className="w-full min-h-[500px]">
        <TabelaBGOs bgosIniciais={bgosIniciais} />
      </div>
    </div>
  )
}
