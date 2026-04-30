"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardChartsData {
  cobertura: { comPeculio: number; semPeculio: number }
  prontidao: { prontos: number; outros: number }
  atividade: { ativos: number; inativos: number }
}

interface DashboardChartsProps {
  data: DashboardChartsData
}

// ---------------------------------------------------------------------------
// Chart Configs
// ---------------------------------------------------------------------------

const coberturaConfig = {
  valor: { label: "Quantidade" },
  comPeculio: { label: "Com Pecúlio", color: "#97836a" },
  semPeculio: { label: "Sem Pecúlio", color: "#e2dcd5" },
} satisfies ChartConfig

const prontidaoConfig = {
  valor: { label: "Quantidade" },
  prontos: { label: "Prontos", color: "#10b981" },
  outros: { label: "Outras Situações", color: "#f59e0b" },
} satisfies ChartConfig

const atividadeConfig = {
  valor: { label: "Quantidade" },
  ativos: { label: "Ativos", color: "#3c342a" },
  inativos: { label: "Inativos", color: "#cbd5e1" },
} satisfies ChartConfig

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DashboardCharts({ data }: DashboardChartsProps) {
  const coberturaData = [
    { name: "Com Pecúlio", valor: data.cobertura.comPeculio, fill: "#97836a" },
    { name: "Sem Pecúlio", valor: data.cobertura.semPeculio, fill: "#e2dcd5" },
  ]

  const prontidaoData = [
    { name: "Prontos", valor: data.prontidao.prontos, fill: "#10b981" },
    { name: "Outras Sit.", valor: data.prontidao.outros, fill: "#f59e0b" },
  ]

  const atividadeData = [
    { name: "Ativos", valor: data.atividade.ativos, fill: "#3c342a" },
    { name: "Inativos", valor: data.atividade.inativos, fill: "#cbd5e1" },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">

      {/* Gráfico A: Cobertura de Pecúlio */}
      <Card className="border-2 border-black shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">
            Cobertura de Pecúlio
          </CardTitle>
          <p className="text-[10px] text-slate-400">Com vs Sem lançamento no mês</p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={coberturaConfig} className="h-[180px] w-full">
            <BarChart data={coberturaData} barCategoryGap="30%">
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(151,131,106,0.08)" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="valor"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ChartContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#97836a]" />
              Com Pecúlio
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#e2dcd5]" />
              Sem Pecúlio
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico B: Prontidão Operacional */}
      <Card className="border-2 border-black shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">
            Prontidão Operacional
          </CardTitle>
          <p className="text-[10px] text-slate-400">Prontos vs Afastados / Férias / Licença</p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={prontidaoConfig} className="h-[180px] w-full">
            <BarChart data={prontidaoData} barCategoryGap="30%">
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(16,185,129,0.08)" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="valor"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ChartContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Prontos
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              Outras Sit.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico C: Status de Atividade */}
      <Card className="border-2 border-black shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">
            Status de Atividade
          </CardTitle>
          <p className="text-[10px] text-slate-400">Policiais Ativos vs Inativos/Reserva</p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={atividadeConfig} className="h-[180px] w-full">
            <BarChart data={atividadeData} barCategoryGap="30%">
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(60,52,42,0.08)" }}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar
                dataKey="valor"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ChartContainer>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#3c342a]" />
              Ativos
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
              Inativos
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
