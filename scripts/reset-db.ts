import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import readline from 'readline';

// Load environment variables
config();

const prisma = new PrismaClient();

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n⚠️  WARNING: This will reset the entire database ⚠️');
  console.log('All data will be lost and the database will be reinitialized with seed data.');
  
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ Cannot reset database in production environment');
    process.exit(1);
  }

  const answer = await prompt('\nAre you sure you want to continue? (yes/no): ');
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('Database reset cancelled');
    process.exit(0);
  }

  try {
    console.log('\nStarting database reset...');

    // Drop the database schema
    console.log('Dropping database schema...');
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS public CASCADE;
                                  CREATE SCHEMA public;
                                  GRANT ALL ON SCHEMA public TO postgres;
                                  GRANT ALL ON SCHEMA public TO public;`);
    console.log('Database schema dropped successfully');

    // Run migrations
    console.log('\nRunning database migrations...');
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    console.log('Migrations completed successfully');

    // Generate Prisma Client
    console.log('\nRegenerating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Prisma Client regenerated successfully');

    // Seed the database
    console.log('\nSeeding the database...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('Database seeded successfully');

    console.log('\n✅ Database reset completed successfully!');
    console.log(`
Available Users:
- Admin: admin@example.com / Admin123!
- Inspector: inspector@example.com / Inspector123!
- User: user@example.com / User123!
    `);

  } catch (error) {
    console.error('Error during database reset:', error);
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
      console.error('Reset failed:', error);
      process.exit(1);
    });
}

export { main as resetDatabase };
