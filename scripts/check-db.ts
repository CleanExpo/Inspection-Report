import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    // Test database connection
    process.stderr.write('Testing database connection...\n');
    await prisma.$connect();
    process.stderr.write('Database connected successfully\n');

    // Check moisture readings
    process.stderr.write('Checking moisture readings...\n');
    const readings = await prisma.moistureReading.findMany({
      where: {
        jobId: 'test-job-123'
      },
      include: {
        dataPoints: true
      }
    });

    process.stderr.write(`Found ${readings.length} readings\n`);
    if (readings.length > 0) {
      process.stderr.write(`Sample reading: ${JSON.stringify(readings[0], null, 2)}\n`);
    }

    // Check data points
    process.stderr.write('Checking data points...\n');
    const dataPoints = await prisma.moistureReading.findMany({
      where: {
        jobId: 'test-job-123'
      },
      include: {
        dataPoints: true
      },
      take: 5
    });

    process.stderr.write(`Found ${dataPoints.length} data points\n`);
    if (dataPoints.length > 0) {
      process.stderr.write(`Sample data points: ${JSON.stringify(dataPoints, null, 2)}\n`);
    }

  } catch (error) {
    process.stderr.write(`Error: ${error instanceof Error ? error.stack : error}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
