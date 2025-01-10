import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

// Load environment variables
config();

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database initialization...');

  try {
    // Check database connection
    console.log('Checking database connection...');
    await prisma.$connect();
    console.log('Database connection successful');

    // Run migrations
    console.log('\nRunning database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations completed successfully');

    // Generate Prisma Client
    console.log('\nGenerating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma Client generated successfully');

    // Seed the database
    console.log('\nSeeding the database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('Database seeded successfully');

    console.log('\nDatabase initialization completed successfully!');
    console.log(`
Database URL: ${process.env.DATABASE_URL}
Available Users:
- Admin: admin@example.com / Admin123!
- Inspector: inspector@example.com / Inspector123!
- User: user@example.com / User123!
    `);

  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Check if this script is being run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Initialization failed:', error);
      process.exit(1);
    });
}

export { main as initializeDatabase };
