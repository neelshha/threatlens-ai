import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const reports = await prisma.report.findMany();
  console.log('reports', reports);
}

main();