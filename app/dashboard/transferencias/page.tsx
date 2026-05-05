import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TransferenciasPageClient } from "./TransferenciasPageClient"
import { getBGOsAgrupados } from "@/app/actions/transferencia"

export default async function TransferenciasPage() {
  const session = await getServerSession(authOptions)

  // Buscar subunidades e policiais para os selects
  const [subunidades, policiais] = await Promise.all([
    prisma.subunidade.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, sigla: true },
    }),
    prisma.policial.findMany({
      where: {
        AND: [
          { status: { not: "INATIVO" } },
          { OR: [{ login: null }, { login: { statusAtivo: true } }] },
        ],
      },
      orderBy: { nomeCompleto: "asc" },
      select: {
        id: true,
        nomeCompleto: true,
        nomeGuerra: true,
        matricula: true,
        grauHierarquico: true,
        subunidadeId: true,
        subunidade: { select: { nome: true, sigla: true } },
      },
    }),
  ])

  // Buscar agrupamento inicial de BGOs
  const bgosIniciais = await getBGOsAgrupados()

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8 space-y-8">
      <section>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Transferências
        </h2>
        <p className="text-[#b1a99f] mt-1">
          Registre movimentações em lote e acompanhe o histórico por BGO.
        </p>
      </section>

      <TransferenciasPageClient
        subunidades={subunidades}
        policiais={policiais as any[]}
        bgosIniciais={bgosIniciais}
      />
    </div>
  )
}
