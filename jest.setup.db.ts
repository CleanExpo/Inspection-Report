// Database test setup
process.env.NODE_ENV = 'test';

// Add any database-specific setup here
beforeAll(() => {
  // Silence Prisma Client warning logs in tests
  const originalConsoleWarn = console.warn;
  jest.spyOn(console, 'warn').mockImplementation((msg) => {
    if (!msg.includes('Prisma')) {
      originalConsoleWarn(msg);
    }
  });
});
