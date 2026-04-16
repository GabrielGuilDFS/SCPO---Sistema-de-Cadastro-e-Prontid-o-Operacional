import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })
dotenv.config({ path: '.env.local' })

const connectionString = (process.env.DATABASE_URL || '').replace('localhost', '127.0.0.1')
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
async function main() {
  console.log('Iniciando seed...')

  // 1. Popular subunidades: '1ª CIA', '2ª CIA', '3ª CIA', '4ª CIA' e 'Sede'
  const subunidades = ['1ª CIA', '2ª CIA', '3ª CIA', '4ª CIA', 'Sede']
  for (const nome of subunidades) {
    await prisma.subunidade.upsert({
      where: { nome },
      update: {},
      create: { nome },
    })
  }
  console.log('Subunidades inseridas/atualizadas com sucesso.')

  // 2. Popular funcao_atual: 'Comandante', 'Subcomandante', 'Motorista', 'Sentinela' e 'Permanente'
  const funcoes = ['Comandante', 'Subcomandante', 'Motorista', 'Sentinela', 'Permanente']
  for (const nome of funcoes) {
    await prisma.funcaoAtual.upsert({
      where: { nome },
      update: {},
      create: { nome },
    })
  }
  console.log('Funções inseridas/atualizadas com sucesso.')

  // Vamos inserir alguns policiais de exemplo pulando os que já existirem pela matrícula (unique)
  console.log('Criando policiais iniciais...')
  
  // Obter IDs
  const cia1 = await prisma.subunidade.findUnique({ where: { nome: '1ª CIA' } })
  const cia2 = await prisma.subunidade.findUnique({ where: { nome: '2ª CIA' } })
  const sede = await prisma.subunidade.findUnique({ where: { nome: 'Sede' } })
  
  const cmdte = await prisma.funcaoAtual.findUnique({ where: { nome: 'Comandante' } })
  const mtr = await prisma.funcaoAtual.findUnique({ where: { nome: 'Motorista' } })
  
  await prisma.policial.createMany({
    data: [
      { nomeCompleto: 'João Silva', nomeGuerra: 'Sgt. Silva', matricula: '102345-1', idade: 35, status: 'pronto', subunidadeId: cia1?.id, funcaoAtualId: mtr?.id },
      { nomeCompleto: 'Carlos Mendes', nomeGuerra: 'Cb. Mendes', matricula: '115678-2', idade: 28, status: 'afastado', subunidadeId: sede?.id, funcaoAtualId: cmdte?.id },
      { nomeCompleto: 'Pedro Oliveira', nomeGuerra: 'Sd. Oliveira', matricula: '123456-3', idade: 24, status: 'pronto', subunidadeId: cia2?.id, funcaoAtualId: mtr?.id },
      { nomeCompleto: 'Marcos Costa', nomeGuerra: 'Ten. Costa', matricula: '098765-4', idade: 42, status: 'pronto', subunidadeId: sede?.id, funcaoAtualId: cmdte?.id },
      { nomeCompleto: 'José Ramos', nomeGuerra: 'Sgt. Ramos', matricula: '104523-5', idade: 38, status: 'afastado', subunidadeId: cia1?.id, funcaoAtualId: mtr?.id },
      { nomeCompleto: 'Antonio Lima', nomeGuerra: 'Sd. Lima', matricula: '121212-6', idade: 26, status: 'pronto', subunidadeId: cia2?.id, funcaoAtualId: mtr?.id },
    ],
    skipDuplicates: true
  })
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
