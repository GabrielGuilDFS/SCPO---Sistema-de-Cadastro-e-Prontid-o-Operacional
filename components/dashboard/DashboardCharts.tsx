"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DashboardChartsData {
  cobertura: { comPeculio: number; semPeculio: number }
  prontidao: { ativos: number; ferias: number; licencaPremio: number; licencaMedica: number }
  situacao: { aptoTotal: number; aptoRestricao: number; inapto: number }
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
  ativos: { label: "Ativos", color: "#3c342a" },
  ferias: { label: "Férias", color: "#97836a" },
  licencaPremio: { label: "L. Prêmio", color: "#cbd5e1" },
  licencaMedica: { label: "L. Médica", color: "#64748b" },
} satisfies ChartConfig

const situacaoConfig = {
  valor: { label: "Quantidade" },
  aptoTotal: { label: "Apto Total", color: "#10b981" },
  aptoRestricao: { label: "Apto Restrição", color: "#f59e0b" },
  inapto: { label: "Inapto", color: "#94a3b8" },
} satisfies ChartConfig


export function DashboardCharts({ data }: DashboardChartsProps) {
  const coberturaData = [
    { name: "Com Pecúlio", valor: data.cobertura.comPeculio, fill: "var(--color-comPeculio)", type: "comPeculio" },
    { name: "Sem Pecúlio", valor: data.cobertura.semPeculio, fill: "var(--color-semPeculio)", type: "semPeculio" },
  ]

  const prontidaoData = [
    { name: "Ativos", valor: data.prontidao.ativos, fill: "var(--color-ativos)", type: "ativos" },
    { name: "Férias", valor: data.prontidao.ferias, fill: "var(--color-ferias)", type: "ferias" },
    { name: "L. Prêmio", valor: data.prontidao.licencaPremio, fill: "var(--color-licencaPremio)", type: "licencaPremio" },
    { name: "L. Médica", valor: data.prontidao.licencaMedica, fill: "var(--color-licencaMedica)", type: "licencaMedica" },
  ]

  const situacaoData = [
    { name: "Apto Total", valor: data.situacao.aptoTotal, fill: "var(--color-aptoTotal)", type: "aptoTotal" },
    { name: "Restrição", valor: data.situacao.aptoRestricao, fill: "var(--color-aptoRestricao)", type: "aptoRestricao" },
    { name: "Inapto", valor: data.situacao.inapto, fill: "var(--color-inapto)", type: "inapto" },
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
            <BarChart
              data={coberturaData}
              barCategoryGap="30%"
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#00000093" />
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
                domain={[0, "dataMax + 2"]}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(151,131,106,0.08)" }}
                content={<ChartTooltipContent nameKey="type" />}
              />
              <Bar
                dataKey="valor"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                activeBar={{ fillOpacity: 1 }}
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
            <BarChart
              data={prontidaoData}
              barCategoryGap="30%"
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#00000083" />
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
                domain={[0, "dataMax + 2"]}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(16,185,129,0.08)" }}
                content={<ChartTooltipContent nameKey="type" />}
              />
              <Bar
                dataKey="valor"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                activeBar={{ fillOpacity: 0.8 }}
              />
            </BarChart>
          </ChartContainer>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#3c342a]" />
              Ativo
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#97836a]" />
              Férias
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#cbd5e1]" />
              Prêmio
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#64748b]" />
              Médica
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico C: Situação Operacional */}
      <Card className="border-2 border-black shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">
            Situação Operacional
          </CardTitle>
          <p className="text-[10px] text-slate-400">Aptidão física e restrições de saúde</p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={situacaoConfig} className="h-[180px] w-full">
            <BarChart
              data={situacaoData}
              barCategoryGap="30%"
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#00000083" />
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
                domain={[0, "dataMax + 2"]}
              />
              <ChartTooltip
                cursor={{ fill: "rgba(60,52,42,0.08)" }}
                content={<ChartTooltipContent nameKey="type" />}
              />
              <Bar
                dataKey="valor"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                activeBar={{ fillOpacity: 0.8 }}
              />
            </BarChart>
          </ChartContainer>
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Apto
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              Restrição
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
              Inapto
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
