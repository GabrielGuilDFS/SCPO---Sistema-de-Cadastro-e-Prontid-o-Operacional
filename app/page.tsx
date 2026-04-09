import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { User, Lock, Eye, BotMessageSquare } from "lucide-react"
import Link from "next/link"


export default function LoginSCPO() {
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
            {/* Logotipo */}
            <img
              src="/Logo-batal-removebg-preview.png"
              alt="SCPO - Sistema de Cadastro e Prontidão Operacional"
              className="h-28 w-auto object-contain"
            />
            <div className="text-center space-y-1">
              <h2 className="text-4xl font-bold tracking-tighter text-[#000000]">SCPO</h2>
              <p className="text-sm font-medium uppercase tracking-wider text-[#000000] opacity-70">Sistema de Cadastro e Prontidão Operacional</p>
            </div>
          </div>

          {/* Formulário de Login */}
          <form className="space-y-2">

            {/* Campo Matrícula */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#97836a]" />
              <Input
                type="text"
                placeholder="Digite sua matrícula..."
                className="w-full rounded-5 border border-slate-500 bg-transparent pl-15 py-5 text-lg text-[#000000] placeholder:text-slate-400 focus:border-[#97836a] focus-visible:ring-1 focus-visible:ring-[#97836a]"
              />
            </div>

            {/* Campo Senha */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-[#97836a]" />
              <Input
                type="password"
                placeholder="Digite sua senha..."
                className="w-full rounded-5 border border-slate-500 bg-transparent pl-15 pr-12 py-5 text-lg text-[#000000] placeholder:text-slate-400 focus:border-[#97836a] focus-visible:ring-1 focus-visible:ring-[#97836a]"
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2 text-slate-500 hover:bg-transparent hover:text-[#97836a]">
                <Eye className="h-6 w-6" />
              </Button>
            </div>

            {/* Link Esqueceu a senha */}
            <div className="flex items-center justify-start !ml-3">
              <a href="#" className="text-md font-medium text-[#97836a] hover:text-[#7f6e59]">
                Esqueceu a senha?
              </a>
            </div>

            {/* Placeholder para o reCAPTCHA v2 */}
            <div className="flex h-15 w-fit min-w-[430px] items-center justify-between rounded border border-slate-300 bg-slate-50 p-3 shadow-sm">
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
            <div className="flex items-center space-x-3 !ml-3">
              <Checkbox id="manter-conectado" className="h-6 w-6 border-slate-300 focus-visible:ring-0" />
              <label htmlFor="manter-conectado" className="text-md text-[#000000]">
                Manter-se conectado
              </label>
            </div>

            {/* Botão ENTRAR */}
            <div className="pt-2">
              <Button type="submit" className="w-full bg-[#97836a] py-6 text-xl font-bold uppercase text-[#ffffff] hover:bg-[#7f6e59]">
                ENTRAR
              </Button>
            </div>
          </form>

          {/* Seção Inferior */}
          <div className="text-center text-md text-[#000000]">
            Ainda não tem cadastro? {' '}
            <a href="/cadastro" className="font-semibold text-[#97836a] hover:text-[#7f6e59]">
              Cadastrar-se
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}