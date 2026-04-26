"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ShieldAlert, ShieldCheck, Users } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface KPIBoardProps {
  efetivoTotal: number
  totalProntos: number
  totalAfastados: number
  totalLancamentos: number
  dataDistribuicao: { name: string; value: number; color: string }[]
}

const chartConfig = {
  value: {
    label: "Efetivo",
  },
}

export function KPIBoard({ efetivoTotal, totalProntos, totalAfastados, totalLancamentos, dataDistribuicao }: KPIBoardProps) {
  const cobertura = efetivoTotal > 0 ? Math.round((totalLancamentos / efetivoTotal) * 100) : 0
  const taxaProntidao = efetivoTotal > 0 ? totalProntos / efetivoTotal : 0
  const prontidaoSaudavel = taxaProntidao >= 0.70

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

      {/* Efetivo Total (RH) */}
      <Card className="border-2 border-black shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Efetivo Total</CardTitle>
          <Users className="h-4 w-4 text-[#97836a]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{efetivoTotal}</div>
          <p className="text-xs text-muted-foreground mt-1">Militares no cadastro de RH</p>

          {/* Barra de cobertura de pecúlio */}
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{totalLancamentos} pecúlios lançados</span>
              <span className={cobertura >= 100 ? "text-emerald-500 font-semibold" : "text-amber-500 font-semibold"}>
                {cobertura}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${cobertura >= 100 ? "bg-emerald-500" : cobertura >= 70 ? "bg-amber-400" : "bg-rose-500"}`}
                style={{ width: `${Math.min(cobertura, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Em Prontidão — muda de cor abaixo de 70% */}
      <Card className={`border-2 shadow-md transition-all hover:shadow-lg ${prontidaoSaudavel ? "border-black" : "border-amber-400"}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Em Prontidão</CardTitle>
          <div className="flex items-center gap-1">
            {!prontidaoSaudavel && (
              <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                Alerta
              </span>
            )}
            <ShieldCheck className={`h-4 w-4 ${prontidaoSaudavel ? "text-emerald-500" : "text-amber-500"}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${prontidaoSaudavel ? "text-emerald-600" : "text-amber-600"}`}>
            {totalProntos}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {efetivoTotal > 0
              ? `${Math.round(taxaProntidao * 100)}% do efetivo cadastrado`
              : "Aptos para o serviço"}
          </p>
          {!prontidaoSaudavel && (
            <p className="text-[10px] text-amber-600 mt-1 font-medium">
              Abaixo de 70% — verificar escalas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Afastamentos */}
      <Card className="border-2 border-black shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Afastamentos</CardTitle>
          <ShieldAlert className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{totalAfastados}</div>
          <p className="text-xs text-muted-foreground mt-1">Férias, Licenças e LTS</p>
        </CardContent>
      </Card>

      {/* Gráfico de Distribuição por Posto (Pecúlio) */}
      <Card className="border-2 border-black shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Distribuição</CardTitle>
          <Shield className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          {dataDistribuicao.length > 0 ? (
            <>
              <div className="w-[80px] h-[80px]">
                <ChartContainer config={chartConfig} className="w-full h-full aspect-square">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie data={dataDistribuicao} dataKey="value" nameKey="name" innerRadius={20} outerRadius={40} stroke="none">
                      {dataDistribuicao.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="flex flex-col gap-1 text-[10px] text-slate-500">
                {dataDistribuicao.map((item, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate max-w-[90px]">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-400 italic w-full text-center">
              Nenhum pecúlio lançado este mês
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
