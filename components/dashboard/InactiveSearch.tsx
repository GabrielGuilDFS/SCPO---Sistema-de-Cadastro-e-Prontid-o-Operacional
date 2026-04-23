"use client"

import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition, useState, useEffect } from "react"
import { useDebouncedCallback } from "use-debounce"

export function InactiveSearch() {
  const { replace } = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "")

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`)
    })
  }, 300)

  // Sincroniza o estado local se a URL mudar externamente (ex: botão voltar)
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || "")
  }, [searchParams])

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
        {isPending ? (
          <Loader2 className="h-5 w-5 text-[#cca471] animate-spin" />
        ) : (
          <Search className="h-5 w-5 text-slate-400" />
        )}
      </div>
      <Input
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          handleSearch(e.target.value)
        }}
        placeholder="Buscar inativo por nome, matrícula, CPF ou subunidade..."
        className="pl-10 bg-white border-none text-slate-900 h-12 text-lg shadow-inner focus-visible:ring-[#cca471]"
      />
    </div>
  )
}
