"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

async function validateAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.perfil !== "ADMINISTRADOR") {
    throw new Error("Acesso negado. Apenas administradores podem realizar esta ação.")
  }
}

// --- CREATE ACTIONS ---

export async function criarSubunidade(data: { nome: string, sigla: string }) {
  try {
    await validateAdmin()
    const subunidade = await prisma.subunidade.create({ data })
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Subunidade criada com sucesso!" }
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, message: "Já existe uma subunidade com este nome ou sigla." }
    }
    return { success: false, message: error.message || "Erro ao criar subunidade." }
  }
}

export async function criarPostoServico(data: { nome: string, subunidadeId: number }) {
  try {
    await validateAdmin()
    await prisma.postoDeServico.create({ data })
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Posto de serviço criado com sucesso!" }
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, message: "Este posto de serviço já está cadastrado nesta unidade." }
    }
    return { success: false, message: error.message || "Erro ao criar posto." }
  }
}

export async function criarFuncao(data: { funcao: string }) {
  try {
    await validateAdmin()
    await prisma.funcaoAtual.create({ data })
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Função criada com sucesso!" }
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, message: "Esta função já existe no sistema." }
    }
    return { success: false, message: error.message || "Erro ao criar função." }
  }
}

// --- UPDATE ACTIONS ---

export async function atualizarSubunidade(id: number, data: { nome: string, sigla: string }) {
  try {
    await validateAdmin()
    await prisma.subunidade.update({ where: { id }, data })
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Subunidade atualizada com sucesso!" }
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, message: "Conflito: Já existe uma subunidade com este nome ou sigla." }
    }
    return { success: false, message: error.message || "Erro ao atualizar subunidade." }
  }
}

export async function atualizarPosto(id: number, data: { nome: string, subunidadeId: number }) {
  try {
    await validateAdmin()
    await prisma.postoDeServico.update({ where: { id }, data })
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Posto atualizado com sucesso!" }
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, message: "Conflito: Este posto de serviço já existe." }
    }
    return { success: false, message: error.message || "Erro ao atualizar posto." }
  }
}

export async function atualizarFuncao(id: number, data: { funcao: string }) {
  try {
    await validateAdmin()
    await prisma.funcaoAtual.update({ where: { id }, data })
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Função atualizada com sucesso!" }
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, message: "Conflito: Esta função já existe." }
    }
    return { success: false, message: error.message || "Erro ao atualizar função." }
  }
}

// --- DELETE ACTIONS ---

export async function excluirSubunidade(id: number) {
  try {
    await validateAdmin()
    
    // Verificar vínculos
    const dependencias = await prisma.subunidade.findUnique({
      where: { id },
      include: { 
        _count: { select: { policiais: true, postosServico: true } } 
      }
    })

    if (dependencias && (dependencias._count.policiais > 0 || dependencias._count.postosServico > 0)) {
      return { success: false, message: "Não é possível excluir esta subunidade pois ela possui policiais ou postos vinculados." }
    }

    await prisma.subunidade.delete({ where: { id } })
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Subunidade excluída com sucesso!" }
  } catch (error: any) {
    return { success: false, message: error.message || "Erro ao excluir subunidade." }
  }
}

export async function excluirPosto(id: number) {
  try {
    await validateAdmin()
    
    // Postos de serviço geralmente não têm dependências que bloqueiam, mas vamos checar se há algo lógico (ex: escalas futuras se existissem)
    // No schema atual, Policial não vincula a PostoDeServico diretamente, mas se vinculasse, checaríamos aqui.
    
    await prisma.postoDeServico.delete({ where: { id } })
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Posto excluído com sucesso!" }
  } catch (error: any) {
    return { success: false, message: error.message || "Erro ao excluir posto." }
  }
}

export async function excluirFuncao(id: number) {
  try {
    await validateAdmin()
    
    const dependencias = await prisma.funcaoAtual.findUnique({
      where: { id },
      include: { _count: { select: { policiais: true } } }
    })

    if (dependencias && dependencias._count.policiais > 0) {
      return { success: false, message: "Não é possível excluir esta função pois existem policiais vinculados a ela." }
    }

    await prisma.funcaoAtual.delete({ where: { id } })
    revalidatePath("/dashboard/admin")
    return { success: true, message: "Função excluída com sucesso!" }
  } catch (error: any) {
    return { success: false, message: error.message || "Erro ao excluir função." }
  }
}
