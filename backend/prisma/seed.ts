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
  console.log('Start seeding default categories...');

  // First, delete all existing categories
  await prisma.category.deleteMany();
  console.log('Cleared existing categories');

  // Then create new ones
  for (const category of defaultCategories) {
    await prisma.category.create({
      data: category,
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
