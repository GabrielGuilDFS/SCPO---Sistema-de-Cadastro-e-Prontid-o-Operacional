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
      {/* ── Overlay (Mobile Only) ────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Área Principal ──────────────────────────────────────────── */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        {/* Topbar Mobile (lg:hidden) */}
        <header className="lg:hidden flex items-center gap-3 bg-[#3c342a] px-4 py-3 border-b border-black/10 shadow-sm shrink-0">
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <img
            src="/Logo-batal-removebg-preview.png"
            alt="SCPO Logo"
            className="h-7 object-contain"
          />
          <span className="text-white font-bold text-base">SCPO</span>
          <div className="ml-auto text-xs text-[#97836a] font-medium">
            {userProfile || "Operador"}
          </div>
        </header>

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
