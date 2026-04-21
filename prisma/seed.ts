import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const connectionString = (process.env.DATABASE_URL || '').replace('localhost', '127.0.0.1')
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('Iniciando seed...')

  // 1. Popular subunidades: Batalhão
  const subunidades = [
    'Sede / Comando',
    '1ª CIA - Paulo Afonso',
    '2ª CIA - Glória',
    '3ª CIA - Jeremoabo',
    'CETO - Tático Operacional',
    'Ronda Maria da Penha'
  ]
  for (const nome of subunidades) {
    await prisma.subunidade.upsert({
      where: { nome },
      update: {},
      create: { nome },
    })
  }
  console.log('Subunidades inseridas/atualizadas com sucesso.')

  // 2. Popular funcao_atual: Operacional e Administrativo
  const funcoes = [
    'Comandante de Guarnição (Cmt Gu)',
    'Motorista',
    'Patrulheiro',
    'Auxiliar de Administração (P/1)',
    'Reserva de Armamento (P/4)',
    'Permanência / Guarda da Quartel'
  ]
  for (const nome of funcoes) {
    await prisma.funcaoAtual.upsert({
      where: { nome },
      update: {},
      create: { nome },
    })
  }
  console.log('Funções inseridas/atualizadas com sucesso.')

  console.log('Criando policiais iniciais...')

  const cia1 = await prisma.subunidade.findUnique({ where: { nome: '1ª CIA - Paulo Afonso' } })
  const cia2 = await prisma.subunidade.findUnique({ where: { nome: '2ª CIA - Glória' } })
  const sede = await prisma.subunidade.findUnique({ where: { nome: 'Sede / Comando' } })

  const cmdte = await prisma.funcaoAtual.findUnique({ where: { nome: 'Comandante de Guarnição (Cmt Gu)' } })
  const mtr = await prisma.funcaoAtual.findUnique({ where: { nome: 'Motorista' } })

  await prisma.policial.createMany({
    data: [
      { nomeCompleto: 'Admin', nomeGuerra: 'Admin', matricula: '000000-0', idade: 30, status: 'pronto', subunidadeId: sede?.id, funcaoAtualId: cmdte?.id, cpf: '00000000001', rg: '0000001', dataAdmissao: new Date('2020-01-01'), dataNascimento: new Date('1990-01-01'), telefonePrimario: '11900000001', grauHierarquico: 'CORONEL', sexo: 'MASCULINO', estadoCivil: 'CASADO', tipoSanguineo: 'O_POSITIVO', escolaridade: 'SUPERIOR' },
      { nomeCompleto: 'Guilherme', nomeGuerra: 'Guilherme', matricula: '111111-1', idade: 30, status: 'pronto', subunidadeId: sede?.id, funcaoAtualId: cmdte?.id, cpf: '00000000000', rg: '0000000', dataAdmissao: new Date('2020-01-01'), dataNascimento: new Date('1990-01-01'), telefonePrimario: '11900000000', grauHierarquico: 'CAPITAO', sexo: 'MASCULINO', estadoCivil: 'SOLTEIRO', tipoSanguineo: 'A_POSITIVO', escolaridade: 'SUPERIOR' },
      { nomeCompleto: 'João Silva', nomeGuerra: 'Silva', matricula: '102345-1', idade: 35, status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: mtr?.id, cpf: '11111111111', rg: '1234567', dataAdmissao: new Date('2010-01-01'), dataNascimento: new Date('1988-05-10'), telefonePrimario: '11999999999', grauHierarquico: 'SARGENTO', sexo: 'MASCULINO', estadoCivil: 'CASADO', tipoSanguineo: 'O_POSITIVO', escolaridade: 'MEDIO' },
      { nomeCompleto: 'Carlos Mendes', nomeGuerra: 'Mendes', matricula: '115678-2', idade: 28, status: 'afastado', subunidadeId: sede?.id, funcaoAtualId: cmdte?.id, cpf: '22222222222', rg: '2345678', dataAdmissao: new Date('2015-02-15'), dataNascimento: new Date('1995-08-20'), telefonePrimario: '11988888888', grauHierarquico: 'CABO', sexo: 'MASCULINO', estadoCivil: 'SOLTEIRO', tipoSanguineo: 'B_POSITIVO', escolaridade: 'MEDIO' },
      { nomeCompleto: 'Pedro Oliveira', nomeGuerra: 'Oliveira', matricula: '123456-3', idade: 24, status: 'pronto', subunidadeId: cia2?.id, funcaoAtualId: mtr?.id, cpf: '33333333333', rg: '3456789', dataAdmissao: new Date('2020-03-10'), dataNascimento: new Date('1999-11-05'), telefonePrimario: '11977777777', grauHierarquico: 'SOLDADO', sexo: 'MASCULINO', estadoCivil: 'SOLTEIRO', tipoSanguineo: 'A_NEGATIVO', escolaridade: 'MEDIO' },
      { nomeCompleto: 'Marcos Costa', nomeGuerra: 'Costa', matricula: '098765-4', idade: 42, status: 'pronto', subunidadeId: sede?.id, funcaoAtualId: cmdte?.id, cpf: '44444444444', rg: '4567890', dataAdmissao: new Date('2005-04-20'), dataNascimento: new Date('1981-12-15'), telefonePrimario: '11966666666', grauHierarquico: 'TENENTE', sexo: 'MASCULINO', estadoCivil: 'DIVORCIADO', tipoSanguineo: 'O_POSITIVO', escolaridade: 'SUPERIOR' },
      { nomeCompleto: 'José Ramos', nomeGuerra: 'Ramos', matricula: '104523-5', idade: 38, status: 'afastado', subunidadeId: cia1?.id, funcaoAtualId: mtr?.id, cpf: '55555555555', rg: '5678901', dataAdmissao: new Date('2008-05-25'), dataNascimento: new Date('1985-01-30'), telefonePrimario: '11955555555', grauHierarquico: 'SARGENTO', sexo: 'MASCULINO', estadoCivil: 'CASADO', tipoSanguineo: 'AB_POSITIVO', escolaridade: 'MEDIO' },
      { nomeCompleto: 'Antonio Lima', nomeGuerra: 'Lima', matricula: '121212-6', idade: 26, status: 'pronto', subunidadeId: cia2?.id, funcaoAtualId: mtr?.id, cpf: '66666666666', rg: '6789012', dataAdmissao: new Date('2018-06-30'), dataNascimento: new Date('1997-04-12'), telefonePrimario: '11944444444', grauHierarquico: 'SOLDADO', sexo: 'MASCULINO', estadoCivil: 'SOLTEIRO', tipoSanguineo: 'O_NEGATIVO', escolaridade: 'MEDIO' },
    ],
    skipDuplicates: true
  })

  // Criar login para o Guilherme
  const guilherme = await prisma.policial.findUnique({ where: { matricula: '111111-1' } })
  if (guilherme) {
    const hashedSenha = await bcrypt.hash('1234567', 10)
    await prisma.login.upsert({
      where: { policialId: guilherme.id },
      update: { senhaHash: hashedSenha },
      create: {
        policialId: guilherme.id,
        matricula: '111111-1',
        senhaHash: hashedSenha,
        perfilAcesso: 'ADMINISTRADOR'
      }
    })
    console.log('Login do Guilherme criado com sucesso!')
  }

  // Criar login para o Admin
  const admin = await prisma.policial.findUnique({ where: { matricula: '000000-0' } })
  if (admin) {
    const hashedSenha = await bcrypt.hash('admin123', 10)
    await prisma.login.upsert({
      where: { policialId: admin.id },
      update: { senhaHash: hashedSenha },
      create: {
        policialId: admin.id,
        matricula: '000000-0',
        senhaHash: hashedSenha,
        perfilAcesso: 'ADMINISTRADOR'
      }
    })
    console.log('Login do Admin criado com sucesso!')
  }

  console.log('Policiais criados com sucesso.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
