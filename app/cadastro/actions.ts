"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

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

        // Transação: Cria o Policial e o Login juntos
        await prisma.$transaction(async (tx) => {
            const novoPolicial = await tx.policial.create({
                data: {
                    nomeCompleto,
                    matricula,
                },
            });

            await tx.login.create({
                data: {
                    policialId: novoPolicial.id,
                    matricula,
                    senhaHash: hashedSenha,
                    perfilAcesso: "OPERADOR",
                },
            });
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