import { getPoliciaisOptions, getPostosOptions } from "@/app/actions/peculio"
import { PeculioForm } from "@/components/peculio/PeculioForm"

export const dynamic = "force-dynamic"

export default async function PeculioPage() {
  const policiais = await getPoliciaisOptions()
  const postos = await getPostosOptions()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#3c342a" }}>Cadastro de Pecúlio</h1>
        <p className="text-muted-foreground mt-2">
          Registre a prontidão operacional e as condições de emprego dos policiais na subunidade.
        </p>
      </div>
      
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-slate-200">
        <PeculioForm policiais={policiais} postos={postos} />
      </div>
    </div>
  )
}
