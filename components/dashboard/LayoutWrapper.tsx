"use client"

import { Menu } from "lucide-react"
import { useSidebar } from "./SidebarProvider"
import { cn } from "@/lib/utils"

interface LayoutWrapperProps {
  children: React.ReactNode
  userProfile?: string
}

export function LayoutWrapper({ children, userProfile }: LayoutWrapperProps) {
  const { isOpen, setIsOpen, isCollapsed } = useSidebar()

  return (
    <div className="flex h-screen overflow-hidden bg-[#7f6e59] relative">
      {/* Overlay removido pois a sidebar agora é fixa em estado recolhido no mobile */}

      {/* ── Área Principal ──────────────────────────────────────────── */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-in-out",
          isCollapsed ? "pl-16" : "pl-16 lg:pl-64"
        )}
      >
        {/* Topbar Mobile Removida */}

        {/* ── Palco de Conteúdo com Largura de Conforto ───────────────── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {/* O Contêiner Mestre que limita a largura em ultra-wide */}
          <div className="w-full max-w-[1440px] mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
