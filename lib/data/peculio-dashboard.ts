import { cache } from "react"
import prisma from "@/lib/prisma"

export interface PeculioResumo {
  totalProntos: number
  totalAfastados: number
  totalLancamentos: number
  distribuicaoPorPosto: { name: string; value: number; color: string }[]
}

const CORES = ["#97836a", "#544634", "#cbd5e1", "#000000", "#f59e0b", "#3b82f6", "#10b981", "#ef4444"]

/**
 * Agrega os dados de Pecúlio do mês/ano atual.
 * Envolvido com `cache` do React para evitar múltiplas queries no mesmo request.
 */
export const getPeculioResumoMes = cache(async (mes: number, ano: number): Promise<PeculioResumo> => {
  const dataMesAno = new Date(ano, mes - 1, 1)

  const [totalProntos, totalAfastados, totalLancamentos, porPosto] = await Promise.all([
    // Prontos: disponibilidade = PRONTO
    prisma.peculio.count({
      where: {
        dataMesAno,
        disponibilidade: "PRONTO",
      },
    }),

    // Afastados: situação funcional diferente de ATIVO
    prisma.peculio.count({
      where: {
        dataMesAno,
        situacaoFuncional: { not: "ATIVO" },
      },
    }),

    // Total de lançamentos no mês
    prisma.peculio.count({
      where: { dataMesAno },
    }),

    // Distribuição por Posto de Serviço (com nome da subunidade)
    prisma.peculio.groupBy({
      by: ["postoDeServicoId"],
      where: { dataMesAno },
      _count: { id: true },
    }),
  ])

  // Buscar nomes dos postos para montar a legenda
  const postoIds = porPosto.map((p) => p.postoDeServicoId)
  const postos = await prisma.postoDeServico.findMany({
    where: { id: { in: postoIds } },
    include: { subunidade: true },
  })

  const distribuicaoPorPosto = porPosto.map((item, index) => {
    const posto = postos.find((p) => p.id === item.postoDeServicoId)
    const label = posto ? posto.nome : "Posto Desconhecido"
    return {
      name: label,
      value: item._count.id,
      color: CORES[index % CORES.length],
    }
  })

  return { totalProntos, totalAfastados, totalLancamentos, distribuicaoPorPosto }
})
