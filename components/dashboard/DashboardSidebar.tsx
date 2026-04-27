"use client"

import { ChevronLeft, ChevronRight, Shield } from "lucide-react"
import { SidebarContent } from "./SidebarContent"
import { useSidebar } from "./SidebarProvider"

interface DashboardSidebarProps {
  userProfile?: string
  nomeUsuario?: string
}

export function DashboardSidebar({
  userProfile,
  nomeUsuario,
}: DashboardSidebarProps) {
  const { isCollapsed, isOpen, toggleSidebar } = useSidebar()

  return (
    <>
      {/* ── Sidebar Container ───────────────────────────────────── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 bg-[#2a2218] border-r border-white/10 transition-all duration-300 ease-in-out",
          // Mobile visibility
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Desktop width
          isCollapsed ? "lg:w-16" : "lg:w-64",
          "w-64", // Default mobile width
        ].join(" ")}
      >
        {/* ── Cabeçalho ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/10 min-h-[65px] transition-all duration-300 ease-in-out">
          <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'lg:mx-auto' : ''}`}>
            <div className="shrink-0 flex items-center justify-center">
              <img
                src="/Logo-batal-removebg-preview.png"
                alt="SCPO Logo"
                className="h-9 w-9 object-contain"
              />
            </div>
            {(!isCollapsed || isOpen) && (
              <div className="overflow-hidden hidden lg:block">
                <p className="text-white font-bold text-base leading-tight truncate">
                  SCPO
                </p>
                <p className="text-[#97836a] text-[10px] font-medium uppercase tracking-wider leading-tight truncate">
                  20º BPM
                </p>
              </div>
            )}
            {/* Texto visível no mobile sempre que aberto */}
            <div className="overflow-hidden lg:hidden">
              <p className="text-white font-bold text-base leading-tight truncate">
                SCPO
              </p>
              <p className="text-[#97836a] text-[10px] font-medium uppercase tracking-wider leading-tight truncate">
                20º BPM
              </p>
            </div>
          </div>

          <button
            onClick={toggleSidebar}
            className={[
              "flex items-center justify-center h-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-300 shrink-0",
              isCollapsed ? "lg:hidden" : "w-8",
            ].join(" ")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Botão Expandir centralizado quando colapsado (Desktop Only) */}
        {isCollapsed && (
          <div className="px-2 pt-4 hidden lg:flex justify-center">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-300"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── Conteúdo Interno ───────────────────────────────────── */}
        <SidebarContent
          userProfile={userProfile}
          nomeUsuario={nomeUsuario}
          collapsed={isCollapsed}
          onLinkClick={() => {
            // No mobile, fecha ao clicar em link
            if (window.innerWidth < 1024) toggleSidebar()
          }}
        />
      </aside>
    </>
  )
}
