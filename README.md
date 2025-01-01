# MeasurementSystem Documentation

A comprehensive documentation suite for the MeasurementSystem components, including API references, development guides, and interactive examples.

## Documentation Structure

```
docs/
├── api/                      # API Reference Documentation
│   └── MeasurementSystem.md  # Component API documentation
├── development/             # Development Guides
│   ├── IntegrationGuide.md  # Integration instructions
│   ├── SetupGuide.md        # Development environment setup
│   ├── TroubleshootingGuide.md  # Common issues and solutions
│   ├── BestPractices.md     # Recommended patterns
│   ├── Architecture.md      # System architecture
│   ├── MigrationGuide.md    # Version migration
│   └── APIVersioning.md     # API versioning guidelines
├── examples/                # Usage Examples
│   └── UsageExamples.md     # Implementation patterns
└── playground/             # Interactive Examples
    └── index.tsx            # Component playground
```

## Getting Started

1. **Setup Development Environment**
   ```bash
   # Install dependencies
   npm install

   # Install development dependencies
   npm install --save-dev @types/glob
   ```

2. **Generate Documentation**
   ```bash
   # Generate API documentation
   npm run generate-docs

   # Generate changelog
   npm run generate-changelog <version>
   ```

3. **Run Component Playground**
   ```bash
   # Start development server
   npm run dev

   # Open playground
   open http://localhost:3000/docs/playground
   ```

## Documentation Tools

### API Documentation Generator

Automatically generates API documentation from TypeScript source files:

```bash
npm run generate-docs
```

Features:
- TypeScript parsing
- JSDoc extraction
- Props documentation
- Method documentation
- Example code blocks
- Markdown output
- Component relationships

### Changelog Generator

Generates changelogs from git commits using conventional commit format:

```bash
npm run generate-changelog 2.0.0
```

Features:
- Conventional commit parsing
- Breaking change detection
- Section categorization
- PR reference linking
- Emoji support
- Markdown formatting

## Component Playground

Interactive environment for testing and experimenting with components:

- Live component preview
- Interactive state management
- Export format testing
- Sample data generation
- Component composition
- State visualization

## Documentation Sections

### API Reference

Comprehensive API documentation for all components:
- Component props and types
- Export functionality
- Development environment setup
- Testing guidelines
- Performance considerations

### Development Guides

Best practices and guidelines for development:
- Component architecture
- Performance optimization
- Data management
- Error handling
- Testing strategies
- Code documentation
- Accessibility

### Architecture Documentation

System design and architecture overview:
- System overview
- Component relationships
- Data flow diagrams
- State management
- Directory structure
- Security considerations
- Performance optimization

### Usage Examples

Implementation examples and patterns:
- Basic implementations
- Advanced scenarios
- Error handling patterns
- Integration patterns
- State management
- Export handling

### Migration Guides

Version migration documentation:
- Version 2.0.0 breaking changes
- Version 1.5.0 updates
- Data structure migrations
- Component upgrades
- Migration scripts
- Troubleshooting steps

### API Versioning

API versioning guidelines:
- Semantic versioning strategy
- Version support policy
- Breaking change management
- Migration support
- Release process
- Support timeline

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Scripts

- `npm run generate-docs` - Generate API documentation
- `npm run generate-changelog` - Generate changelog
- `npm run dev` - Start development server
- `npm test` - Run test suite
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run format` - Format code

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
