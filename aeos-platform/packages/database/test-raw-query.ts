import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const res =
    await prisma.$queryRaw`SELECT DATE(NOW()) as date, COUNT(*) as count FROM tasks LIMIT 1`;
  console.log(res);
  process.exit(0);
}
main();
