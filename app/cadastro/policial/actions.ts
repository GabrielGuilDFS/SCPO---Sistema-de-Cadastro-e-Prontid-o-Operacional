"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { policialFormSchema, PolicialFormData } from "@/lib/schemas/policial"
import bcrypt from "bcrypt"

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

    // Hash da senha padrão temporária
    const senhaPadrao = '@PMBA2026';
    const senhaHash = await bcrypt.hash(senhaPadrao, 10);
    const perfil = validData.perfilAcesso || "VISUALIZADOR";

    // Salva no banco de dados usando Transaction para garantir atomicidade
    const policial = await prisma.$transaction(async (tx) => {
      // 1. Cria o policial
      const novoPolicial = await tx.policial.create({
        data: policialData
      });

      // 2. Cria o login associado (usando a matrícula como username e senha com hash)
      await tx.login.create({
        data: {
          policialId: novoPolicial.id,
          matricula: novoPolicial.matricula,
          perfilAcesso: perfil as any,
          senhaHash: senhaHash,
          statusAtivo: true,
        }
      });

      return novoPolicial;
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
        return { success: false, message: "Esta Matrícula já está cadastrada no sistema ou já possui um login ativo." };
      }
      return { success: false, message: `O registro informado (${target}) já existe no banco de dados.` };
    }

    return { success: false, message: error.message || "Erro interno ao cadastrar policial." };
  }
}

export async function atualizarPolicial(id: number, data: PolicialFormData) {
  try {
    const validData = policialFormSchema.parse(data);

    const updateData: Prisma.PolicialUpdateInput = {
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
      imagemUrl: typeof validData.imagemUrl === 'string' ? validData.imagemUrl : null,
    };

    if (validData.subunidadeId && validData.subunidadeId !== 'none') {
      updateData.subunidade = { connect: { id: parseInt(validData.subunidadeId) } };
    } else {
      updateData.subunidade = { disconnect: true };
    }

    if (validData.funcaoAtualId && validData.funcaoAtualId !== 'none') {
      updateData.funcaoAtual = { connect: { id: parseInt(validData.funcaoAtualId) } };
    } else {
      updateData.funcaoAtual = { disconnect: true };
    }

    if (validData.logradouro || validData.cep) {
      updateData.endereco = {
        upsert: {
          create: {
            logradouro: validData.logradouro || null,
            numero: validData.numero || null,
            bairro: validData.bairro || null,
            cidade: validData.cidade || null,
            estado: validData.estado || null,
            cep: validData.cep || null,
          },
          update: {
            logradouro: validData.logradouro || null,
            numero: validData.numero || null,
            bairro: validData.bairro || null,
            cidade: validData.cidade || null,
            estado: validData.estado || null,
            cep: validData.cep || null,
          }
        }
      };
    }

    const policial = await prisma.policial.update({
      where: { id },
      data: updateData
    });

    revalidatePath('/dashboard', 'layout');

    return { success: true, message: "Policial atualizado com sucesso!", data: policial };
  } catch (error: any) {
    console.error("Erro ao atualizar policial:", error);
    return { success: false, message: error.message || "Erro interno ao atualizar policial." };
  }
}

export async function desativarPolicial(policialId: number) {
  try {
    await prisma.$transaction([
      prisma.policial.update({
        where: { id: policialId },
        data: { status: 'INATIVO' }
      }),
      prisma.login.updateMany({
        where: { policialId },
        data: { statusAtivo: false }
      })
    ]);

    revalidatePath('/dashboard');
    return { success: true, message: "Policial desativado com sucesso!" };
  } catch (error: any) {
    console.error("Erro ao desativar policial:", error);
    return { success: false, message: "Erro ao desativar policial." };
  }
}

export async function ativarPolicial(policialId: number) {
  try {
    await prisma.$transaction([
      prisma.policial.update({
        where: { id: policialId },
        data: { status: 'pronto' }
      }),
      prisma.login.updateMany({
        where: { policialId },
        data: { statusAtivo: true }
      })
    ]);

    revalidatePath('/dashboard');
    return { success: true, message: "Policial reativado com sucesso!" };
  } catch (error: any) {
    console.error("Erro ao reativar policial:", error);
    return { success: false, message: "Erro ao reativar policial." };
  }
}
