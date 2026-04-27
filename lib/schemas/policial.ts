import { z } from "zod";

const isValidCPF = (cpf: string) => {
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  const cpfDigits = cpf.split("").map((el) => +el);
  const rest = (count: number) =>
    (cpfDigits
      .slice(0, count - 12)
      .reduce((soma, el, index) => soma + el * (count - index), 0) *
      10) %
    11 %
    10;
  return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
};

export const dependenteSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome do dependente deve ter no mínimo 3 caracteres"),
  grauParentesco: z.enum(["FILHO", "FILHA", "CONJUGE", "PAI", "MAE", "ENTEADO", "OUTROS"]),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória").refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
});

export const policialFormSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  nomeGuerra: z.string().optional(),
  cpf: z
    .string()
    .min(1, "O CPF é obrigatório")
    .transform((val) => val.replace(/[^\d]/g, ""))
    .refine((val) => val.length === 11, "O CPF deve conter exatamente 11 dígitos"),
  rg: z.string().min(1, "RG é obrigatório"),
  matricula: z.string().min(1, "Matrícula é obrigatória").regex(/^[\d-]+$/, "Matrícula inválida. Use apenas números e traço"),
  cnhCategoria: z
    .enum(["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE", "none"])
    .optional()
    .transform((v) => (v === "none" ? undefined : v)),
  cnhNumero: z.string().optional(),
  dataAdmissao: z
    .string()
    .min(1, "Data de admissão é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), "Data de admissão inválida"),
  grauHierarquico: z
    .enum([
      "SOLDADO",
      "CABO",
      "SARGENTO",
      "SUBTENENTE",
      "TENENTE",
      "CAPITAO",
      "MAJOR",
      "TENENTE_CORONEL",
      "CORONEL",
      "none"
    ])
    .optional()
    .transform((v) => (v === "none" ? undefined : v)),
  possuiPlanoSaude: z.boolean().default(false),
  dataNascimento: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine((val) => !isNaN(Date.parse(val)), "Data de nascimento inválida"),
  sexo: z.enum(["MASCULINO", "FEMININO", "none"]).optional().transform(v => v === "none" ? undefined : v),
  tipoSanguineo: z
    .enum([
      "A_POSITIVO",
      "A_NEGATIVO",
      "B_POSITIVO",
      "B_NEGATIVO",
      "AB_POSITIVO",
      "AB_NEGATIVO",
      "O_POSITIVO",
      "O_NEGATIVO",
      "none"
    ])
    .optional()
    .transform((v) => (v === "none" ? undefined : v)),
  estadoCivil: z.enum(["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "none"]).optional().transform((v) => (v === "none" ? undefined : v)),
  escolaridade: z
    .enum([
      "FUNDAMENTAL",
      "MEDIO",
      "SUPERIOR",
      "POS_GRADUACAO",
      "MESTRADO",
      "DOUTORADO",
      "none"
    ])
    .optional()
    .transform((v) => (v === "none" ? undefined : v)),
  religiosidade: z.string().optional(),
  telefonePrimario: z
    .string()
    .min(1, "Telefone primário é obrigatório")
    .transform((val) => val.replace(/[^\d]/g, ""))
    .refine(
      (val) => val.length >= 10 && val.length <= 11,
      "Telefone deve conter 10 ou 11 dígitos"
    ),
  telefoneSecundario: z
    .string()
    .optional()
    .transform((val) => (val ? val.replace(/[^\d]/g, "") : undefined)),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  observacoes: z.string().optional(),
  imagemUrl: z.any().optional(),
  subunidadeId: z.string().optional().transform((v) => (v === "none" ? undefined : v)),
  funcaoAtualId: z.string().optional().transform((v) => (v === "none" ? undefined : v)),
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional().transform((val) => (val ? val.replace(/[^\d]/g, "") : undefined)),
  perfilAcesso: z.enum(["ADMINISTRADOR", "OPERADOR", "VISUALIZADOR", "none"]).optional().transform(v => v === "none" ? undefined : v),
  dependentes: z.array(dependenteSchema).optional().default([]),
});

export type PolicialFormData = z.infer<typeof policialFormSchema>;
