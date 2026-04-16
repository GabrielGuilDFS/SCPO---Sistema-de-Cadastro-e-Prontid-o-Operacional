"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ShieldAlert, ShieldCheck, Users } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface KPIBoardProps {
  efetivoTotal: number;
  efetivoProntidao: number;
  efetivoAfastamento: number;
  dataDistribuicao: { name: string; value: number; color: string; }[];
}

const chartConfig = {
  value: {
    label: "Efetivo",
  },
}

export function KPIBoard({ efetivoTotal, efetivoProntidao, efetivoAfastamento, dataDistribuicao }: KPIBoardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Efetivo Total */}
      <Card className="border-2 border-black shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Efetivo Total</CardTitle>
          <Users className="h-4 w-4 text-[#97836a]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{efetivoTotal}</div>
          <p className="text-xs text-muted-foreground mt-1">Militares escalados</p>
        </CardContent>
      </Card>

      {/* Em Prontidão */}
      <Card className="border-2 border-black shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Em Prontidão</CardTitle>
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{efetivoProntidao}</div>
          <p className="text-xs text-muted-foreground mt-1">Aptos para o serviço</p>
        </CardContent>
      </Card>

      {/* Afastamentos */}
      <Card className="border-2 border-black shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Afastamentos</CardTitle>
          <ShieldAlert className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{efetivoAfastamento}</div>
          <p className="text-xs text-muted-foreground mt-1">Férias, Licenças e LTS</p>
        </CardContent>
      </Card>

      {/* Gráfico de Distribuição */}
      <Card className="border-2 border-black shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Distribuição</CardTitle>
          <Shield className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent className="flex items-center justify-between">
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
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}: {item.value}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
