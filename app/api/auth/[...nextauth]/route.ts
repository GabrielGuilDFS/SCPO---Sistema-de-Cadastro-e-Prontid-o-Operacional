import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "SCPO Login",
            credentials: {
                matricula: { label: "Matrícula", type: "text" },
                senha: { label: "Senha", type: "password" }
            },
            async authorize(credentials) {
                // 1. Verifica se o usuário digitou algo
                if (!credentials?.matricula || !credentials?.senha) {
                    return null;
                }

                // 2. Busca o login no banco de dados usando o Prisma
                const usuarioLogin = await prisma.login.findUnique({
                    where: { matricula: credentials.matricula },
                    include: { policial: true } // Já traz os dados do policial junto!
                });

                // 3. Se não achar o usuário ou se ele estiver bloqueado, barra o acesso
                if (!usuarioLogin || !usuarioLogin.statusAtivo) {
                    return null;
                }

                // 4. Compara a senha digitada com o Hash do banco
                const senhaValida = await bcrypt.compare(credentials.senha, usuarioLogin.senhaHash);

                if (!senhaValida) {
                    return null;
                }

                // 5. Deu tudo certo! Retorna os dados que vão ficar salvos na sessão (Cookie)
                return {
                    id: usuarioLogin.id.toString(),
                    name: usuarioLogin.policial.nomeCompleto,
                    matricula: usuarioLogin.matricula,
                    perfil: usuarioLogin.perfilAcesso,
                };
            }
        })
    ],
    pages: {
        signIn: '/login', // Avisa ao NextAuth que a sua tela de login customizada fica nessa rota
    },
    session: {
        strategy: "jwt", // Usa tokens JSON Web para segurança
        maxAge: 8 * 60 * 60, // Tempo de sessão: 8 horas (duração de um turno de serviço padrão)
    }
});

export { handler as GET, handler as POST };