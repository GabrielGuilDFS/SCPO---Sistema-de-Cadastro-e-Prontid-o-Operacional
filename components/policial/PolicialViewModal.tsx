import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Define a interface para receber o objeto completo do Prisma (Policial + Relacionamentos)
interface PolicialViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  policial: any | null; // Usando any temporariamente para flexibilidade, idealmente seria Prisma.PolicialGetPayload<{ include: { endereco: true, subunidade: true, funcaoAtual: true } }>
}

// Componente auxiliar para padronizar a exibição dos campos
const DataItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
    <span className="text-sm font-medium text-slate-900 bg-slate-50 border border-slate-100 rounded-md px-3 py-2 min-h-[36px] flex items-center">
      {value || "-"}
    </span>
  </div>
);

const formatDate = (dateString?: string | Date | null) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export function PolicialViewModal({ isOpen, onClose, policial }: PolicialViewModalProps) {
  if (!policial) return null;

  const getGrauSigla = (grau: string) => {
    const siglas: Record<string, string> = {
      SOLDADO: "SD", CABO: "CB", SARGENTO: "SGT", SUBTENENTE: "SUB TEN",
      TENENTE: "TEN", CAPITAO: "CAP", MAJOR: "MAJ", TENENTE_CORONEL: "TEN CEL", CORONEL: "CEL", none: ""
    };
    return siglas[grau] || grau;
  };

  const sigla = getGrauSigla(policial.grauHierarquico || "none");
  const cracha = `${sigla}${sigla && policial.nomeGuerra ? " PM " : ""}${policial.nomeGuerra || ""}`.trim();
  const iniciais = policial.nomeCompleto?.substring(0, 2).toUpperCase() || "PM";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-0 gap-0">

        {/* Header Fixo com Avatar e Resumo */}
        <DialogHeader className="p-6 bg-[#3c342a] text-white border-b border-[#2d271f] sticky top-0 z-10">
          <div className="flex items-center gap-5">
            <Avatar className="h-16 w-16 border-2 border-[#cca471] shadow-md">
              <AvatarImage src={policial.imagemUrl || ""} alt={policial.nomeCompleto} className="object-cover" />
              <AvatarFallback className="bg-slate-200 text-slate-800 text-xl font-bold">{iniciais}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                {cracha || policial.nomeCompleto}
                {policial.status === 'afastado' && (
                  <Badge variant="destructive" className="text-[10px] h-5 uppercase tracking-wider">Afastado</Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-3 text-slate-300 mt-1.5 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#cca471]"></span>
                  Matrícula: <strong className="text-white font-medium">{policial.matricula}</strong>
                </span>
                {policial.subunidade?.nome && (
                  <>
                    <span className="text-slate-500">•</span>
                    <span>{policial.subunidade.nome}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Corpo do Modal (Abas) */}
        <div className="p-6">
          <Tabs defaultValue="aba-1" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 bg-slate-100/80 p-1">
              <TabsTrigger value="aba-1" className="data-[state=active]:bg-white data-[state=active]:text-[#cca471] data-[state=active]:shadow-sm">1. Identificação</TabsTrigger>
              <TabsTrigger value="aba-2" className="data-[state=active]:bg-white data-[state=active]:text-[#cca471] data-[state=active]:shadow-sm">2. Profissional</TabsTrigger>
              <TabsTrigger value="aba-3" className="data-[state=active]:bg-white data-[state=active]:text-[#cca471] data-[state=active]:shadow-sm">3. Contato</TabsTrigger>
              <TabsTrigger value="aba-4" className="data-[state=active]:bg-white data-[state=active]:text-[#cca471] data-[state=active]:shadow-sm">4. Observações</TabsTrigger>
            </TabsList>

            <TabsContent value="aba-1" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-semibold text-slate-800">Dados Pessoais</h3>
                {policial.possuiPlanoSaude && (
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200 shadow-none font-medium">
                    Possui Plano de Saúde
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                <div className="md:col-span-2">
                  <DataItem label="Nome Completo" value={policial.nomeCompleto} />
                </div>
                <DataItem label="Nome de Guerra" value={policial.nomeGuerra} />
                <DataItem label="CPF" value={policial.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")} />
                <DataItem label="RG" value={policial.rg} />
                <DataItem label="Data de Nascimento" value={formatDate(policial.dataNascimento)} />
                <DataItem label="Sexo" value={policial.sexo} />
                <DataItem label="Tipo Sanguíneo" value={policial.tipoSanguineo?.replace("_POSITIVO", "+").replace("_NEGATIVO", "-")} />
                <DataItem label="Estado Civil" value={policial.estadoCivil} />
                <DataItem label="Escolaridade" value={policial.escolaridade?.replace("_", " ")} />
                <DataItem label="Religiosidade" value={policial.religiosidade} />
              </div>
            </TabsContent>

            <TabsContent value="aba-2" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-semibold text-slate-800">Lotação e Dados Funcionais</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <DataItem label="Subunidade (Lotação)" value={policial.subunidade?.nome || "Sem Sede / Não Informada"} />
                <DataItem label="Função Atual" value={policial.funcaoAtual?.nome || "Não Informada"} />
                <DataItem label="Data de Admissão (Inclusão)" value={formatDate(policial.dataAdmissao)} />
              </div>

              <div className="mt-8 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-semibold text-slate-800">Habilitação</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <DataItem label="CNH Categoria" value={policial.cnhCategoria} />
                <DataItem label="Número da CNH" value={policial.cnhNumero} />
              </div>
            </TabsContent>

            <TabsContent value="aba-3" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-semibold text-slate-800">Contatos</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                <DataItem label="E-mail" value={policial.email} />
                <DataItem label="Telefone Primário" value={policial.telefonePrimario} />
                <DataItem label="Telefone Secundário" value={policial.telefoneSecundario} />
              </div>

              <div className="mt-8 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-semibold text-slate-800">Endereço</h3>
              </div>
              {policial.endereco ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
                  <div className="md:col-span-2">
                    <DataItem label="Logradouro" value={policial.endereco.logradouro} />
                  </div>
                  <DataItem label="Número" value={policial.endereco.numero} />
                  <DataItem label="Bairro" value={policial.endereco.bairro} />
                  <DataItem label="Cidade" value={policial.endereco.cidade} />
                  <div className="grid grid-cols-2 gap-4">
                    <DataItem label="Estado" value={policial.endereco.estado} />
                    <DataItem label="CEP" value={policial.endereco.cep?.replace(/(\d{5})(\d{3})/, "$1-$2")} />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
                  <p className="text-slate-500 text-sm">Nenhum endereço registrado.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="aba-4" className="space-y-6 animate-in fade-in-50 duration-300">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-semibold text-slate-800">Observações e Histórico</h3>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg p-5 min-h-[200px]">
                {policial.observacoes ? (
                  <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{policial.observacoes}</p>
                ) : (
                  <p className="text-slate-400 text-sm italic text-center mt-10">Nenhuma observação registrada para este policial.</p>
                )}
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
