import { prisma } from '../lib/prisma';
import { 
  saveJobDetails, 
  getJobDetails, 
  addPhotoToJob,
  addEquipmentUsage,
  addMoistureReading 
} from '../utils/db';

describe('Database Operations', () => {
  beforeEach(async () => {
    await prisma.moistureReading.deleteMany();
    await prisma.equipmentUsage.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.job.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create and retrieve a job with all relations', async () => {
    // Create a job
    const jobData = {
      jobNumber: 'TEST-001',
      clientName: 'Test Client',
      address: '123 Test St',
      description: 'Water damage in kitchen',
      status: 'In Progress',
      startDate: new Date(),
      completionDate: null,
      notes: null,
      photos: [
        {
          url: 'https://example.com/photo1.jpg',
          annotation: 'Kitchen floor',
          category: 'Water Damage'
        }
      ],
      equipmentUsed: [
        {
          name: 'Air Mover',
          quantity: 2,
          amps: 1.5
        }
      ],
      moistureReadings: [
        {
          location: 'Kitchen Floor',
          value: 15.5,
          timestamp: new Date()
        }
      ]
    };

    const savedJob = await saveJobDetails(jobData);
    expect(savedJob.jobNumber).toBe(jobData.jobNumber);
    expect(savedJob.photos).toHaveLength(1);
    expect(savedJob.equipmentUsed).toHaveLength(1);
    expect(savedJob.moistureReadings).toHaveLength(1);

    // Retrieve the job
    const retrievedJob = await getJobDetails(jobData.jobNumber);
    expect(retrievedJob).toBeTruthy();
    expect(retrievedJob?.clientName).toBe(jobData.clientName);
    expect(retrievedJob?.photos[0].annotation).toBe(jobData.photos[0].annotation);
    expect(retrievedJob?.equipmentUsed[0].quantity).toBe(jobData.equipmentUsed[0].quantity);
    expect(retrievedJob?.moistureReadings[0].value).toBe(jobData.moistureReadings[0].value);
  });

  it('should add individual relations to an existing job', async () => {
    // First create a basic job
    const jobData = {
      jobNumber: 'TEST-002',
      clientName: 'Test Client 2',
      address: '456 Test Ave',
      description: 'Fire damage assessment',
      status: 'Pending',
      startDate: new Date(),
      completionDate: null,
      notes: null
    };

    const savedJob = await saveJobDetails(jobData);

    // Add a photo
    const photo = await addPhotoToJob(savedJob.id, {
      url: 'https://example.com/photo2.jpg',
      annotation: 'Fire damage',
      category: 'Fire Damage'
    });
    expect(photo.url).toBe('https://example.com/photo2.jpg');

    // Add equipment usage
    const equipment = await addEquipmentUsage(savedJob.id, {
      name: 'Air Scrubber',
      quantity: 1,
      amps: 1.5
    });
    expect(equipment.name).toBe('Air Scrubber');

    // Add moisture reading
    const reading = await addMoistureReading(savedJob.id, {
      location: 'Wall',
      value: 12.5,
      timestamp: new Date()
    });
    expect(reading.value).toBe(12.5);

    // Verify all relations were added
    const updatedJob = await getJobDetails(jobData.jobNumber);
    expect(updatedJob?.photos).toHaveLength(1);
    expect(updatedJob?.equipmentUsed).toHaveLength(1);
    expect(updatedJob?.moistureReadings).toHaveLength(1);
  });
});
