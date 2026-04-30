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

  // 1. Popular subunidades: Batalhão (Com Siglas)
  const subunidadesData = [
    { nome: 'Sede / Comando', sigla: 'CMDO' },
    { nome: '1ª Companhia', sigla: '1ª CIA' },
    { nome: 'CETO - Tático Operacional', sigla: 'CECCH' }
  ]

  for (const item of subunidadesData) {
    await prisma.subunidade.upsert({
      where: { nome: item.nome },
      update: { sigla: item.sigla },
      create: { nome: item.nome, sigla: item.sigla },
    })
  }
  console.log('Subunidades inseridas/atualizadas com sucesso.')

  // 2. Popular Postos de Serviço (Vinculados às Subunidades)
  const cmdo = await prisma.subunidade.findUnique({ where: { sigla: 'CMDO' } })
  const cia1 = await prisma.subunidade.findUnique({ where: { sigla: '1ª CIA' } })

  if (cmdo && cia1) {
    const postosData = [
      { nome: 'VTR 9.2011', subunidadeId: cia1.id },
      { nome: 'Sentinela do Quartel', subunidadeId: cmdo.id },
      { nome: 'Sala de Rádio', subunidadeId: cmdo.id }
    ]

    for (const item of postosData) {
      await prisma.postoDeServico.upsert({
        where: { nome: item.nome },
        update: { subunidadeId: item.subunidadeId },
        create: { nome: item.nome, subunidadeId: item.subunidadeId },
      })
    }
    console.log('Postos de serviço inseridos/atualizadas com sucesso.')
  }

  // 3. Popular Funções Atuais
  const funcoesData = [
    'Motorista',
    'Patrulheiro',
    'Armeiro',
    'Auxiliar de Telemática',
    'Comandante de Guarnição (Cmt Gu)'
  ]

  for (const funcao of funcoesData) {
    await prisma.funcaoAtual.upsert({
      where: { funcao },
      update: {},
      create: { funcao },
    })
  }
  console.log('Funções inseridas/atualizadas com sucesso.')

  console.log('Criando policiais iniciais...')

  // Buscar referências para os policiais iniciais
  const subCmdo = await prisma.subunidade.findUnique({ where: { sigla: 'CMDO' } })
  const funcCmt = await prisma.funcaoAtual.findUnique({ where: { funcao: 'Comandante de Guarnição (Cmt Gu)' } })
  const funcMtr = await prisma.funcaoAtual.findUnique({ where: { funcao: 'Motorista' } })

  const policiaData = [
    // Dados Originais Preservados
    { nomeCompleto: 'Admin', nomeGuerra: 'Admin', matricula: '000000-0', status: 'pronto', subunidadeId: subCmdo?.id, funcaoAtualId: funcCmt?.id, cpf: '00000000001', rg: '0000001', dataAdmissao: new Date('2020-01-01'), dataNascimento: new Date('1990-01-01'), telefonePrimario: '11900000001', grauHierarquico: 'CORONEL', sexo: 'MASCULINO', estadoCivil: 'CASADO', tipoSanguineo: 'O_POSITIVO', escolaridade: 'SUPERIOR' },
    { nomeCompleto: 'Guilherme', nomeGuerra: 'Guilherme', matricula: '111111-1', status: 'pronto', subunidadeId: subCmdo?.id, funcaoAtualId: funcCmt?.id, cpf: '00000000000', rg: '0000000', dataAdmissao: new Date('2020-01-01'), dataNascimento: new Date('1990-01-01'), telefonePrimario: '11900000000', grauHierarquico: 'CAPITAO', sexo: 'MASCULINO', estadoCivil: 'SOLTEIRO', tipoSanguineo: 'A_POSITIVO', escolaridade: 'SUPERIOR' },
    { nomeCompleto: 'João Silva', nomeGuerra: 'Silva', matricula: '102345-1', status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: funcMtr?.id, cpf: '11111111111', rg: '1234567', dataAdmissao: new Date('2010-01-01'), dataNascimento: new Date('1988-05-10'), telefonePrimario: '11999999999', grauHierarquico: 'SARGENTO', sexo: 'MASCULINO', estadoCivil: 'CASADO', tipoSanguineo: 'O_POSITIVO', escolaridade: 'MEDIO' },

    // +10 Novos Policiais
    { nomeCompleto: 'Maria Souza Oliveira', nomeGuerra: 'Maria Souza', matricula: '204567-2', status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: funcMtr?.id, cpf: '22222222222', rg: '2234567', dataAdmissao: new Date('2015-03-15'), dataNascimento: new Date('1992-08-20'), telefonePrimario: '11988888888', grauHierarquico: 'CABO', sexo: 'FEMININO', estadoCivil: 'SOLTEIRO', tipoSanguineo: 'B_POSITIVO', escolaridade: 'SUPERIOR' },
    { nomeCompleto: 'Carlos Alberto Ferreira', nomeGuerra: 'Ferreira', matricula: '305678-3', status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: funcMtr?.id, cpf: '33333333333', rg: '3234567', dataAdmissao: new Date('2012-06-10'), dataNascimento: new Date('1985-11-30'), telefonePrimario: '11977777777', grauHierarquico: 'SARGENTO', sexo: 'MASCULINO', estadoCivil: 'CASADO', tipoSanguineo: 'AB_POSITIVO', escolaridade: 'SUPERIOR' },
    { nomeCompleto: 'Ana Paula Costa', nomeGuerra: 'Ana Costa', matricula: '406789-4', status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: funcMtr?.id, cpf: '44444444444', rg: '4234567', dataAdmissao: new Date('2018-01-20'), dataNascimento: new Date('1995-04-12'), telefonePrimario: '11966666666', grauHierarquico: 'SOLDADO', sexo: 'FEMININO', estadoCivil: 'SOLTEIRO', tipoSanguineo: 'O_NEGATIVO', escolaridade: 'SUPERIOR' },
    { nomeCompleto: 'Roberto Santos Lima', nomeGuerra: 'Roberto', matricula: '507890-5', status: 'pronto', subunidadeId: subCmdo?.id, funcaoAtualId: funcMtr?.id, cpf: '55555555555', rg: '5234567', dataAdmissao: new Date('2008-09-05'), dataNascimento: new Date('1980-12-25'), telefonePrimario: '11955555555', grauHierarquico: 'TENENTE', sexo: 'MASCULINO', estadoCivil: 'CASADO', tipoSanguineo: 'A_NEGATIVO', escolaridade: 'POS_GRADUACAO' },
    { nomeCompleto: 'Juliana Mendes Rocha', nomeGuerra: 'Juliana', matricula: '608901-6', status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: funcMtr?.id, cpf: '66666666666', rg: '6234567', dataAdmissao: new Date('2016-11-12'), dataNascimento: new Date('1993-07-08'), telefonePrimario: '11944444444', grauHierarquico: 'CABO', sexo: 'FEMININO', estadoCivil: 'SOLTEIRO', tipoSanguineo: 'B_NEGATIVO', escolaridade: 'SUPERIOR' },
    { nomeCompleto: 'Fernando Henrique Silva', nomeGuerra: 'H. Silva', matricula: '709012-7', status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: funcMtr?.id, cpf: '77777777777', rg: '7234567', dataAdmissao: new Date('2019-05-22'), dataNascimento: new Date('1996-02-14'), telefonePrimario: '11933333333', grauHierarquico: 'SOLDADO', sexo: 'MASCULINO', estadoCivil: 'SOLTEIRO', tipoSanguineo: 'O_POSITIVO', escolaridade: 'MEDIO' },
    { nomeCompleto: 'Patricia Alves Pereira', nomeGuerra: 'Patricia', matricula: '801123-8', status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: funcMtr?.id, cpf: '88888888888', rg: '8234567', dataAdmissao: new Date('2011-02-28'), dataNascimento: new Date('1987-10-05'), telefonePrimario: '11922222222', grauHierarquico: 'SARGENTO', sexo: 'FEMININO', estadoCivil: 'CASADO', tipoSanguineo: 'A_POSITIVO', escolaridade: 'SUPERIOR' },
    { nomeCompleto: 'Ricardo Jose Pereira', nomeGuerra: 'Ricardo', matricula: '902234-9', status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: funcMtr?.id, cpf: '99999999999', rg: '9234567', dataAdmissao: new Date('2005-08-15'), dataNascimento: new Date('1982-01-19'), telefonePrimario: '11911111111', grauHierarquico: 'TENENTE', sexo: 'MASCULINO', estadoCivil: 'CASADO', tipoSanguineo: 'AB_NEGATIVO', escolaridade: 'SUPERIOR' },
    { nomeCompleto: 'Lucas Gabriel Mendes', nomeGuerra: 'Mendes', matricula: '103345-0', status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: funcMtr?.id, cpf: '10101010101', rg: '1034567', dataAdmissao: new Date('2021-01-10'), dataNascimento: new Date('1998-09-30'), telefonePrimario: '11900001111', grauHierarquico: 'SOLDADO', sexo: 'MASCULINO', estadoCivil: 'SOLTEIRO', tipoSanguineo: 'O_POSITIVO', escolaridade: 'MEDIO' },
    { nomeCompleto: 'Beatriz Gomes Lima', nomeGuerra: 'Beatriz', matricula: '114456-1', status: 'pronto', subunidadeId: subCmdo?.id, funcaoAtualId: funcMtr?.id, cpf: '12121212121', rg: '1134567', dataAdmissao: new Date('2014-04-01'), dataNascimento: new Date('1991-03-22'), telefonePrimario: '11911110000', grauHierarquico: 'CABO', sexo: 'FEMININO', estadoCivil: 'CASADO', tipoSanguineo: 'A_POSITIVO', escolaridade: 'SUPERIOR' }
  ]

  for (const p of policiaData) {
    await prisma.policial.upsert({
      where: { matricula: p.matricula },
      update: {
        subunidadeId: p.subunidadeId,
        funcaoAtualId: p.funcaoAtualId
      },
      create: p as any
    })
  }

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
        perfilAcesso: 'OPERADOR'
      }
    })
    console.log('Login do Guilherme criado com sucesso!')
  }

  // Sempre que e criado um novo policial, a senha padrao é "@PMBA2026""
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
