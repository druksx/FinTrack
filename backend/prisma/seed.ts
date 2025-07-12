import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Food & Dining', color: '#65CE55' }, // Our secondary color
  { name: 'Transportation', color: '#4CAF50' },
  { name: 'Housing', color: '#2E7D32' },
  { name: 'Utilities', color: '#1B5E20' }, // Darker variants
  { name: 'Shopping', color: '#388E3C' },
  { name: 'Entertainment', color: '#43A047' },
  { name: 'Healthcare', color: '#66BB6A' },
  { name: 'Education', color: '#81C784' }, // Lighter variants
  { name: 'Travel', color: '#A5D6A7' },
  { name: 'Other', color: '#C8E6C9' },
];

async function main() {
  console.log('Start seeding default categories...');

  for (const category of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name },
    });

    if (!existing) {
      await prisma.category.create({
        data: category,
      });
      console.log(`Created category: ${category.name}`);
    } else {
      console.log(`Category already exists: ${category.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
