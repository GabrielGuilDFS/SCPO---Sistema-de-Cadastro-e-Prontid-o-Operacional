"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { User, Lock, Eye, BotMessageSquare } from "lucide-react"

export default function LoginSCPO() {
  const router = useRouter()

  // Estados para guardar o que o usuário digita
  const [matricula, setMatricula] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "") // Remove tudo que não é número
    if (value.length > 7) value = value.slice(0, 7) // Limita a 7 dígitos numéricos

    // Aplica a máscara modelo Matrícula Militar: 999999-9
    if (value.length > 6) {
      value = value.replace(/(\d{6})(\d{1})/, "$1-$2")
    }

    setMatricula(value)
  }

  // Função que dispara quando o botão ENTRAR é clicado
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Evita que a página recarregue sozinha
    setErro("")

    const resultado = await signIn("credentials", {
      matricula,
      senha,
      redirect: false,
    })

    if (resultado?.error) {
      setErro("Matrícula ou senha incorretos.")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    // Fundo da Tela Cheia
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-950 px-4 py-12">
      {/* Sobreposição escura e marrom */}
      <div className="absolute inset-0 bg-[#000000] opacity-70"></div>
      <div className="absolute inset-0 bg-[#97836a] opacity-30"></div>

      {/* Cartão de Login */}
      <Card className="relative z-10 w-full max-w-lg rounded-2xl bg-[#ffffff] px-6 py-10 shadow-2xl">
        <CardContent className="space-y-5">

          {/* Seção do Logotipo */}
          <div className="flex flex-col items-center justify-center space-y-1 !mb-5">
            <img
              src="/Logo-batal-removebg-preview.png"
              alt="SCPO - Sistema de Cadastro e Prontidão Operacional"
              className="h-28 w-auto object-contain"
            />
            <div className="text-center space-y-1">
              <h2 className="text-4xl font-bold tracking-tighter text-[#000000]">SCPO</h2>
              <p className="text-sm font-medium uppercase tracking-wider text-[#000000] opacity-70">
                Sistema de Cadastro e Prontidão Operacional
              </p>
            </div>
          </div>

          {/* MENSAGEM DE ERRO (Aparece apenas se errar a senha) */}
          {erro && (
            <div className="rounded-md bg-red-50 p-3 text-center border border-red-200">
              <p className="text-sm font-medium text-red-600">{erro}</p>
            </div>
          )}

          {/* Formulário de Login (Agora conectado ao handleLogin) */}
          <form onSubmit={handleLogin} className="space-y-2">

            {/* Campo Matrícula */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#97836a]" />
              <Input
                type="text"
                value={matricula}
                onChange={handleMatriculaChange}
                maxLength={8}
                placeholder="Digite sua matrícula..."
                className="w-full rounded-md border border-slate-500 bg-transparent pl-12 py-6 text-lg text-[#000000] placeholder:text-slate-400 focus:border-[#97836a] focus-visible:ring-1 focus-visible:ring-[#97836a]"
              />
            </div>

            {/* Campo Senha */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#97836a]" />
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)} // Salva a senha
                placeholder="Digite sua senha..."
                className="w-full rounded-md border border-slate-500 bg-transparent pl-12 pr-12 py-6 text-lg text-[#000000] placeholder:text-slate-400 focus:border-[#97836a] focus-visible:ring-1 focus-visible:ring-[#97836a]"
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 text-slate-500 hover:bg-transparent hover:text-[#97836a]">
                <Eye className="h-6 w-6" />
              </Button>
            </div>

            {/* Link Esqueceu a senha */}
            <div className="flex items-center justify-start !ml-1 pt-1">
              <a href="#" className="text-sm font-medium text-[#97836a] hover:text-[#7f6e59]">
                Esqueceu a senha?
              </a>
            </div>

            {/* Placeholder para o reCAPTCHA v2 */}
            <div className="flex h-16 w-full items-center justify-between rounded border border-slate-300 bg-slate-50 p-3 shadow-sm mt-4">
              <div className="flex items-center gap-3">
                <Checkbox id="recaptcha-check" className="h-6 w-6 border-2 border-slate-400 rounded-sm focus-visible:ring-0" />
                <label htmlFor="recaptcha-check" className="text-sm font-medium text-[#000000]">Não sou um robô</label>
              </div>
              <div className="flex flex-col items-center justify-center text-slate-500 ml-4">
                <BotMessageSquare className="h-7 w-7 text-slate-400" />
                <p className="text-[10px] mt-1">reCAPTCHA</p>
              </div>
            </div>

            {/* Manter-se conectado */}
            <div className="flex items-center space-x-3 !ml-1 py-2">
              <Checkbox id="manter-conectado" className="h-5 w-5 border-slate-400 focus-visible:ring-0" />
              <label htmlFor="manter-conectado" className="text-sm text-[#000000]">
                Manter-se conectado
              </label>
            </div>

            {/* Botão ENTRAR */}
            <div className="pt-2">
              <Button type="submit" className="w-full bg-[#97836a] py-6 text-lg font-bold uppercase text-[#ffffff] hover:bg-[#7f6e59]">
                ENTRAR
              </Button>
            </div>
          </form>

          {/* Seção Inferior */}
          <div className="text-center text-sm text-[#000000] pt-2">
            Ainda não tem cadastro? {' '}
            <a href="/cadastro" className="font-semibold text-[#97836a] hover:text-[#7f6e59]">
              Cadastrar-se
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}