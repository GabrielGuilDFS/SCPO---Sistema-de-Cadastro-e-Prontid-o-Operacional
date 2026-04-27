"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { GrauParentesco } from "@prisma/client"

export async function getDependentesByPolicial(policialId: number) {
  try {
    const dependentes = await prisma.dependente.findMany({
      where: { policialId },
      orderBy: { nomeCompleto: "asc" }
    })
    return { success: true, data: dependentes }
  } catch (error: any) {
    console.error("Erro ao buscar dependentes:", error)
    return { success: false, message: "Erro ao buscar dependentes." }
  }
}

export async function adicionarDependente(data: {
  policialId: number
  nomeCompleto: string
  grauParentesco: GrauParentesco
  dataNascimento: string
}) {
  try {
    const novoDependente = await prisma.dependente.create({
      data: {
        policialId: data.policialId,
        nomeCompleto: data.nomeCompleto,
        grauParentesco: data.grauParentesco,
        dataNascimento: new Date(data.dataNascimento)
      }
    })
    revalidatePath("/dashboard")
    return { success: true, message: "Dependente adicionado com sucesso!", data: novoDependente }
  } catch (error: any) {
    console.error("Erro ao adicionar dependente:", error)
    return { success: false, message: "Erro ao adicionar dependente." }
  }
}

export async function removerDependente(id: number) {
  try {
    await prisma.dependente.delete({
      where: { id }
    })
    revalidatePath("/dashboard")
    return { success: true, message: "Dependente removido com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao remover dependente:", error)
    return { success: false, message: "Erro ao remover dependente." }
  }
}

export async function atualizarDependente(id: number, data: {
  nomeCompleto: string
  grauParentesco: GrauParentesco
  dataNascimento: string
}) {
  try {
    const dependente = await prisma.dependente.update({
      where: { id },
      data: {
        nomeCompleto: data.nomeCompleto,
        grauParentesco: data.grauParentesco,
        dataNascimento: new Date(data.dataNascimento)
      }
    })
    revalidatePath("/dashboard")
    return { success: true, message: "Dependente atualizado com sucesso!", data: dependente }
  } catch (error: any) {
    console.error("Erro ao atualizar dependente:", error)
    return { success: false, message: "Erro ao atualizar dependente." }
  }
}
