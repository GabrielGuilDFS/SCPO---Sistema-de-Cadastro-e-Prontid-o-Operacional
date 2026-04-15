import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const rota = req.nextUrl.pathname;

        // Regra 1: Controle de Acesso Baseado em Papel (RBAC) para o Cadastro
        if (rota.startsWith("/cadastro") && token?.perfil !== "ADMINISTRADOR") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/login',
        }
    }
)
export const config = {
    matcher: [
        "/dashboard/:path*",
        //manter comentado ate a logica de cadastro ficar pronta
        //"/cadastro/:path*",
        "/policiais/:path*"
    ],
}