import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const defaultUser = await prisma.user.upsert({
    where: {
      id: '00000000-0000-0000-0000-000000000000',
    },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_password_for_testing',
    },
  });

  console.log('Created default user:', defaultUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 