"use server"

import prisma from "@/lib/prisma"

/**
 * Busca policiais ativos no banco de dados.
 * - Sem query: retorna os 10 mais recentes.
 * - Com query: busca em toda a tabela sem limite.
 */
export async function buscarPoliciais(query?: string) {
  const activeFilter = {
    AND: [
      { status: { not: 'INATIVO' } },
      { OR: [{ login: null }, { login: { statusAtivo: true } }] }
    ]
  }

  const hoje = new Date()
  const mesAtual = hoje.getMonth() + 1
  const anoAtual = hoje.getFullYear()
  const dataMesAtual = new Date(anoAtual, mesAtual - 1, 1)

  const includeRelations = {
    subunidade: true,
    funcaoAtual: true,
    endereco: true,
    login: true,
    dependentes: true,
    peculios: {
      where: { dataMesAno: dataMesAtual },
      take: 1,
      include: {
        postoDeServico: true,
      },
    },
  }

  const hasQuery = query && query.trim().length > 0
  const searchTerm = hasQuery ? query.trim() : undefined

  const policiais = await prisma.policial.findMany({
    where: hasQuery
      ? {
          ...activeFilter,
          OR: [
            { nomeCompleto: { contains: searchTerm, mode: 'insensitive' as any } },
            { nomeGuerra: { contains: searchTerm, mode: 'insensitive' as any } },
            { matricula: { contains: searchTerm, mode: 'insensitive' as any } },
          ],
        }
      : activeFilter,
    orderBy: { id: 'desc' },
    ...(hasQuery ? {} : { take: 10 }),
    include: includeRelations,
  })

  const calcularIdade = (data: Date | null): number => {
    if (!data) return 0
    const h = new Date()
    let idade = h.getFullYear() - data.getFullYear()
    const m = h.getMonth() - data.getMonth()
    if (m < 0 || (m === 0 && h.getDate() < data.getDate())) idade--
    return idade
  }

  return policiais.map(p => ({
    ...p,
    idade: calcularIdade(p.dataNascimento as Date | null),
    postoAtual: p.peculios?.[0]?.postoDeServico?.nome ?? null,
  }))
}
