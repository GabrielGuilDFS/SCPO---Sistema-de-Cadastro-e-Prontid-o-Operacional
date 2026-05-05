"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardCheck,
  UserPlus,
  UserX,
  Settings,
  ArrowRightLeft,
  LogOut,
  Shield,
  User,
} from "lucide-react"
import { signOut } from "next-auth/react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type NavItem = {
  title: string
  icon: React.ElementType
  url: string
  allowedProfiles?: string[]
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Geral",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        url: "/dashboard",
      },
    ],
  },
  {
    label: "Operacional",
    items: [
      {
        title: "Lançar Pecúlio",
        icon: ClipboardCheck,
        url: "/dashboard/peculio/novo",
        allowedProfiles: ["ADMINISTRADOR", "OPERADOR"],
      },
    ],
  },
  {
    label: "Recursos Humanos",
    items: [
      {
        title: "Novo Policial",
        icon: UserPlus,
        url: "/dashboard/cadastro-policial",
        allowedProfiles: ["ADMINISTRADOR", "OPERADOR"],
      },
      {
        title: "Agentes Inativos",
        icon: UserX,
        url: "/dashboard/policiais-inativos",
        allowedProfiles: ["ADMINISTRADOR", "OPERADOR"],
      },
      {
        title: "Transferências",
        icon: ArrowRightLeft,
        url: "/dashboard/transferencias",
        allowedProfiles: ["ADMINISTRADOR"],
      },
    ],
  },
  {
    label: "Administrativo",
    items: [
      {
        title: "Painel Admin",
        icon: Settings,
        url: "/dashboard/admin",
        allowedProfiles: ["ADMINISTRADOR"],
      },
    ],
  },
]

interface SidebarContentProps {
  userProfile?: string
  nomeUsuario?: string
  collapsed?: boolean
  onLinkClick?: () => void
}

export function SidebarContent({
  userProfile,
  nomeUsuario,
  collapsed = false,
  onLinkClick,
}: SidebarContentProps) {
  const pathname = usePathname()

  const isActive = (url: string) => {
    if (url === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(url)
  }

  const canSee = (item: NavItem) => {
    if (!item.allowedProfiles) return true
    return item.allowedProfiles.includes(userProfile ?? "")
  }

  return (
    <TooltipProvider delay={0}>
      <div className="flex flex-col h-full flex-1 overflow-hidden w-full max-w-full">
        {/* ── Navegação ─────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4 w-full max-w-full">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter(canSee)
            if (visibleItems.length === 0) return null

            return (
              <div key={group.label} className="w-full max-w-full overflow-hidden">
                {/* Label do grupo: Esconde no desktop se colapsado, sempre visível no mobile */}
                <p className={cn(
                  "px-4 mb-1 text-[10px] font-bold uppercase tracking-widest text-[#97836a]/70 transition-all duration-300 truncate whitespace-nowrap overflow-hidden",
                  collapsed ? "hidden" : "hidden lg:block"
                )}>
                  {group.label}
                </p>
                {/* Divisor: Aparece no desktop apenas se colapsado, nunca no mobile */}
                <div className={cn(
                  "h-px bg-white/10 mx-3 mb-2",
                  collapsed ? "block" : "block lg:hidden"
                )} />

                <ul className="space-y-0.5 px-2 w-full max-w-full">
                  {visibleItems.map((item) => {
                    const active = isActive(item.url)
                    const Icon = item.icon

                    const linkEl = (
                      <Link
                        href={item.url}
                        onClick={onLinkClick}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-all duration-300 group relative w-full overflow-hidden min-w-0",
                          active
                            ? "bg-[#342a1e] text-white shadow-sm"
                            : "text-slate-300 hover:bg-white/[0.08] hover:text-white",
                          collapsed ? "justify-center px-0" : "justify-center px-0 lg:justify-start lg:px-2"
                        )}
                      >
                        {/* Indicador ativo */}
                        {active && (
                          <span className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#97836a] rounded-r-full transition-all duration-300",
                            collapsed ? "hidden" : "hidden lg:block"
                          )} />
                        )}
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-all duration-300",
                            active ? "text-white" : "text-[#97836a] group-hover:text-white",
                          )}
                        />
                        {/* Texto do item: Esconde no desktop se colapsado, sempre visível no mobile */}
                        <span className={cn(
                          "truncate transition-all duration-300 flex-1 min-w-0",
                          collapsed ? "hidden" : "hidden lg:block"
                        )}>
                          {item.title}
                        </span>
                      </Link>
                    )

                    // No desktop colapsado, envolvemos com Tooltip
                    return (
                      <li key={item.url} className="w-full max-w-full">
                        {collapsed ? (
                          <>
                            {/* Tooltip para todos os tamanhos quando colapsado ou no mobile */}
                            <div className="w-full">
                              <Tooltip>
                                <TooltipTrigger render={linkEl} />
                                <TooltipContent
                                  side="right"
                                  className="bg-[#3c342a] text-white border border-[#97836a]/40 text-xs font-medium"
                                >
                                  {item.title}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                            {/* Removed redundant div */}
                          </>
                        ) : (
                          linkEl
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </nav>

        {/* ── Rodapé: Perfil + Logout ───────────────────────────── */}
        <div className="border-t border-white/10 mt-auto bg-[#2a2218] flex flex-col shrink-0 w-full overflow-hidden pt-4 pb-22 px-3 gap-4">

          {/* Info do usuário - Com 'flex-1 min-w-0' para travar o texto */}
          <Link
            href="/dashboard/perfil"
            onClick={onLinkClick}
            className={cn(
              "flex items-center gap-3 transition-all duration-300 w-full overflow-hidden p-1 rounded-lg hover:bg-white/5 group/profile",
              collapsed ? "justify-center" : "justify-center lg:justify-start"
            )}
          >
            <div className="h-8 w-8 rounded-full bg-[#97836a]/30 flex items-center justify-center shrink-0 border border-[#97836a]/20 group-hover/profile:border-[#cca471]/50 transition-colors">
              <User className="h-4 w-4 text-[#97836a] group-hover/profile:text-[#cca471]" />
            </div>

            <div className={cn(
              "flex-col overflow-hidden flex-1 min-w-0",
              collapsed ? "hidden" : "hidden lg:flex"
            )}>
              <p className="text-white text-xs font-semibold truncate leading-tight w-full group-hover/profile:text-[#cca471] transition-colors">
                {nomeUsuario || "Usuário"}
              </p>
              <p className="text-[#97836a] text-[10px] truncate leading-tight w-full uppercase tracking-tighter">
                {userProfile || "Operador"}
              </p>
            </div>
          </Link>

          {/* Logout */}
          <AlertDialog>
            <AlertDialogTrigger
              className={cn(
                "flex items-center transition-all duration-300 w-full overflow-hidden outline-none border-none group",
                "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300",
                collapsed
                  ? "w-10 h-10 mx-auto justify-center rounded-full"
                  : "w-10 h-10 mx-auto justify-center rounded-full lg:w-full lg:h-auto lg:mx-0 lg:justify-start lg:rounded-lg lg:gap-3 lg:px-2 lg:py-2 lg:text-[11px]"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className={cn(
                "truncate flex-1 min-w-0 text-left",
                collapsed ? "hidden" : "hidden lg:block"
              )}>
                Sair do Sistema
              </span>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deseja encerrar sua sessão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você será desconectado do sistema e precisará fazer login novamente
                  para acessar o painel.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Sim, sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </TooltipProvider>
  )
}
