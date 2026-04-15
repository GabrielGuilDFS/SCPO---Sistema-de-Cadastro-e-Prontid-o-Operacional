"use client"

import { LogOut } from "lucide-react"
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

export function LogoutButton() {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="flex items-center gap-2 text-sm font-medium text-rose-700 hover:text-rose-800 transition-colors bg-white hover:bg-rose-50 px-3 py-1.5 rounded-md shadow-sm">
        <LogOut className="h-4 w-4" />
        Sair
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deseja encerrar sua sessão?</AlertDialogTitle>
          <AlertDialogDescription>
            Você será desconectado do sistema e precisará fazer login novamente para acessar o painel.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-rose-600 hover:bg-rose-700 text-white"
          >
            Sim, sair
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
