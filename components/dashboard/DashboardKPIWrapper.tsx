"use client"

import { useState } from "react"
import { KPIBoard, type DrilldownType } from "./KPIBoard"
import { DashboardDrilldown } from "./DashboardDrilldown"

interface DashboardKPIWrapperProps {
  efetivoTotal: number
  totalProntos: number
  totalAfastados: number
  totalLancamentos: number
  dataDistribuicao: { name: string; value: number; color: string }[]
}

export function DashboardKPIWrapper(props: DashboardKPIWrapperProps) {
  const [activeDrilldown, setActiveDrilldown] = useState<DrilldownType | null>(null)

  return (
    <>
      <KPIBoard
        {...props}
        onCardClick={(tipo) => setActiveDrilldown(tipo)}
      />
      <DashboardDrilldown
        tipo={activeDrilldown}
        onClose={() => setActiveDrilldown(null)}
      />
    </>
  )
}
