const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.dataPoint.deleteMany();
  await prisma.moistureReading.deleteMany();

  // Create test job with readings
  const jobId = 'test-job-123';
  const rooms = ['bedroom', 'bathroom', 'kitchen'];
  const floors = ['1', '2'];

  // Create readings over the last 48 hours
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  for (const room of rooms) {
    for (const floor of floors) {
      // Create 5 readings per room/floor
      for (let i = 0; i < 5; i++) {
        const reading = await prisma.moistureReading.create({
          data: {
            jobId,
            room,
            floor,
            locationX: Math.random() * 10,
            locationY: Math.random() * 10,
            equipmentId: 'meter-123',
            floorPlanId: 'plan-123',
            temperature: 20 + Math.random() * 5,
            humidity: 50 + Math.random() * 20,
            dataPoints: {
              create: Array(3).fill(null).map(() => ({
                value: 10 + Math.random() * 20,
                unit: 'WME',
                createdAt: new Date(
                  twoDaysAgo.getTime() + Math.random() * (now.getTime() - twoDaysAgo.getTime())
                )
              }))
            }
          }
        });
        console.log(`Created reading ${reading.id} for ${room} on floor ${floor}`);
      }
    }
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
