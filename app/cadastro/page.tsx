import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function CadastroPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center bg-zinc-950 px-4 py-12">
            {/* Sobreposição escura e marrom */}
            <div className="absolute inset-0 bg-[#000000] opacity-70"></div>
            <div className="absolute inset-0 bg-[#97836a] opacity-30"></div>

            {/* Cartão de Cadastro*/}
            <Card className="relative z-10 w-full max-w-lg rounded-2xl bg-[#ffffff] shadow-2xl">

                {/* Cabeçalho com Logotipo */}
                <div className="flex flex-col items-center justify-center space-y-3 border-b border-slate-100 p-6">
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

                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-normal tracking-wider text-[#000000]">
                        Cadastro de usuário
                    </CardTitle>
                </CardHeader>

                <CardContent className="px-8 pb-8">
                    <form className="space-y-2">
                        {/* Campo Nome */}
                        <div className="">
                            <Label htmlFor="nome" className="text-sm font-normal text-[#000000]">Nome</Label>
                            <Input
                                id="nome"
                                type="text"
                                className="w-full rounded-5 border border-slate-500 bg-transparent pl-15 py-4 text-lg text-[#000000] placeholder:text-slate-400 focus:border-[#302a22] focus-visible:ring-1 focus-visible:ring-[#302a22]"
                            />
                        </div>

                        {/* Campo Matrícula */}
                        <div className="">
                            <Label htmlFor="matricula" className="text-sm font-normal text-[#000000]">Matrícula</Label>
                            <Input
                                id="matricula"
                                type="text"
                                className="w-full rounded-5 border border-slate-500 bg-transparent pl-15 py-4 text-lg text-[#000000] placeholder:text-slate-400 focus:border-[#302a22] focus-visible:ring-1 focus-visible:ring-[#302a22]"
                            />
                        </div>

                        {/* Campo Email */}
                        <div className="">
                            <Label htmlFor="email" className="text-sm font-normal text-[#000000]">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                className="w-full rounded-5 border border-slate-500 bg-transparent pl-15 py-4 text-lg text-[#000000] placeholder:text-slate-400 focus:border-[#302a22] focus-visible:ring-1 focus-visible:ring-[#302a22]"
                            />
                        </div>

                        {/* Campo Senha */}
                        <div className="">
                            <Label htmlFor="senha" className="text-sm font-normal text-[#000000]">Senha</Label>
                            <Input
                                id="senha"
                                type="password"
                                className="w-full rounded-5 border border-slate-500 bg-transparent pl-15 py-4 text-lg text-[#000000] placeholder:text-slate-400 focus:border-[#302a22] focus-visible:ring-1 focus-visible:ring-[#302a22]"
                            />
                        </div>

                        {/* Campo Confirma a senha */}
                        <div className="">
                            <Label htmlFor="confirma-senha" className="text-sm font-normal text-[#000000]">Confirma a senha</Label>
                            <Input
                                id="confirma-senha"
                                type="password"
                                className="w-full rounded-5 border border-slate-500 bg-transparent pl-15 py-4 text-lg text-[#000000] placeholder:text-slate-400 focus:border-[#302a22] focus-visible:ring-1 focus-visible:ring-[#302a22]"
                            />
                        </div>

                        {/* Botão Cadastrar*/}
                        <div className="pt-4 space-y-6">
                            <Button
                                type="submit"
                                className="w-full rounded-md bg-[#97836a] py-6 text-xl font-bold uppercase text-[#ffffff] hover:bg-[#7f6e59]"
                            >
                                CADASTRAR
                            </Button>
                            <div className="text-center text-lg text-[#000000]">
                                Já possui cadastro? {' '}
                                <Link href="/" className="font-semibold text-[#97836a] hover:text-[#7f6e59]">
                                    Entrar
                                </Link>
                            </div>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}