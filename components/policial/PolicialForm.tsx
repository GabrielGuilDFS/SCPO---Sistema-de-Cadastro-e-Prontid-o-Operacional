"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { policialFormSchema, PolicialFormData } from "@/lib/schemas/policial"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useState, useEffect, useRef } from "react"
import { Camera } from "lucide-react"
import { salvarDadosPolicial, atualizarPolicial } from "@/app/cadastro/policial/actions"
import { uploadImage } from "@/app/cadastro/policial/uploadAction"

const maskCpf = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

const maskRg = (value: string) => {
  let v = value.replace(/[^a-zA-Z0-9]/g, "");
  if (v.length > 8) {
    v = v.replace(/^(\d{2})(\d{3})(\d{3})([\da-zA-Z])/, "$1.$2.$3-$4");
  } else if (v.length > 5) {
    v = v.replace(/^(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3");
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{1,3})/, "$1.$2");
  }
  return v;
}

const maskPhone = (value: string) => {
  if (!value) return ""
  const v = value.replace(/\D/g, "");
  if (v.length <= 10) {
    return v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  } else {
    return v.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  }
}

const maskMatricula = (value: string) => {
  let v = value.replace(/\D/g, "");
  if (v.length > 6) {
    v = v.replace(/^(\d{6})(\d+)/, "$1-$2");
  }
  return v.slice(0, 9);
}

const maskCnh = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 11);
}

const maskCep = (value: string) => {
  let v = value.replace(/\D/g, "");
  if (v.length > 5) {
    v = v.replace(/^(\d{5})(\d)/, "$1-$2");
  }
  return v.slice(0, 9);
}

const SELECT_LABELS: Record<string, string> = {
  MASCULINO: "Masculino", FEMININO: "Feminino",
  SOLTEIRO: "Solteiro(a)", CASADO: "Casado(a)", DIVORCIADO: "Divorciado(a)", VIUVO: "Viúvo(a)",
  A_POSITIVO: "A+", A_NEGATIVO: "A-", B_POSITIVO: "B+", B_NEGATIVO: "B-", AB_POSITIVO: "AB+", AB_NEGATIVO: "AB-", O_POSITIVO: "O+", O_NEGATIVO: "O-",
  SOLDADO: "Soldado", CABO: "Cabo", SARGENTO: "Sargento", SUBTENENTE: "Subtenente", TENENTE: "Tenente", CAPITAO: "Capitão", MAJOR: "Major", TENENTE_CORONEL: "Tenente Coronel", CORONEL: "Coronel",
  FUNDAMENTAL: "Ensino Fundamental", MEDIO: "Ensino Médio", SUPERIOR: "Ensino Superior", POS_GRADUACAO: "Pós Graduação", MESTRADO: "Mestrado", DOUTORADO: "Doutorado",
  A: "A", B: "B", C: "C", D: "D", E: "E", AB: "AB", AC: "AC", AD: "AD", AE: "AE",
  none: "Selecione"
};

interface PolicialFormProps {
  subunidades?: { id: number; nome: string }[];
  funcoes?: { id: number; nome: string }[];
  initialData?: any;
  onSuccess?: () => void;
}

export function PolicialForm({ subunidades = [], funcoes = [], initialData, onSuccess }: PolicialFormProps) {
  const [activeTab, setActiveTab] = useState("aba-1")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiMessage, setApiMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const form = useForm<z.input<typeof policialFormSchema>, any, z.infer<typeof policialFormSchema>>({
    resolver: zodResolver(policialFormSchema),
    defaultValues: {
      nomeCompleto: initialData?.nomeCompleto || "",
      nomeGuerra: initialData?.nomeGuerra || "",
      cpf: initialData?.cpf || "",
      rg: initialData?.rg || "",
      matricula: initialData?.matricula || "",
      cnhCategoria: initialData?.cnhCategoria || "none",
      cnhNumero: initialData?.cnhNumero || "",
      dataAdmissao: initialData?.dataAdmissao ? new Date(initialData.dataAdmissao).toISOString().split('T')[0] : "",
      possuiPlanoSaude: initialData?.possuiPlanoSaude || false,
      dataNascimento: initialData?.dataNascimento ? new Date(initialData.dataNascimento).toISOString().split('T')[0] : "",
      religiosidade: initialData?.religiosidade || "",
      sexo: initialData?.sexo || "none",
      estadoCivil: initialData?.estadoCivil || "none",
      tipoSanguineo: initialData?.tipoSanguineo || "none",
      grauHierarquico: initialData?.grauHierarquico || "none",
      escolaridade: initialData?.escolaridade || "none",
      telefonePrimario: initialData?.telefonePrimario || "",
      telefoneSecundario: initialData?.telefoneSecundario || "",
      email: initialData?.email || "",
      observacoes: initialData?.observacoes || "",
      imagemUrl: initialData?.imagemUrl || "",
      subunidadeId: initialData?.subunidadeId?.toString() || "none",
      funcaoAtualId: initialData?.funcaoAtualId?.toString() || "none",
      logradouro: initialData?.endereco?.logradouro || "",
      numero: initialData?.endereco?.numero || "",
      bairro: initialData?.endereco?.bairro || "",
      cidade: initialData?.endereco?.cidade || "",
      estado: initialData?.endereco?.estado || "",
      cep: initialData?.endereco?.cep || "",
    },
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [userEditedNomeGuerra, setUserEditedNomeGuerra] = useState(false)

  const nomeCompleto = form.watch("nomeCompleto")
  const grauHierarquico = form.watch("grauHierarquico")
  const nomeGuerra = form.watch("nomeGuerra")

  useEffect(() => {
    if (!userEditedNomeGuerra && nomeCompleto) {
      const parts = nomeCompleto.trim().split(" ").filter(Boolean)
      if (parts.length > 0) {
        let suggestedName = parts[parts.length - 1].toUpperCase()
        const commonNames = ["SILVA", "SANTOS", "SOUZA", "OLIVEIRA", "LIMA", "COSTA"]
        
        if (commonNames.includes(suggestedName) && parts.length > 1) {
          suggestedName = `${parts[parts.length - 2].toUpperCase()} ${suggestedName}`
        }
        
        form.setValue("nomeGuerra", suggestedName)
      }
    } else if (!userEditedNomeGuerra && !nomeCompleto) {
      form.setValue("nomeGuerra", "")
    }
  }, [nomeCompleto, userEditedNomeGuerra, form])

  const cep = form.watch("cep")

  useEffect(() => {
    const fetchCep = async () => {
      if (cep) {
        const cleanCep = cep.replace(/\D/g, "")
        if (cleanCep.length === 8) {
          try {
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
            const data = await res.json()
            if (!data.erro) {
              form.setValue("logradouro", data.logradouro)
              form.setValue("bairro", data.bairro)
              form.setValue("cidade", data.localidade)
              form.setValue("estado", data.uf)
            }
          } catch (error) {
            console.error("Erro ao buscar CEP:", error)
          }
        }
      }
    }
    fetchCep()
  }, [cep, form])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setValue("imagemUrl", file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  async function onSubmit(data: PolicialFormData) {
    setIsSubmitting(true)
    setApiMessage(null)
    try {
      let finalImageUrl = data.imagemUrl;

      // Se for um arquivo de imagem novo, fazemos o upload
      if (data.imagemUrl instanceof File) {
        const formData = new FormData()
        formData.append("file", data.imagemUrl)
        
        const uploadResult = await uploadImage(formData)
        if (uploadResult.success) {
          finalImageUrl = uploadResult.url
        } else {
          setApiMessage({ type: 'error', text: "Erro ao fazer upload da imagem." })
          setIsSubmitting(false)
          return
        }
      }

      const payload = { ...data, imagemUrl: finalImageUrl }

      const response = initialData 
        ? await atualizarPolicial(initialData.id, payload)
        : await salvarDadosPolicial(payload)

      if (response.success) {
        setApiMessage({ type: 'success', text: response.message })
        if (!initialData) {
          form.reset()
          setPreviewUrl(null)
        }
        if (onSuccess) {
          setTimeout(onSuccess, 1500)
        }
      } else {
        setApiMessage({ type: 'error', text: response.message })
      }
    } catch (error) {
      setApiMessage({ type: 'error', text: "Erro inesperado ao conectar ao servidor." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getGrauSigla = (grau: string) => {
    const siglas: Record<string, string> = {
      SOLDADO: "SD", CABO: "CB", SARGENTO: "SGT", SUBTENENTE: "SUB TEN",
      TENENTE: "TEN", CAPITAO: "CAP", MAJOR: "MAJ", TENENTE_CORONEL: "TEN CEL", CORONEL: "CEL", none: ""
    };
    return siglas[grau] || "";
  }

  const sigla = getGrauSigla(grauHierarquico || "none");
  const previewCracha = `${sigla}${sigla ? " PM " : ""}${nomeGuerra || ""}`.trim();

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-2 border-slate-100">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{initialData ? 'Editar Policial' : 'Cadastro de Policial'}</h2>
          <p className="text-slate-500 text-sm">
            {initialData ? 'Atualize as informações do militar no sistema.' : 'Insira as informações do novo integrante na corporação.'}
          </p>
        </div>
        {previewCracha && (
          <div className="flex items-center px-6 py-2 bg-[#cca471] rounded-lg shadow-sm border border-[#97836a] shrink-0">
            <span className="font-bold text-white text-lg uppercase tracking-wider">{previewCracha}</span>
          </div>
        )}
      </div>

      {apiMessage && (
        <div className={`p-4 mb-6 rounded-lg ${apiMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {apiMessage.text}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="aba-1">1. Identificação</TabsTrigger>
              <TabsTrigger value="aba-2">2. Profissional</TabsTrigger>
              <TabsTrigger value="aba-3">3. Contato e Endereço</TabsTrigger>
              <TabsTrigger value="aba-4">4. Observações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="aba-1" className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-8 items-start mb-6">
                
                {/* Upload Foto */}
                <div className="flex flex-col items-center justify-center shrink-0 pt-2">
                  <div 
                    className="relative w-32 h-32 rounded-full border-4 border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer group hover:border-[#cca471] transition-all shadow-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-slate-400 group-hover:text-[#cca471] transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">Foto</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center w-32">Clique para adicionar foto</p>
                </div>

                {/* Identificação Funcional e Pessoal */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                  <FormField control={form.control} name="grauHierarquico" render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Grau Hierárquico</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'none'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione">
                              {field.value && field.value !== 'none' ? SELECT_LABELS[field.value] : "Selecione"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Selecione / Desmarcar</SelectItem>
                          <SelectItem value="SOLDADO">Soldado</SelectItem>
                          <SelectItem value="CABO">Cabo</SelectItem>
                          <SelectItem value="SARGENTO">Sargento</SelectItem>
                          <SelectItem value="SUBTENENTE">Subtenente</SelectItem>
                          <SelectItem value="TENENTE">Tenente</SelectItem>
                          <SelectItem value="CAPITAO">Capitão</SelectItem>
                          <SelectItem value="MAJOR">Major</SelectItem>
                          <SelectItem value="TENENTE_CORONEL">Tenente Coronel</SelectItem>
                          <SelectItem value="CORONEL">Coronel</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="matricula" render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Matrícula</FormLabel>
                      <FormControl><Input placeholder="Ex: 123456-7" {...field} onChange={(e) => field.onChange(maskMatricula(e.target.value))} maxLength={9} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="nomeCompleto" render={({ field }: { field: any }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl><Input placeholder="João da Silva" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="nomeGuerra" render={({ field }: { field: any }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nome de Guerra</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="SILVA" 
                          {...field} 
                          onChange={(e) => {
                            setUserEditedNomeGuerra(true)
                            field.onChange(e)
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <FormField control={form.control} name="cpf" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} onChange={(e) => field.onChange(maskCpf(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="rg" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl><Input placeholder="00.000.000-X" {...field} onChange={(e) => field.onChange(maskRg(e.target.value))} maxLength={14} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="dataNascimento" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="sexo" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione">
                            {field.value && field.value !== 'none' ? SELECT_LABELS[field.value] : "Selecione"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Selecione / Desmarcar</SelectItem>
                        <SelectItem value="MASCULINO">Masculino</SelectItem>
                        <SelectItem value="FEMININO">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="estadoCivil" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Estado Civil</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione">
                            {field.value && field.value !== 'none' ? SELECT_LABELS[field.value] : "Selecione"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Selecione / Desmarcar</SelectItem>
                        <SelectItem value="SOLTEIRO">Solteiro(a)</SelectItem>
                        <SelectItem value="CASADO">Casado(a)</SelectItem>
                        <SelectItem value="DIVORCIADO">Divorciado(a)</SelectItem>
                        <SelectItem value="VIUVO">Viúvo(a)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="tipoSanguineo" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Tipo Sanguíneo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione">
                            {field.value && field.value !== 'none' ? SELECT_LABELS[field.value] : "Selecione"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Selecione / Desmarcar</SelectItem>
                        <SelectItem value="A_POSITIVO">A+</SelectItem>
                        <SelectItem value="A_NEGATIVO">A-</SelectItem>
                        <SelectItem value="B_POSITIVO">B+</SelectItem>
                        <SelectItem value="B_NEGATIVO">B-</SelectItem>
                        <SelectItem value="AB_POSITIVO">AB+</SelectItem>
                        <SelectItem value="AB_NEGATIVO">AB-</SelectItem>
                        <SelectItem value="O_POSITIVO">O+</SelectItem>
                        <SelectItem value="O_NEGATIVO">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="escolaridade" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Escolaridade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione">
                            {field.value && field.value !== 'none' ? SELECT_LABELS[field.value] : "Selecione"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Selecione / Desmarcar</SelectItem>
                        <SelectItem value="FUNDAMENTAL">Ensino Fundamental</SelectItem>
                        <SelectItem value="MEDIO">Ensino Médio</SelectItem>
                        <SelectItem value="SUPERIOR">Ensino Superior</SelectItem>
                        <SelectItem value="POS_GRADUACAO">Pós Graduação</SelectItem>
                        <SelectItem value="MESTRADO">Mestrado</SelectItem>
                        <SelectItem value="DOUTORADO">Doutorado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="religiosidade" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Religiosidade</FormLabel>
                    <FormControl><Input placeholder="Ex: Católica, Evangélica, Nenhuma" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

              </div>
              <div className="flex justify-end pt-4">
                <Button type="button" onClick={async () => {
                  setApiMessage(null)
                  const isValid = await form.trigger(['nomeCompleto', 'cpf', 'rg', 'matricula', 'dataNascimento', 'sexo', 'estadoCivil', 'tipoSanguineo', 'escolaridade', 'grauHierarquico']);
                  if (isValid) {
                    setActiveTab("aba-2")
                  } else {
                    setApiMessage({ type: 'error', text: 'Verifique os campos obrigatórios na aba de Identificação antes de avançar.' })
                  }
                }} className="w-full sm:w-auto px-8 bg-[#97836a] hover:bg-[#7f6e59] text-white">
                  Avançar para Profissional
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="aba-2" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={form.control} name="subunidadeId" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Subunidade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione">
                            {field.value && field.value !== 'none' ? subunidades.find(s => s.id.toString() === field.value)?.nome || "Selecionado" : "Nenhuma Subunidade"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma Subunidade</SelectItem>
                        {subunidades.map(sub => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>{sub.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="funcaoAtualId" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Função Atual</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione">
                            {field.value && field.value !== 'none' ? funcoes.find(f => f.id.toString() === field.value)?.nome || "Selecionado" : "Nenhuma Função"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma Função</SelectItem>
                        {funcoes.map(func => (
                          <SelectItem key={func.id} value={func.id.toString()}>{func.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="dataAdmissao" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Data de Admissão</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="cnhCategoria" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Categoria CNH</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'none'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione">
                            {field.value && field.value !== 'none' ? SELECT_LABELS[field.value] : "Selecione"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Selecione / Desmarcar</SelectItem>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                        <SelectItem value="AB">AB</SelectItem>
                        <SelectItem value="AC">AC</SelectItem>
                        <SelectItem value="AD">AD</SelectItem>
                        <SelectItem value="AE">AE</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="cnhNumero" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Número CNH</FormLabel>
                    <FormControl><Input placeholder="Número" {...field} onChange={(e) => field.onChange(maskCnh(e.target.value))} maxLength={11} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="possuiPlanoSaude" render={({ field }: { field: any }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-slate-50">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-4 w-4 shrink-0" />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Possui Plano de Saúde?</FormLabel>
                    </div>
                  </FormItem>
                )} />
              </div>
              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("aba-1")}>
                  Voltar
                </Button>
                <Button type="button" onClick={async () => {
                  setApiMessage(null)
                  const isValid = await form.trigger(['dataAdmissao', 'cnhCategoria', 'cnhNumero']);
                  if (isValid) {
                    setActiveTab("aba-3")
                  } else {
                    setApiMessage({ type: 'error', text: 'Verifique os campos obrigatórios na aba Profissional.' })
                  }
                }} className="w-full sm:w-auto px-8 bg-[#97836a] hover:bg-[#7f6e59] text-white">
                  Avançar para Contato e Endereço
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="aba-3" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField control={form.control} name="email" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl><Input type="email" placeholder="email@exemplo.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="telefonePrimario" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Telefone Principal</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" maxLength={15} {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="telefoneSecundario" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Telefone Secundário</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" maxLength={15} {...field} onChange={(e) => field.onChange(maskPhone(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="col-span-full border-t border-slate-100 pt-6 mt-2 mb-2">
                  <h3 className="text-lg font-semibold text-slate-800">Endereço</h3>
                </div>

                <FormField control={form.control} name="cep" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl><Input placeholder="00000-000" {...field} onChange={(e) => field.onChange(maskCep(e.target.value))} maxLength={9} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="logradouro" render={({ field }: { field: any }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Logradouro</FormLabel>
                    <FormControl><Input placeholder="Rua, Avenida, etc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="numero" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl><Input placeholder="123, S/N" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="bairro" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl><Input placeholder="Bairro" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="cidade" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl><Input placeholder="Cidade" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="estado" render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl><Input placeholder="UF" maxLength={2} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("aba-2")}>
                  Voltar
                </Button>
                <Button type="button" onClick={async () => {
                  setApiMessage(null)
                  const isValid = await form.trigger(['email', 'telefonePrimario', 'telefoneSecundario', 'cep', 'logradouro', 'numero', 'bairro', 'cidade', 'estado']);
                  if (isValid) {
                    setActiveTab("aba-4")
                  } else {
                    setApiMessage({ type: 'error', text: 'Verifique os campos na aba de Contato e Endereço antes de avançar.' })
                  }
                }} className="w-full sm:w-auto px-8 bg-[#97836a] hover:bg-[#7f6e59] text-white">
                  Avançar para Observações
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="aba-4" className="space-y-4">
              <FormField control={form.control} name="observacoes" render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Observações e Histórico</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Adicione notas gerais ou histórico sobre o policial..." 
                      className="min-h-[250px] resize-y" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("aba-3")}>
                  Voltar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 bg-[#97836a] hover:bg-[#7f6e59] text-white">
                  {isSubmitting ? "Salvando..." : (initialData ? "Salvar Alterações" : "Finalizar Cadastro")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  )
}
