import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const members = await prisma.workspaceMember.findMany();
  console.log(members);
}
main().catch(console.error).finally(() => prisma.$disconnect());
