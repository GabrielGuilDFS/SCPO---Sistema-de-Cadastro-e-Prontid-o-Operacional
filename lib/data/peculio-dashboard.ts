import { cache } from "react"
import prisma from "@/lib/prisma"

export interface PeculioResumo {
  totalProntos: number
  totalAfastados: number
  totalLancamentos: number
  distribuicaoPorPosto: { name: string; value: number; color: string }[]
  // Detalhamento para Gráficos
  ativos: number
  ferias: number
  licencaPremio: number
  licencaMedica: number
  aptoTotal: number
  aptoRestricao: number
  inapto: number
}

const CORES = ["#97836a", "#544634", "#cbd5e1", "#000000", "#f59e0b", "#3b82f6", "#10b981", "#ef4444"]

/**
 * Agrega os dados de Pecúlio do mês/ano atual.
 * Envolvido com `cache` do React para evitar múltiplas queries no mesmo request.
 */
export const getPeculioResumoMes = cache(async (mes: number, ano: number): Promise<PeculioResumo> => {
  const dataMesAno = new Date(ano, mes - 1, 1)

  const [
    totalProntos,
    totalLancamentos,
    porPosto,
    ativos,
    ferias,
    licencaPremio,
    licencaMedica,
    aptoTotal,
    aptoRestricao,
    inapto
  ] = await Promise.all([
    // Legado / KPIs
    prisma.peculio.count({ where: { dataMesAno, disponibilidade: "PRONTO" } }),
    prisma.peculio.count({ where: { dataMesAno } }),
    
    // Distribuição por Posto
    prisma.peculio.groupBy({
      by: ["postoDeServicoId"],
      where: { dataMesAno },
      _count: { id: true },
    }),

    // Novas Categorias: Prontidão (Situação Funcional)
    prisma.peculio.count({ where: { dataMesAno, situacaoFuncional: "ATIVO" } }),
    prisma.peculio.count({ where: { dataMesAno, situacaoFuncional: "FERIAS" } }),
    prisma.peculio.count({ where: { dataMesAno, situacaoFuncional: "LICENCA_PREMIO" } }),
    prisma.peculio.count({ where: { dataMesAno, situacaoFuncional: "LICENCA_MEDICA" } }),

    // Novas Categorias: Situação Operacional (Condição Operacional / Saúde)
    prisma.peculio.count({ where: { dataMesAno, condicaoOperacional: "APTO_TOTAL" } }),
    prisma.peculio.count({ where: { dataMesAno, condicaoOperacional: "APTO_RESTRICAO" } }),
    prisma.peculio.count({ where: { dataMesAno, condicaoOperacional: "INAPTO_TEMPORARIO" } }),
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

  return { 
    totalProntos, 
    totalAfastados: ferias + licencaPremio + licencaMedica,
    totalLancamentos, 
    distribuicaoPorPosto,
    ativos,
    ferias,
    licencaPremio,
    licencaMedica,
    aptoTotal,
    aptoRestricao,
    inapto
  }
})
