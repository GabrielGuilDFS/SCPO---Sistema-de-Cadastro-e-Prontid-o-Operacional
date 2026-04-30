"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Disponibilidade, SituacaoFuncional, CondicaoOperacional } from "@prisma/client"

interface CadastrarPeculioParams {
  id?: number
  policialId: number
  postoDeServicoId: number
  disponibilidade: Disponibilidade
  situacaoFuncional: SituacaoFuncional
  condicaoOperacional: CondicaoOperacional
  mes: number
  ano: number
}

export async function cadastrarPeculio(data: CadastrarPeculioParams) {
  try {
    // Validar se o mês e ano formam uma data válida (primeiro dia do mês)
    const dataMesAno = new Date(data.ano, data.mes - 1, 1)

    // Verificar duplicidade: o militar já tem registro para este mês/ano?
    const existente = await prisma.peculio.findFirst({
      where: {
        policialId: data.policialId,
        dataMesAno: dataMesAno,
        ...(data.id ? { NOT: { id: data.id } } : {})
      }
    })

    if (existente) {
      return { 
        error: "Este policial já possui um pecúlio registrado para este mês e ano.",
        success: false
      }
    }

    if (data.id) {
      await prisma.peculio.update({
        where: { id: data.id },
        data: {
          postoDeServicoId: data.postoDeServicoId,
          disponibilidade: data.disponibilidade,
          situacaoFuncional: data.situacaoFuncional,
          condicaoOperacional: data.condicaoOperacional,
        }
      })
    } else {
      await prisma.peculio.create({
        data: {
          policialId: data.policialId,
          postoDeServicoId: data.postoDeServicoId,
          disponibilidade: data.disponibilidade,
          situacaoFuncional: data.situacaoFuncional,
          condicaoOperacional: data.condicaoOperacional,
          dataMesAno: dataMesAno
        }
      })
    }

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/peculio')

    return { success: true, message: "Pecúlio registrado com sucesso!" }
  } catch (error) {
    console.error("Erro ao cadastrar pecúlio:", error)
    return { error: "Ocorreu um erro interno ao cadastrar o pecúlio.", success: false }
  }
}

interface LancamentoItem {
  policialId: number
  postoDeServicoId: number
  disponibilidade: Disponibilidade
  situacaoFuncional: SituacaoFuncional
  condicaoOperacional: CondicaoOperacional
}

interface CadastrarPeculioEmLoteParams {
  mes: number
  ano: number
  lancamentos: LancamentoItem[]
}

export async function cadastrarPeculioEmLote(data: CadastrarPeculioEmLoteParams) {
  try {
    if (!data.lancamentos || data.lancamentos.length === 0) {
      return { error: "Nenhum lançamento informado.", success: false }
    }

    const dataMesAno = new Date(data.ano, data.mes - 1, 1)

    // Verificar duplicidade para cada policial no lote
    const policialIds = data.lancamentos.map(l => l.policialId)
    
    // Verificar se há IDs duplicados dentro do próprio lote
    const idsUnicos = new Set(policialIds)
    if (idsUnicos.size !== policialIds.length) {
      return { error: "Existem policiais duplicados na lista. Cada policial pode aparecer apenas uma vez.", success: false }
    }

    // Verificar se algum policial já possui pecúlio para este período
    const existentes = await prisma.peculio.findMany({
      where: {
        policialId: { in: policialIds },
        dataMesAno: dataMesAno
      },
      include: {
        policial: {
          select: { nomeGuerra: true, nomeCompleto: true }
        }
      }
    })

    if (existentes.length > 0) {
      const nomes = existentes.map(e => e.policial.nomeGuerra || e.policial.nomeCompleto).join(", ")
      return { 
        error: `Os seguintes policiais já possuem pecúlio para ${data.mes}/${data.ano}: ${nomes}`, 
        success: false 
      }
    }

    // Inserção atômica com transaction
    const resultado = await prisma.$transaction(
      data.lancamentos.map(lancamento =>
        prisma.peculio.create({
          data: {
            policialId: lancamento.policialId,
            postoDeServicoId: lancamento.postoDeServicoId,
            disponibilidade: lancamento.disponibilidade,
            situacaoFuncional: lancamento.situacaoFuncional,
            condicaoOperacional: lancamento.condicaoOperacional,
            dataMesAno: dataMesAno
          }
        })
      )
    )

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/peculio')

    return { 
      success: true, 
      message: `${resultado.length} lançamento(s) de pecúlio registrado(s) com sucesso!`,
      count: resultado.length 
    }
  } catch (error) {
    console.error("Erro ao cadastrar pecúlio em lote:", error)
    return { error: "Ocorreu um erro interno ao cadastrar o lote de pecúlio.", success: false }
  }
}

export async function getPoliciaisOptions() {
  try {
    const policiais = await prisma.policial.findMany({
      select: { 
        id: true, 
        nomeGuerra: true, 
        nomeCompleto: true, 
        matricula: true, 
        grauHierarquico: true,
        subunidade: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        nomeCompleto: 'asc'
      }
    })
    return policiais
  } catch (error) {
    console.error("Erro ao buscar policiais:", error)
    return []
  }
}

export async function getPostosOptions() {
  try {
    const postos = await prisma.postoDeServico.findMany({
      select: { 
        id: true, 
        nome: true,
        subunidade: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    })
    return postos
  } catch (error) {
    console.error("Erro ao buscar postos:", error)
    return []
  }
}

export async function getPoliciaisDisponiveis(mes: number, ano: number) {
  try {
    const dataMesAno = new Date(ano, mes - 1, 1)

    const policiais = await prisma.policial.findMany({
      where: {
        status: { not: 'INATIVO' },
        OR: [ { login: null }, { login: { statusAtivo: true } } ],
        NOT: {
          peculios: {
            some: {
              dataMesAno: dataMesAno
            }
          }
        }
      },
      select: { 
        id: true, 
        nomeGuerra: true, 
        nomeCompleto: true, 
        matricula: true, 
        grauHierarquico: true,
        subunidade: {
          select: {
            nome: true
          }
        }
      },
      orderBy: {
        nomeCompleto: 'asc'
      }
    })
    return policiais
  } catch (error) {
    console.error("Erro ao buscar policiais disponíveis:", error)
    return []
  }
}

export async function checkPolicialDisponivel(policialId: number, mes: number, ano: number, excludePeculioId?: number) {
  if (!policialId || !mes || !ano) return false;
  try {
    const dataMesAno = new Date(ano, mes - 1, 1)
    const existente = await prisma.peculio.findFirst({
      where: {
        policialId,
        dataMesAno,
        ...(excludePeculioId ? { NOT: { id: excludePeculioId } } : {})
      }
    })
    return !existente // true if available, false if already scheduled
  } catch (error) {
    console.error("Erro ao checar disponibilidade do policial:", error)
    return false
  }
}

export async function getHistoricoPeculio(policialId: number, mes: number, ano: number) {
  try {
    const dataMesAnoAtual = new Date(ano, mes - 1, 1)

    const peculioAtual = await prisma.peculio.findFirst({
      where: {
        policialId,
        dataMesAno: dataMesAnoAtual
      },
      include: {
        postoDeServico: {
          include: { subunidade: true }
        }
      }
    })

    const historico = await prisma.peculio.findMany({
      where: {
        policialId,
        dataMesAno: {
          lt: dataMesAnoAtual
        }
      },
      orderBy: {
        dataMesAno: 'desc'
      },
      take: 3,
      include: {
        postoDeServico: {
          include: { subunidade: true }
        }
      }
    })

    return { peculioAtual, historico }
  } catch (error) {
    console.error("Erro ao buscar histórico de pecúlio:", error)
    return { peculioAtual: null, historico: [] }
  }
}


