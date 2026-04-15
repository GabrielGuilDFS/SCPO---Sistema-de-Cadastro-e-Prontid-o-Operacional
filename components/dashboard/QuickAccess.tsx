"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowRightLeft, History, Home } from "lucide-react"

const shortcuts = [
  {
    title: "Gestão de Transferências",
    description: "Movimentação de efetivo",
    icon: ArrowRightLeft,
    color: "bg-[#97836a]",
    url: "#"
  },
  {
    title: "Promoções e Histórico",
    description: "Ascensão e ficha militar",
    icon: History,
    color: "bg-[#97836a]",
    url: "#"
  },
  {
    title: "Endereços/Dependentes",
    description: "Cadastro familiar e contato",
    icon: Home,
    color: "bg-[#97836a]",
    url: "#"
  }
]

export function QuickAccess() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-white text-lg mb-1">Acesso Rápido</h3>
      <div className="grid gap-3">
        {shortcuts.map((shortcut, idx) => (
          <Card key={idx} className="group border-2 border-black shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] bg-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl text-white ${shortcut.color} shadow-inner`}>
                <shortcut.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 text-sm group-hover:text-[#97836a] transition-colors">{shortcut.title}</h4>
                <p className="text-xs text-slate-500">{shortcut.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
