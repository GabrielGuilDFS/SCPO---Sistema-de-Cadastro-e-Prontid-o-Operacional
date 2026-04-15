import LoginForm from "./LoginForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function LoginPage() {
    const session = await getServerSession(authOptions);
    
    // Restrição de Rota Negativa: Se já tem sessão, manda pro dashboard
    if (session) {
        redirect("/dashboard");
    }

    return <LoginForm />;
}
