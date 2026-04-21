"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { policialFormSchema, PolicialFormData } from "@/lib/schemas/policial"

export async function salvarDadosPolicial(data: PolicialFormData) {
  try {
    // Valida os dados com o schema
    const validData = policialFormSchema.parse(data);

    const policialData: Prisma.PolicialCreateInput = {
      nomeCompleto: validData.nomeCompleto,
      nomeGuerra: validData.nomeGuerra || null,
      cpf: validData.cpf,
      rg: validData.rg,
      matricula: validData.matricula,
      cnhCategoria: validData.cnhCategoria,
      cnhNumero: validData.cnhNumero || null,
      dataAdmissao: new Date(validData.dataAdmissao),
      grauHierarquico: validData.grauHierarquico,
      possuiPlanoSaude: validData.possuiPlanoSaude,
      dataNascimento: new Date(validData.dataNascimento),
      sexo: validData.sexo,
      tipoSanguineo: validData.tipoSanguineo,
      estadoCivil: validData.estadoCivil,
      escolaridade: validData.escolaridade,
      religiosidade: validData.religiosidade || null,
      telefonePrimario: validData.telefonePrimario,
      telefoneSecundario: validData.telefoneSecundario || null,
      email: validData.email || null,
      observacoes: validData.observacoes || null,
      // @ts-ignore - Prisma Types Cache
      imagemUrl: typeof (validData as any).imagemUrl === 'string' ? (validData as any).imagemUrl : null,
      status: "pronto",
    };

    if (validData.subunidadeId) {
      policialData.subunidade = { connect: { id: parseInt(validData.subunidadeId) } };
    }

    if (validData.funcaoAtualId) {
      policialData.funcaoAtual = { connect: { id: parseInt(validData.funcaoAtualId) } };
    }

    if (validData.logradouro || validData.cep) {
      policialData.endereco = {
        create: {
          logradouro: validData.logradouro || null,
          numero: validData.numero || null,
          bairro: validData.bairro || null,
          cidade: validData.cidade || null,
          estado: validData.estado || null,
          cep: validData.cep || null,
        }
      };
    }

    // Salva no banco de dados
    const policial = await prisma.policial.create({
      data: policialData
    });

    revalidatePath('/dashboard', 'layout');

    return { success: true, message: "Policial cadastrado com sucesso!", data: policial };
  } catch (error: any) {
    console.error("Erro ao salvar policial:", error);

    // Tratamento de erro único do Prisma (Unique constraint falhou)
    if (error.code === 'P2002') {
      const target = error.meta?.target?.[0] || 'campo';
      if (target === 'cpf') {
        return { success: false, message: "Este CPF já está cadastrado no sistema." };
      }
      if (target === 'matricula') {
        return { success: false, message: "Esta Matrícula já está cadastrada no sistema." };
      }
      return { success: false, message: `O registro informado (${target}) já existe no banco de dados.` };
    }

    return { success: false, message: error.message || "Erro interno ao cadastrar policial." };
  }
}
