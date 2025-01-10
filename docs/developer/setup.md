# Development Setup Guide

## Prerequisites

### Required Software
- Node.js (v18 or later)
- PostgreSQL (v14 or later)
- Redis (v6 or later)
- Git
- Visual Studio Code (recommended)

### Recommended Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Jest Runner
- GitLens
- Prisma

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/inspection-report.git
cd inspection-report
```

### 2. Environment Setup
1. Copy environment template:
```bash
cp .env.example .env
```

2. Update environment variables:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/inspection_report"
REDIS_URL="redis://localhost:6379"

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRY="1h"
REFRESH_TOKEN_EXPIRY="7d"

# Storage
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_ACCESS_KEY="your-access-key"
R2_BUCKET_NAME="your-bucket-name"

# API Keys
OPENWEATHER_API_KEY="your-api-key"
GOOGLE_MAPS_API_KEY="your-api-key"

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
```

### 3. Install Dependencies
```bash
# Install project dependencies
npm install

# Install global tools
npm install -g prisma typescript ts-node
```

### 4. Database Setup
1. Start PostgreSQL service
2. Create database:
```bash
createdb inspection_report
```

3. Run migrations:
```bash
npx prisma migrate dev
```

4. Seed database (optional):
```bash
npm run seed
```

### 5. Redis Setup
1. Start Redis service
2. Verify connection:
```bash
redis-cli ping
```

## Running the Application

### Development Mode
1. Start development server:
```bash
npm run dev
```

2. Start API server:
```bash
npm run api:dev
```

3. Access application:
- Web: http://localhost:3000
- API: http://localhost:4000

### Production Build
```bash
# Build application
npm run build

# Start production server
npm start
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage
```

### Test Database
1. Create test database:
```bash
createdb inspection_report_test
```

2. Run test migrations:
```bash
NODE_ENV=test npx prisma migrate deploy
```

## Development Workflow

### 1. Branch Management
```bash
# Create feature branch
git checkout -b feature/your-feature

# Update from main
git pull origin main
git rebase main

# Push changes
git push origin feature/your-feature
```

### 2. Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

### 3. Pre-commit Hooks
The project uses husky for pre-commit hooks:
- Lint staged files
- Run tests
- Check types
- Format code

## Project Structure

```
inspection-report/
├── app/                    # Application source
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Shared utilities
│   ├── pages/            # Next.js pages
│   ├── services/         # Business logic
│   ├── styles/           # CSS styles
│   └── types/            # TypeScript types
├── docs/                  # Documentation
├── prisma/               # Database schema
├── public/               # Static assets
├── scripts/              # Utility scripts
└── tests/                # Test files
```

## Common Tasks

### Adding a New Feature
1. Create feature branch
2. Update database schema if needed
3. Generate Prisma client
4. Create/update components
5. Add tests
6. Update documentation
7. Create pull request

### Database Changes
1. Create migration:
```bash
npx prisma migrate dev --name your_migration_name
```

2. Apply to test database:
```bash
NODE_ENV=test npx prisma migrate deploy
```

3. Update schema documentation

### Adding Dependencies
```bash
# Add production dependency
npm install package-name

# Add development dependency
npm install -D package-name
```

## Troubleshooting

### Common Issues

#### Database Connection
1. Check PostgreSQL service
2. Verify connection string
3. Check database exists
4. Ensure permissions

#### Redis Connection
1. Check Redis service
2. Verify connection string
3. Clear Redis cache

#### Build Errors
1. Clear build cache:
```bash
npm run clean
```

2. Remove dependencies:
```bash
rm -rf node_modules
npm install
```

### Getting Help
1. Check documentation
2. Search issues
3. Ask team on Slack
4. Create issue

## Deployment

### Staging
```bash
npm run deploy:staging
```

### Production
```bash
npm run deploy:prod
```

## Additional Resources

### Documentation
- [API Documentation](../api/overview.md)
- [Architecture Overview](./architecture.md)
- [Testing Guide](./testing.md)
- [Contributing Guide](./contributing.md)

### External Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Jest Documentation](https://jestjs.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
