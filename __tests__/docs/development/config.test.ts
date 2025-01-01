import { 
    DevelopmentDocGenerator,
    DevelopmentDocConfig,
    ArchitectureComponent,
    ArchitectureDiagram,
    GuideSection,
    BestPractice
} from '../../../docs/development/config';
import { jest, expect, describe, it } from '@jest/globals';

describe('Development Documentation Generator', () => {
    const mockComponent: ArchitectureComponent = {
        name: 'Moisture Service',
        description: 'Core service for handling moisture readings',
        responsibilities: [
            'Process moisture sensor data',
            'Store readings in database',
            'Provide real-time updates'
        ],
        dependencies: ['Database', 'WebSocket Server'],
        technologies: ['Node.js', 'TypeScript', 'WebSocket']
    };

    const mockDiagram: ArchitectureDiagram = {
        title: 'System Architecture',
        description: 'High-level overview of the moisture mapping system',
        imagePath: '/docs/images/architecture.png',
        components: [mockComponent]
    };

    const mockGuide: GuideSection = {
        title: 'Setting Up Development Environment',
        content: 'Guide for setting up the development environment.',
        codeExamples: [
            {
                title: 'Installation',
                language: 'bash',
                code: 'npm install',
                description: 'Install dependencies'
            }
        ]
    };

    const mockBestPractice: BestPractice = {
        category: 'Code Style',
        practices: [
            {
                title: 'Use Meaningful Names',
                description: 'Choose descriptive and meaningful names for variables and functions.',
                example: {
                    good: 'const moistureReading = getMoistureLevel();',
                    bad: 'const x = getML();',
                    language: 'typescript'
                }
            }
        ]
    };

    const mockConfig: DevelopmentDocConfig = {
        projectName: 'Moisture Mapping System',
        version: '1.0.0',
        architecture: {
            overview: 'System architecture overview',
            diagrams: [mockDiagram],
            components: [mockComponent]
        },
        guides: [mockGuide],
        bestPractices: [mockBestPractice]
    };

    describe('generate', () => {
        it('should generate complete documentation', () => {
            const generator = new DevelopmentDocGenerator(mockConfig);
            const docs = generator.generate();

            // Verify header
            expect(docs).toContain('# Moisture Mapping System Development Documentation');
            expect(docs).toContain('Version: 1.0.0');

            // Verify table of contents
            expect(docs).toContain('## Table of Contents');
            expect(docs).toContain('[Architecture](#architecture)');
            expect(docs).toContain('[Development Guides](#development-guides)');
            expect(docs).toContain('[Best Practices](#best-practices)');

            // Verify architecture section
            expect(docs).toContain('## Architecture');
            expect(docs).toContain('System architecture overview');
            expect(docs).toContain('### System Architecture');
            expect(docs).toContain('![System Architecture](/docs/images/architecture.png)');
            expect(docs).toContain('##### Moisture Service');

            // Verify development guides
            expect(docs).toContain('## Development Guides');
            expect(docs).toContain('### Setting Up Development Environment');
            expect(docs).toContain('```bash');
            expect(docs).toContain('npm install');

            // Verify best practices
            expect(docs).toContain('## Best Practices');
            expect(docs).toContain('### Code Style');
            expect(docs).toContain('#### Use Meaningful Names');
            expect(docs).toContain('##### Good Example');
            expect(docs).toContain('##### Bad Example');
        });

        it('should handle missing code examples in guides', () => {
            const configWithoutExamples: DevelopmentDocConfig = {
                ...mockConfig,
                guides: [{
                    title: 'Simple Guide',
                    content: 'Guide content'
                }]
            };

            const generator = new DevelopmentDocGenerator(configWithoutExamples);
            const docs = generator.generate();

            expect(docs).toContain('### Simple Guide');
            expect(docs).toContain('Guide content');
            expect(docs).not.toContain('```');
        });

        it('should handle missing examples in best practices', () => {
            const configWithoutExamples: DevelopmentDocConfig = {
                ...mockConfig,
                bestPractices: [{
                    category: 'General',
                    practices: [{
                        title: 'Simple Practice',
                        description: 'Practice description'
                    }]
                }]
            };

            const generator = new DevelopmentDocGenerator(configWithoutExamples);
            const docs = generator.generate();

            expect(docs).toContain('### General');
            expect(docs).toContain('#### Simple Practice');
            expect(docs).toContain('Practice description');
            expect(docs).not.toContain('##### Good Example');
        });

        it('should handle missing diagrams', () => {
            const configWithoutDiagrams: DevelopmentDocConfig = {
                ...mockConfig,
                architecture: {
                    overview: 'Simple overview',
                    diagrams: [],
                    components: [mockComponent]
                }
            };

            const generator = new DevelopmentDocGenerator(configWithoutDiagrams);
            const docs = generator.generate();

            expect(docs).toContain('## Architecture');
            expect(docs).toContain('Simple overview');
            expect(docs).not.toContain('![');
        });
    });
});
