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

// ---------------------------------------------------------------------------
// Helpers compartilhados
// ---------------------------------------------------------------------------

const ACTIVE_FILTER = {
  AND: [
    { status: { not: 'INATIVO' } },
    { OR: [{ login: null }, { login: { statusAtivo: true } }] }
  ]
}

function getDataMesAtual() {
  const hoje = new Date()
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1)
}

const SITUACAO_LABELS: Record<string, string> = {
  FERIAS: "Férias",
  LICENCA_PREMIO: "Licença Prêmio",
  LICENCA_MEDICA: "Licença Médica",
}

// ---------------------------------------------------------------------------
// Drill-down: Prontidão
// ---------------------------------------------------------------------------

export async function listarProntidao() {
  const dataMesAtual = getDataMesAtual()

  const peculios = await prisma.peculio.findMany({
    where: { dataMesAno: dataMesAtual },
    include: {
      policial: {
        include: { subunidade: true },
      },
      postoDeServico: true,
    },
    orderBy: { disponibilidade: 'asc' },
  })

  const prontos = peculios
    .filter(p => p.disponibilidade === 'PRONTO')
    .map(p => ({
      id: p.policial.id,
      nomeGuerra: p.policial.nomeGuerra || p.policial.nomeCompleto,
      matricula: p.policial.matricula,
      subunidade: p.policial.subunidade?.nome ?? "Sem Cia",
      postoServico: p.postoDeServico?.nome ?? "—",
    }))

  const naoProntos = peculios
    .filter(p => p.disponibilidade !== 'PRONTO')
    .map(p => ({
      id: p.policial.id,
      nomeGuerra: p.policial.nomeGuerra || p.policial.nomeCompleto,
      matricula: p.policial.matricula,
      subunidade: p.policial.subunidade?.nome ?? "Sem Cia",
      postoServico: p.postoDeServico?.nome ?? "—",
      disponibilidade: p.disponibilidade,
    }))

  return { prontos, naoProntos }
}

// ---------------------------------------------------------------------------
// Drill-down: Afastamentos
// ---------------------------------------------------------------------------

export async function listarAfastamentos() {
  const dataMesAtual = getDataMesAtual()

  const peculios = await prisma.peculio.findMany({
    where: {
      dataMesAno: dataMesAtual,
      situacaoFuncional: { not: 'ATIVO' },
    },
    include: {
      policial: {
        include: { subunidade: true },
      },
    },
    orderBy: { situacaoFuncional: 'asc' },
  })

  return peculios.map(p => ({
    id: p.policial.id,
    nomeGuerra: p.policial.nomeGuerra || p.policial.nomeCompleto,
    matricula: p.policial.matricula,
    subunidade: p.policial.subunidade?.nome ?? "Sem Cia",
    motivo: SITUACAO_LABELS[p.situacaoFuncional] || p.situacaoFuncional,
  }))
}

// ---------------------------------------------------------------------------
// Drill-down: Efetivo Total (ordenado por pecúlio)
// ---------------------------------------------------------------------------

export async function listarEfetivoComPeculio() {
  const dataMesAtual = getDataMesAtual()

  const policiais = await prisma.policial.findMany({
    where: ACTIVE_FILTER,
    include: {
      subunidade: true,
      peculios: {
        where: { dataMesAno: dataMesAtual },
        take: 1,
        include: { postoDeServico: true },
      },
    },
    orderBy: { id: 'desc' },
  })

  // Separar: sem pecúlio primeiro, com pecúlio depois
  const semPeculio = policiais
    .filter(p => !p.peculios || p.peculios.length === 0)
    .map(p => ({
      id: p.id,
      nomeGuerra: p.nomeGuerra || p.nomeCompleto,
      matricula: p.matricula,
      subunidade: p.subunidade?.nome ?? "Sem Cia",
      temPeculio: false,
      postoServico: null as string | null,
    }))

  const comPeculio = policiais
    .filter(p => p.peculios && p.peculios.length > 0)
    .map(p => ({
      id: p.id,
      nomeGuerra: p.nomeGuerra || p.nomeCompleto,
      matricula: p.matricula,
      subunidade: p.subunidade?.nome ?? "Sem Cia",
      temPeculio: true,
      postoServico: p.peculios?.[0]?.postoDeServico?.nome ?? null,
    }))

  return [...semPeculio, ...comPeculio]
}
