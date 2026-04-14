"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { cadastrarUsuario } from "./actions"

export default function CadastroPage() {
    const router = useRouter()
    const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro', texto: string } | null>(null)
    const [loading, setLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setMensagem(null)

        const formData = new FormData(event.currentTarget)
        const resultado = await cadastrarUsuario(formData)

        if (resultado.success) {
            setMensagem({ tipo: 'sucesso', texto: resultado.message })
            setTimeout(() => {
                router.push("/")
            }, 2000)
        } else {
            setMensagem({ tipo: 'erro', texto: resultado.message })
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-zinc-950 px-4 py-12">
            <div className="absolute inset-0 bg-[#000000] opacity-70"></div>
            <div className="absolute inset-0 bg-[#97836a] opacity-30"></div>

            <Card className="relative z-10 w-full max-w-lg rounded-2xl bg-[#ffffff] shadow-2xl">
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
                    {/* Exibição de Mensagens (Erro ou Sucesso) */}
                    {mensagem && (
                        <div className={`mb-4 rounded-md p-3 text-center border ${mensagem.tipo === 'sucesso' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                            <p className="text-sm font-medium">{mensagem.texto}</p>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="nome" className="text-sm font-normal text-[#000000]">Nome Completo</Label>
                            <Input id="nome" name="nome" type="text" required className="w-full rounded-md border border-slate-500 bg-transparent py-4 text-lg focus:border-[#302a22]" />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="matricula" className="text-sm font-normal text-[#000000]">Matrícula</Label>
                            <Input id="matricula" name="matricula" type="text" required className="w-full rounded-md border border-slate-500 bg-transparent py-4 text-lg focus:border-[#302a22]" />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="senha" className="text-sm font-normal text-[#000000]">Senha</Label>
                            <Input id="senha" name="senha" type="password" required className="w-full rounded-md border border-slate-500 bg-transparent py-4 text-lg focus:border-[#302a22]" />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="confirma-senha" className="text-sm font-normal text-[#000000]">Confirma a senha</Label>
                            <Input id="confirma-senha" name="confirma-senha" type="password" required className="w-full rounded-md border border-slate-500 bg-transparent py-4 text-lg focus:border-[#302a22]" />
                        </div>

                        <div className="pt-4 space-y-6">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-md bg-[#97836a] py-6 text-xl font-bold uppercase text-[#ffffff] hover:bg-[#7f6e59] disabled:opacity-50"
                            >
                                {loading ? "Cadastrando..." : "CADASTRAR"}
                            </Button>
                            <div className="text-center text-lg text-[#000000]">
                                Já possui cadastro? {' '}
                                <Link href="/login" className="font-semibold text-[#97836a] hover:text-[#7f6e59]">
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