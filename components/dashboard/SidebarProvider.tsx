"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePathname } from "next/navigation"

interface SidebarContextType {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  // Fecha a sidebar no mobile ao mudar de rota
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setIsCollapsed(!isCollapsed)
    } else {
      setIsOpen(!isOpen)
    }
  }

  return (
    <SidebarContext.Provider
      value={{ isOpen, setIsOpen, isCollapsed, setIsCollapsed, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
