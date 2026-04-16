"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Police {
  id: number;
  nomeGuerra: string;
  matricula: string;
  companhia: string;
  status: string;
  idade: number;
}

interface PoliceGridProps {
  policiais: Police[];
}

export function PoliceGrid({ policiais }: PoliceGridProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold text-white text-lg mb-1">Efetivo Recente</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {policiais.map((policial) => (
          <Card key={policial.id} className="border-2 border-black shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
            <CardContent className="p-0">
              <div className="flex items-center p-4 gap-4">
                {/* Avatar e Dot de Status */}
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-black shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${policial.nomeGuerra}&backgroundColor=97836a`} />
                    <AvatarFallback>{policial.nomeGuerra.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span 
                    className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      policial.status === 'pronto' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    title={policial.status === 'pronto' ? 'Em Prontidão' : 'Afastado'}
                  />
                </div>
                
                {/* Informações Principais */}
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-slate-700 text-sm group-hover:text-[#97836a] transition-colors">
                    {policial.nomeGuerra}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{policial.companhia}</span>
                    <span>•</span>
                    <span>{policial.idade} anos</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                    MAT: {policial.matricula}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
