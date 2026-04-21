import prisma from './lib/prisma';

async function main() {
  const policial = await prisma.policial.findFirst({
    orderBy: { id: 'desc' }
  });
  console.log('Latest Policial:', policial);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
