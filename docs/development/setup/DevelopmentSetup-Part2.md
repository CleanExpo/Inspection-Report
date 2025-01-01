# Development Setup Guide - Part 2: Project Setup & Configuration

## Repository Setup

### 1. Project Initialization

```bash
# Clone the repository
git clone https://github.com/your-org/inspection-report.git
cd inspection-report

# Install dependencies
npm install
```

### 2. Branch Strategy

```plaintext
Branch Structure:
main           # Production-ready code
├── develop    # Development integration branch
├── feature/*  # Feature branches
├── bugfix/*   # Bug fix branches
└── release/*  # Release preparation branches
```

## Project Structure

### 1. Directory Organization

```plaintext
inspection-report/
├── app/                    # Next.js app directory
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   └── styles/           # CSS/SCSS files
├── api/                   # API routes
│   ├── auth/             # Authentication endpoints
│   ├── moisture/         # Moisture data endpoints
│   └── upload/           # File upload endpoints
├── components/           # Shared components
├── config/               # Configuration files
├── contexts/            # React contexts
├── docs/                # Documentation
├── public/              # Static assets
├── styles/              # Global styles
├── types/               # TypeScript types
└── utils/               # Utility functions
```

### 2. Configuration Files

```plaintext
Root Configuration Files:
├── .env                  # Environment variables
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── jest.config.js       # Jest configuration
├── next.config.js       # Next.js configuration
├── package.json         # Project dependencies
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Dependencies Setup

### 1. Core Dependencies

```json
{
  "dependencies": {
    "next": "13.x",
    "react": "18.x",
    "react-dom": "18.x",
    "@prisma/client": "4.x",
    "tailwindcss": "3.x",
    "typescript": "5.x"
  }
}
```

### 2. Development Dependencies

```json
{
  "devDependencies": {
    "@types/node": "18.x",
    "@types/react": "18.x",
    "@typescript-eslint/eslint-plugin": "5.x",
    "eslint": "8.x",
    "jest": "29.x",
    "prettier": "2.x",
    "prisma": "4.x"
  }
}
```

## Build Configuration

### 1. Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-domain.com'],
  },
  async redirects() {
    return [
      // Add redirects here
    ];
  },
  async rewrites() {
    return [
      // Add rewrites here
    ];
  },
};

module.exports = nextConfig;
```

### 2. TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## Development Tools Setup

### 1. ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // Add custom rules here
  },
  settings: {
    next: {
      rootDir: ['apps/*/', 'packages/*/']
    }
  }
};
```

### 2. Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## Database Configuration

### 1. Prisma Setup

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// Add your models here
```

### 2. Database Initialization

```bash
# Initialize database
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

## Testing Setup

### 1. Jest Configuration

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

### 2. Test Setup File

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
```

## Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  }
}
```

## Local Development

### 1. Starting Development Server

```bash
# Start development server
npm run dev

# Start with specific port
npm run dev -- -p 3001
```

### 2. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Deployment Configuration

### 1. Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@production-db:5432/dbname
REDIS_URL=redis://production-redis:6379
API_URL=https://api.your-domain.com
```

### 2. Build Process

```bash
# Production build
npm run build

# Start production server
npm start
```

## Next Steps

1. Set up your development environment
2. Configure your IDE
3. Install project dependencies
4. Start the development server
5. Begin development workflow
