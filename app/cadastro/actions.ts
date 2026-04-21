"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"
import { Prisma } from '@prisma/client'

export async function cadastrarUsuario(formData: FormData) {
    const nomeCompleto = formData.get("nome") as string;
    const matricula = formData.get("matricula") as string;
    const senha = formData.get("senha") as string;
    const confirmaSenha = formData.get("confirma-senha") as string;

    if (senha !== confirmaSenha) {
        return { success: false, message: "As senhas não coincidem." };
    }

    try {
        const hashedSenha = await bcrypt.hash(senha, 10);

        const policialExistente = await prisma.policial.findUnique({
            where: { matricula }
        });

        if (!policialExistente) {
            return { success: false, message: "Policial não encontrado no sistema. Cadastre os dados no RH primeiro." };
        }

        await prisma.login.create({
            data: {
                policialId: policialExistente.id,
                matricula,
                senhaHash: hashedSenha,
                perfilAcesso: "OPERADOR",
            },
        });

        return { success: true, message: "Cadastro realizado com sucesso!" };
    } catch (error: any) {
        // Tratamento básico para matrícula duplicada
        if (error.code === 'P2002') {
            return { success: false, message: "Esta matrícula já está cadastrada." };
        }
        return { success: false, message: "Erro interno ao cadastrar." };
    }
}