import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Role } from '../src/common/enums.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      fullName: 'Admin User',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user created:', admin.username);

  // Cashier user
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const cashier = await prisma.user.upsert({
    where: { username: 'cashier1' },
    update: {},
    create: {
      username: 'cashier1',
      password: cashierPassword,
      fullName: 'Cashier One',
      role: Role.CASHIER,
    },
  });
  console.log('✅ Cashier user created:', cashier.username);

  // Categories
  const categories = ['T-Shirts', 'Pants', 'Dresses', 'Jackets', 'Accessories'];
  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('✅ Categories seeded');

  // Supplier
  const supplier = await prisma.supplier.upsert({
    where: { id: 1 },
    update: {},
    create: { name: 'Default Supplier', phone: '012345678', email: 'supplier@example.com' },
  });
  console.log('✅ Supplier seeded');

  // Sample product
  const tshirtCategory = await prisma.category.findUnique({ where: { name: 'T-Shirts' } });
  if (tshirtCategory) {
    const product = await prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Classic T-Shirt',
        brand: 'BasicWear',
        season: '2024',
        price: 25.99,
        categoryId: tshirtCategory.id,
        supplierId: supplier.id,
        variants: {
          create: [
            { size: 'S', color: 'White', sku: 'TS-WH-S', quantity: 20, minimumStock: 5 },
            { size: 'M', color: 'White', sku: 'TS-WH-M', quantity: 30, minimumStock: 5 },
            { size: 'L', color: 'White', sku: 'TS-WH-L', quantity: 25, minimumStock: 5 },
            { size: 'S', color: 'Black', sku: 'TS-BK-S', quantity: 15, minimumStock: 5 },
            { size: 'M', color: 'Black', sku: 'TS-BK-M', quantity: 20, minimumStock: 5 },
          ],
        },
      },
    });
    console.log('✅ Sample product seeded:', product.name);
  }

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
