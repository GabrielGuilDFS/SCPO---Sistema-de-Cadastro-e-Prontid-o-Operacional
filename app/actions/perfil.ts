"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { revalidatePath } from "next/cache"

export async function atualizarSenha(senhaAtual: string, novaSenha: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.matricula) {
      return { success: false, message: "Sessão inválida. Faça login novamente." }
    }

    const login = await prisma.login.findUnique({
      where: { matricula: session.user.matricula },
    })

    if (!login) {
      return { success: false, message: "Usuário não encontrado no sistema." }
    }

    if (!login.statusAtivo) {
      return { success: false, message: "Conta desativada. Contate um administrador." }
    }

    // Validar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, login.senhaHash)
    if (!senhaValida) {
      return { success: false, message: "A senha atual está incorreta." }
    }

    // Validar nova senha
    if (novaSenha.length < 6) {
      return { success: false, message: "A nova senha deve ter pelo menos 6 caracteres." }
    }

    // Gerar hash e atualizar
    const novoHash = await bcrypt.hash(novaSenha, 10)
    await prisma.login.update({
      where: { id: login.id },
      data: { senhaHash: novoHash },
    })

    revalidatePath("/dashboard/perfil")

    return { success: true, message: "Senha atualizada com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao atualizar senha:", error)
    return { success: false, message: "Erro interno ao atualizar senha." }
  }
}
