"use client"

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { User, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

export default function LoginSCPO() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [matricula, setMatricula] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Capturar erro vindo via URL (caso de redirecionamento do NextAuth)
  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "USER_DEACTIVATED") {
      setErro("Acesso negado. Este usuário não possui mais permissão para acessar o sistema. Entre em contato com a Telemática do 20º BPM.")
    }
  }, [searchParams])

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 7) value = value.slice(0, 7)
    if (value.length > 6) {
      value = value.replace(/(\d{6})(\d{1})/, "$1-$2")
    }
    setMatricula(value)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setLoading(true)

    try {
      const resultado = await signIn("credentials", {
        matricula,
        senha,
        redirect: false,
      })

      if (resultado?.error) {
        // NextAuth mapeia erros de authorize para "CredentialsSignin" ou a mensagem jogada
        if (resultado.error.includes("USER_DEACTIVATED")) {
          setErro("Acesso negado. Este usuário não possui mais permissão para acessar o sistema. Entre em contato com a Telemática do 20º BPM.")
          toast.error("Usuário Desativado", {
            description: "Procure a seção de informática para reativação."
          })
        } else {
          setErro("Matrícula ou senha incorretos.")
        }
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setErro("Ocorreu um erro ao tentar realizar o login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-950 px-4 py-12 font-sans text-slate-900">
      <div className="absolute inset-0 bg-[#000000] opacity-70"></div>
      <div className="absolute inset-0 bg-[#97836a] opacity-30"></div>

      <Card className="relative z-10 w-full max-w-lg rounded-2xl bg-[#ffffff] px-6 py-10 shadow-2xl border-none">
        <CardContent className="space-y-5">
          <div className="flex flex-col items-center justify-center space-y-1 !mb-5">
            <img
              src="/Logo-batal-removebg-preview.png"
              alt="SCPO"
              className="h-28 w-auto object-contain"
            />
            <div className="text-center space-y-1">
              <h2 className="text-4xl font-bold tracking-tighter text-[#000000]">SCPO</h2>
              <p className="text-sm font-medium uppercase tracking-wider text-[#000000] opacity-70">
                Sistema de Cadastro e Prontidão Operacional
              </p>
            </div>
          </div>

          {erro && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-200 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-red-700 leading-relaxed">{erro}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#97836a]" />
              <Input
                type="text"
                value={matricula}
                onChange={handleMatriculaChange}
                maxLength={8}
                placeholder="Matrícula"
                className="w-full rounded-xl border-slate-200 bg-slate-50 pl-12 py-7 text-lg text-slate-900 placeholder:text-slate-400 focus:border-[#97836a] focus:bg-white"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#97836a]" />
              <Input
                type={showPassword ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                className="w-full rounded-xl border-slate-200 bg-slate-50 pl-12 pr-12 py-7 text-lg text-slate-900 placeholder:text-slate-400 focus:border-[#97836a] focus:bg-white"
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 text-slate-400 hover:text-[#97836a]"
              >
                {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </Button>
            </div>

            <div className="flex items-center justify-between !ml-1 pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="manter" className="border-slate-300" />
                <label htmlFor="manter" className="text-sm font-medium text-slate-600 cursor-pointer">
                  Manter conectado
                </label>
              </div>
              <a href="#" className="text-sm font-semibold text-[#97836a] hover:underline">
                Esqueceu a senha?
              </a>
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#3c342a] hover:bg-black py-7 text-lg font-bold uppercase text-white rounded-xl shadow-lg transition-all active:scale-[0.98]"
            >
              {loading ? "Processando..." : "Entrar no Sistema"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
