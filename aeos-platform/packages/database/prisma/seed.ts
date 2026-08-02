import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Setup Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'system' },
    update: {},
    create: {
      name: 'System Default',
      slug: 'system',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Tenant created:', tenant.slug);

  // 2. Setup Default Permissions (Dựa theo thiết kế)
  const defaultPermissions = [
    { resource: 'PROJECT', action: 'CREATE' },
    { resource: 'PROJECT', action: 'UPDATE' },
    { resource: 'PROJECT', action: 'DELETE' },
    { resource: 'TASK', action: 'CREATE' },
    { resource: 'TASK', action: 'UPDATE' },
    { resource: 'TASK', action: 'DELETE' },
    { resource: 'DOCUMENT', action: 'READ' },
    { resource: 'DOCUMENT', action: 'WRITE' },
    { resource: 'MEMBER', action: 'INVITE' },
    { resource: 'MEMBER', action: 'REMOVE' },
  ];

  for (const perm of defaultPermissions) {
    await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: {},
      create: perm,
    });
  }
  console.log(`✅ ${defaultPermissions.length} permissions verified.`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
