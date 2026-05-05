"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { TipoTransferencia } from "@prisma/client"

// ---------------------------------------------------------------------------
// Validação Zod
// ---------------------------------------------------------------------------

const transferenciaItemSchema = z.object({
  policialId: z.number({ message: "Policial é obrigatório" }),
  subunidadeDestinoId: z.number({ message: "Subunidade de destino é obrigatória" }),
  tipoTransferencia: z.nativeEnum(TipoTransferencia, { message: "Tipo de transferência é obrigatório" }),
})

const transferenciaEmLoteSchema = z.object({
  numeroBGO: z.string().min(1, "O número do BGO é obrigatório").max(50, "Máximo de 50 caracteres"),
  dataTransferencia: z.string().min(1, "A data de transferência é obrigatória"),
  transferencias: z.array(transferenciaItemSchema).min(1, "Adicione pelo menos um policial ao lote"),
})

// ---------------------------------------------------------------------------
// Registrar Transferências em Lote (Transação Atômica)
// ---------------------------------------------------------------------------

export async function registrarTransferenciasEmLote(data: z.infer<typeof transferenciaEmLoteSchema>) {
  try {
    const parsed = transferenciaEmLoteSchema.safeParse(data)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return { success: false, error: firstError.message }
    }

    const dataTransf = new Date(data.dataTransferencia + "T00:00:00")
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    if (dataTransf > hoje) {
      return { success: false, error: "A data de transferência não pode ser futura." }
    }

    // Transação atômica
    const result = await prisma.$transaction(async (tx) => {
      let count = 0

      for (const item of data.transferencias) {
        // 1. Buscar a subunidade atual do policial
        const policial = await tx.policial.findUnique({
          where: { id: item.policialId },
          select: { subunidadeId: true }
        })

        if (!policial) {
          throw new Error(`Policial ID ${item.policialId} não encontrado.`)
        }

        // Se for a mesma unidade, pula (ou lança erro dependendo da regra de negócio, optamos por pular para não quebrar o lote inteiro se não for estrito, mas como é uma interface controlada, lançar erro é mais seguro para evitar dados sujos).
        if (policial.subunidadeId === item.subunidadeDestinoId) {
          throw new Error(`O policial ID ${item.policialId} já está lotado nesta subunidade.`)
        }

        // 2. Criar o registro
        await tx.transferencia.create({
          data: {
            policialId: item.policialId,
            subunidadeDestinoId: item.subunidadeDestinoId,
            subunidadeOrigemId: policial.subunidadeId,
            dataTransferencia: dataTransf,
            tipoTransferencia: item.tipoTransferencia,
            numeroBGO: data.numeroBGO.trim(),
          }
        })

        // 3. Atualizar a lotação principal
        await tx.policial.update({
          where: { id: item.policialId },
          data: { subunidadeId: item.subunidadeDestinoId }
        })

        count++
      }

      return count
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/transferencias")

    return {
      success: true,
      message: `${result} transferência(s) registrada(s) com sucesso no BGO ${data.numeroBGO}.`,
    }
  } catch (error: any) {
    console.error("Erro ao registrar transferências em lote:", error)
    return {
      success: false,
      error: error?.message || "Erro inesperado ao registrar lote.",
    }
  }
}

// ---------------------------------------------------------------------------
// Buscar Histórico Agrupado por BGO
// ---------------------------------------------------------------------------

export async function getBGOsAgrupados(filtros?: { bgo?: string, dataInicial?: string, dataFinal?: string }) {
  try {
    const where: any = {}
    if (filtros?.bgo) {
      where.numeroBGO = { contains: filtros.bgo, mode: "insensitive" }
    }
    if (filtros?.dataInicial || filtros?.dataFinal) {
      where.dataTransferencia = {}
      if (filtros.dataInicial) where.dataTransferencia.gte = new Date(filtros.dataInicial + "T00:00:00")
      if (filtros.dataFinal) where.dataTransferencia.lte = new Date(filtros.dataFinal + "T23:59:59")
    }

    // Usando groupBy para pegar os BGOs únicos
    const agrupamento = await prisma.transferencia.groupBy({
      by: ['numeroBGO', 'dataTransferencia'],
      where,
      _count: { id: true },
      orderBy: { dataTransferencia: 'desc' }
    })

    return agrupamento.map(g => ({
      numeroBGO: g.numeroBGO,
      dataTransferencia: g.dataTransferencia,
      quantidade: g._count.id
    }))
  } catch (error) {
    console.error("Erro ao buscar BGOs:", error)
    return []
  }
}

// ---------------------------------------------------------------------------
// Buscar Transferências por BGO específico
// ---------------------------------------------------------------------------

export async function getTransferenciasPorBGO(numeroBGO: string) {
  try {
    const transferencias = await prisma.transferencia.findMany({
      where: { numeroBGO },
      include: {
        policial: { select: { id: true, nomeCompleto: true, nomeGuerra: true, matricula: true, grauHierarquico: true } },
        subunidadeDestino: { select: { nome: true, sigla: true } },
        subunidadeOrigem: { select: { nome: true, sigla: true } },
      },
      orderBy: { policial: { nomeCompleto: 'asc' } }
    })
    return transferencias
  } catch (error) {
    console.error("Erro ao buscar transferências do BGO:", error)
    return []
  }
}

// ---------------------------------------------------------------------------
// Excluir Transferência (com reversão de lotação)
// ---------------------------------------------------------------------------

export async function deletarTransferencia(id: number, reverterLotacao: boolean) {
  try {
    await prisma.$transaction(async (tx) => {
      const transferencia = await tx.transferencia.findUnique({ where: { id } })
      if (!transferencia) throw new Error("Transferência não encontrada.")

      if (reverterLotacao) {
        // Volta o policial para a unidade de origem da transferência (ou null se não tinha)
        await tx.policial.update({
          where: { id: transferencia.policialId },
          data: { subunidadeId: transferencia.subunidadeOrigemId }
        })
      }

      await tx.transferencia.delete({ where: { id } })
    })

    revalidatePath("/dashboard/transferencias")
    return { success: true, message: "Transferência removida com sucesso." }
  } catch (error: any) {
    console.error("Erro ao deletar transferência:", error)
    return { success: false, error: error?.message || "Erro inesperado ao deletar." }
  }
}

// ---------------------------------------------------------------------------
// Editar Lote (Apenas BGO e Data)
// ---------------------------------------------------------------------------

export async function editarLoteTransferencia(numeroBGOAntigo: string, numeroBGONovo: string, dataTransferenciaNova: string) {
  try {
    if (!numeroBGONovo || !dataTransferenciaNova) {
      return { success: false, error: "Número do BGO e Data são obrigatórios." }
    }

    const dataTransf = new Date(dataTransferenciaNova + "T00:00:00")
    
    await prisma.transferencia.updateMany({
      where: { numeroBGO: numeroBGOAntigo },
      data: {
        numeroBGO: numeroBGONovo.trim(),
        dataTransferencia: dataTransf
      }
    })

    revalidatePath("/dashboard/transferencias")
    return { success: true, message: "Lote atualizado com sucesso." }
  } catch (error: any) {
    console.error("Erro ao editar lote:", error)
    return { success: false, error: "Erro inesperado ao editar o lote." }
  }
}

// ---------------------------------------------------------------------------
// Excluir Lote (com reversão de lotação)
// ---------------------------------------------------------------------------

export async function deletarLoteTransferencia(numeroBGO: string) {
  try {
    await prisma.$transaction(async (tx) => {
      const transferencias = await tx.transferencia.findMany({
        where: { numeroBGO }
      })

      if (transferencias.length === 0) {
        throw new Error("Nenhuma transferência encontrada para este BGO.")
      }

      for (const t of transferencias) {
        await tx.policial.update({
          where: { id: t.policialId },
          data: { subunidadeId: t.subunidadeOrigemId }
        })
      }

      await tx.transferencia.deleteMany({
        where: { numeroBGO }
      })
    })

    revalidatePath("/dashboard/transferencias")
    return { success: true, message: "Lote excluído com sucesso e lotações revertidas." }
  } catch (error: any) {
    console.error("Erro ao excluir lote:", error)
    return { success: false, error: error?.message || "Erro inesperado ao excluir o lote." }
  }
}

// ---------------------------------------------------------------------------
// Buscar Histórico de Transferências (Individual) - Para o Perfil
// ---------------------------------------------------------------------------

export async function getHistoricoTransferencias(policialId: number) {
  try {
    const transferencias = await prisma.transferencia.findMany({
      where: { policialId },
      orderBy: { dataTransferencia: "desc" },
      include: {
        subunidadeDestino: { select: { nome: true, sigla: true } },
        subunidadeOrigem: { select: { nome: true, sigla: true } },
      }
    })

    return transferencias
  } catch (error) {
    console.error("Erro ao buscar histórico de transferências:", error)
    return []
  }
}

// ---------------------------------------------------------------------------
// Buscar Subunidades para o Select
// ---------------------------------------------------------------------------

export async function getSubunidadesOptions() {
  try {
    const subunidades = await prisma.subunidade.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, sigla: true }
    })
    return subunidades
  } catch (error) {
    console.error("Erro ao buscar subunidades:", error)
    return []
  }
}

// ---------------------------------------------------------------------------
// Editar Transferência Individual (Atualiza Transferencia e Lotação do Policial)
// ---------------------------------------------------------------------------

export async function updateTransferenciaIndividual(
  transferenciaId: number,
  subunidadeDestinoId: number,
  tipoTransferencia: "INTERNA" | "EXTERNA"
) {
  try {
    await prisma.$transaction(async (tx) => {
      const transferencia = await tx.transferencia.findUnique({
        where: { id: transferenciaId }
      })

      if (!transferencia) {
        throw new Error("Transferência não encontrada.")
      }

      if (transferencia.subunidadeDestinoId !== subunidadeDestinoId) {
        await tx.policial.update({
          where: { id: transferencia.policialId },
          data: { subunidadeId: subunidadeDestinoId }
        })
      }

      await tx.transferencia.update({
        where: { id: transferenciaId },
        data: {
          subunidadeDestinoId,
          tipoTransferencia
        }
      })
    })

    revalidatePath("/dashboard/transferencias")
    return { success: true, message: "Transferência atualizada com sucesso." }
  } catch (error: any) {
    console.error("Erro ao atualizar transferência individual:", error)
    return { success: false, error: error?.message || "Erro inesperado ao atualizar a transferência." }
  }
}
