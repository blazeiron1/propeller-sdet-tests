import { DataSource } from 'typeorm';
import { Product, ProductStatus } from './product/product.entity';
import { Image } from './image/image.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'propeller',
  password: process.env.DB_PASSWORD || 'propeller',
  database: process.env.DB_DATABASE || 'propeller',
  entities: [Product, Image],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected. Seeding...');

  const productRepo = AppDataSource.getRepository(Product);
  const imageRepo = AppDataSource.getRepository(Image);

  // Clear existing data
  await imageRepo.deleteAll();
  await productRepo.deleteAll();

  // Seed products for tenant-a
  const productsA = await productRepo.save([
    { name: 'Industrial Bolt Set', price: 29, status: ProductStatus.ACTIVE, tenantId: 'tenant-a' },
    { name: 'Steel Pipe 2m', price: 45, status: ProductStatus.ACTIVE, tenantId: 'tenant-a' },
    { name: 'Copper Wire 100m', price: 89, status: ProductStatus.ACTIVE, tenantId: 'tenant-a' },
    { name: 'Rubber Gasket Pack', price: 12, status: ProductStatus.INACTIVE, tenantId: 'tenant-a' },
    { name: 'Aluminum Sheet 1x2m', price: 67, status: ProductStatus.ACTIVE, tenantId: 'tenant-a' },
    { name: 'Brass Fitting Kit', price: 34, status: ProductStatus.ACTIVE, tenantId: 'tenant-a' },
    { name: 'PVC Valve 50mm', price: 18, status: ProductStatus.INACTIVE, tenantId: 'tenant-a' },
    { name: 'Stainless Clamp Set', price: 22, status: ProductStatus.ACTIVE, tenantId: 'tenant-a' },
    { name: 'Carbon Fiber Rod', price: 155, status: ProductStatus.ACTIVE, tenantId: 'tenant-a' },
    { name: 'Titanium Screw Pack', price: 78, status: ProductStatus.ACTIVE, tenantId: 'tenant-a' },
    { name: 'Nylon Washer Bag', price: 8, status: ProductStatus.ACTIVE, tenantId: 'tenant-a' },
    { name: 'Cast Iron Bracket', price: 41, status: ProductStatus.INACTIVE, tenantId: 'tenant-a' },
  ]);

  // Seed products for tenant-b
  const productsB = await productRepo.save([
    { name: 'Organic Coffee Beans 1kg', price: 24, status: ProductStatus.ACTIVE, tenantId: 'tenant-b' },
    { name: 'Green Tea Loose Leaf 500g', price: 18, status: ProductStatus.ACTIVE, tenantId: 'tenant-b' },
    { name: 'Dark Chocolate Bar', price: 6, status: ProductStatus.ACTIVE, tenantId: 'tenant-b' },
    { name: 'Expired Granola Mix', price: 9, status: ProductStatus.INACTIVE, tenantId: 'tenant-b' },
    { name: 'Almond Butter 350g', price: 11, status: ProductStatus.ACTIVE, tenantId: 'tenant-b' },
  ]);

  // Seed images for some products
  const sampleImages = [
    'https://images.unsplash.com/photo-1615789591457-74a63395c990?w=800',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800',
  ];

  // Add images to tenant-a products
  for (let i = 0; i < Math.min(5, productsA.length); i++) {
    await imageRepo.save({
      url: sampleImages[i % sampleImages.length],
      priority: (i + 1) * 100,
      productId: productsA[i].id,
      tenantId: 'tenant-a',
    });
  }

  // Add a second image to the first product
  await imageRepo.save({
    url: sampleImages[2],
    priority: 200,
    productId: productsA[0].id,
    tenantId: 'tenant-a',
  });

  // Add images to tenant-b products
  for (let i = 0; i < Math.min(3, productsB.length); i++) {
    await imageRepo.save({
      url: sampleImages[(i + 2) % sampleImages.length],
      priority: (i + 1) * 100,
      productId: productsB[i].id,
      tenantId: 'tenant-b',
    });
  }

  // Add an orphan image (no product) for tenant-a
  await imageRepo.save({
    url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
    priority: 50,
    tenantId: 'tenant-a',
  });

  const totalProducts = await productRepo.count();
  const totalImages = await imageRepo.count();
  console.log(`Seeded ${totalProducts} products and ${totalImages} images.`);

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
