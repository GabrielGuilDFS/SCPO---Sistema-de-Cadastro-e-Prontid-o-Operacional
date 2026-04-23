"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowRightLeft, History, Home, UserPlus, UserX, Settings } from "lucide-react"
import Link from "next/link"

const shortcuts = [
  {
    title: "Novo Policial (RH)",
    description: "Cadastro de dados pessoais",
    icon: UserPlus,
    color: "bg-[#97836a]",
    url: "/dashboard/cadastro-policial"
  },
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
    title: "Agentes Inativos",
    description: "Gestão de baixas e reativação",
    icon: UserX,
    color: "bg-[#97836a]",
    url: "/dashboard/policiais-inativos"
  }
]

export function QuickAccess({ userProfile }: { userProfile?: string }) {
  const allShortcuts = [
    ...shortcuts,
    ...(userProfile === "ADMINISTRADOR" ? [{
      title: "Painel Administrativo",
      description: "Gestão de Unidades e Postos",
      icon: Settings,
      color: "bg-[#97836a]",
      url: "/dashboard/admin"
    }] : [])
  ]

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-white text-lg mb-1">Acesso Rápido</h3>
      <div className="grid gap-3">
        {allShortcuts.map((shortcut, idx) => (
          <Link href={shortcut.url} key={idx} className="block outline-none">
            <Card className="group border-2 border-black shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] bg-white h-full">
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
          </Link>
        ))}
      </div>
    </div>
  )
}
