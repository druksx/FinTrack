import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Food & Dining', color: '#FF9F1C', icon: 'Utensils' }, // Warm orange for food
  { name: 'Transportation', color: '#4361EE', icon: 'Car' }, // Blue for movement/travel
  { name: 'Housing', color: '#2A9D8F', icon: 'Home' }, // Teal for home/shelter
  { name: 'Utilities', color: '#F72585', icon: 'Lightbulb' }, // Pink for energy/power
  { name: 'Shopping', color: '#7209B7', icon: 'ShoppingBag' }, // Purple for retail/shopping
  { name: 'Entertainment', color: '#FFD93D', icon: 'Popcorn' }, // Yellow for fun/leisure
  { name: 'Healthcare', color: '#06D6A0', icon: 'Heart' }, // Green for health/wellness
  { name: 'Education', color: '#4895EF', icon: 'GraduationCap' }, // Light blue for learning
  { name: 'Travel', color: '#F15BB5', icon: 'Plane' }, // Pink for adventure
  { name: 'Other', color: '#94A3B8', icon: 'CircleDot' }, // Neutral slate for misc
];

async function main() {
  console.log('Start seeding...');

  // Create default user
  console.log('Creating default user...');
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

  // First, delete all data in the right order (respecting foreign key constraints)
  await prisma.subscription.deleteMany();
  console.log('Cleared existing subscriptions');
  await prisma.expense.deleteMany();
  console.log('Cleared existing expenses');
  await prisma.category.deleteMany();
  console.log('Cleared existing categories');

  // Then create new ones for the default user
  for (const category of defaultCategories) {
    await prisma.category.create({
      data: {
        ...category,
        userId: defaultUser.id,
      },
    });
    console.log(`Created category: ${category.name}`);
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
