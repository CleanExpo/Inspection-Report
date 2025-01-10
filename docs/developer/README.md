# Developer Documentation

## Project Overview
Inspection Report is a Next.js application for managing property inspection reports with features including moisture mapping, offline support, and data export.

## Getting Started

### Prerequisites
- Node.js 18+
- npm 8+
- Git

### Installation
```bash
# Clone repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Development
```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Project Structure
```
inspection-report/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── services/         # Business logic services
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── docs/                  # Documentation
├── public/               # Static assets
├── styles/               # Global styles
└── tests/                # Test files
```

## Architecture

### Frontend
- Next.js 13+ with App Router
- React 18 with Server Components
- TailwindCSS for styling
- TypeScript for type safety

### Backend
- Next.js API Routes
- JWT authentication
- Rate limiting
- Error handling middleware

### Testing
- Jest for unit and integration tests
- React Testing Library for component tests
- Cypress for E2E tests
- Performance testing suite

## Key Features

### Authentication
- JWT-based authentication
- Token refresh mechanism
- Role-based access control
- Secure session management

### Job Management
- CRUD operations for jobs
- Pagination and filtering
- Real-time updates
- Offline support

### Moisture Mapping
- Interactive mapping interface
- Historical data tracking
- Data visualization
- Export capabilities

### Error Handling
- Centralized error handling
- Custom error classes
- Consistent error responses
- Validation system

## Development Guidelines

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Follow TypeScript best practices
- Write meaningful comments

### Testing
- Write tests for new features
- Maintain test coverage above 80%
- Follow test naming conventions
- Mock external dependencies

### Git Workflow
1. Create feature branch from main
2. Make changes and add tests
3. Run tests and linting
4. Submit pull request
5. Address review comments
6. Merge after approval

### Commit Messages
Follow conventional commits:
```
feat: add new feature
fix: bug fix
docs: documentation changes
test: add or modify tests
refactor: code refactoring
style: formatting changes
chore: maintenance tasks
```

## Performance Considerations

### Optimization
- Use React.memo for expensive components
- Implement proper caching strategies
- Optimize images and assets
- Use code splitting

### Monitoring
- Track API response times
- Monitor memory usage
- Watch error rates
- Check cache hit rates

## Security

### Best Practices
- Validate all inputs
- Sanitize user data
- Use HTTPS
- Implement rate limiting
- Follow OWASP guidelines

### Authentication
- Secure password handling
- Token expiration
- CSRF protection
- XSS prevention

## Deployment

### Environment Variables
```env
# Required
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=

# Optional
NODE_ENV=development
API_RATE_LIMIT=100
```

### Build Process
```bash
# Production build
npm run build

# Start production server
npm start
```

### Deployment Checklist
1. Update environment variables
2. Run tests
3. Build application
4. Check bundle size
5. Deploy to staging
6. Run smoke tests
7. Deploy to production

## Troubleshooting

### Common Issues
1. Authentication errors
   - Check token expiration
   - Verify credentials
   - Check environment variables

2. API errors
   - Check rate limits
   - Verify request format
   - Check server logs

3. Build errors
   - Clear cache
   - Update dependencies
   - Check TypeScript errors

### Debug Tools
- Browser DevTools
- React DevTools
- Network inspector
- Jest debugger

## Contributing
1. Fork repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## Support
- GitHub Issues
- Documentation
- Team chat
