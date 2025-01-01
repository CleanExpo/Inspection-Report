/**
 * Architecture component
 */
export interface ArchitectureComponent {
    name: string;
    description: string;
    responsibilities: string[];
    dependencies?: string[];
    technologies: string[];
}

/**
 * Architecture diagram
 */
export interface ArchitectureDiagram {
    title: string;
    description: string;
    imagePath: string;
    components: ArchitectureComponent[];
}

/**
 * Development guide section
 */
export interface GuideSection {
    title: string;
    content: string;
    codeExamples?: Array<{
        title: string;
        code: string;
        language: string;
        description?: string;
    }>;
}

/**
 * Best practice
 */
export interface BestPractice {
    category: string;
    practices: Array<{
        title: string;
        description: string;
        example?: {
            good: string;
            bad: string;
            language: string;
        };
    }>;
}

/**
 * Development documentation configuration
 */
export interface DevelopmentDocConfig {
    projectName: string;
    version: string;
    architecture: {
        overview: string;
        diagrams: ArchitectureDiagram[];
        components: ArchitectureComponent[];
    };
    guides: GuideSection[];
    bestPractices: BestPractice[];
}

/**
 * Development documentation generator
 */
export class DevelopmentDocGenerator {
    private config: DevelopmentDocConfig;

    constructor(config: DevelopmentDocConfig) {
        this.config = config;
    }

    /**
     * Generates markdown documentation
     */
    generate(): string {
        const sections: string[] = [];

        // Header
        sections.push(`# ${this.config.projectName} Development Documentation\n`);
        sections.push(`Version: ${this.config.version}\n\n`);

        // Table of Contents
        sections.push('## Table of Contents\n');
        sections.push('1. [Architecture](#architecture)\n');
        sections.push('2. [Development Guides](#development-guides)\n');
        sections.push('3. [Best Practices](#best-practices)\n\n');

        // Architecture
        sections.push('## Architecture\n\n');
        sections.push(`${this.config.architecture.overview}\n\n`);

        // Architecture Diagrams
        this.config.architecture.diagrams.forEach(diagram => {
            sections.push(`### ${diagram.title}\n\n`);
            sections.push(`${diagram.description}\n\n`);
            sections.push(`![${diagram.title}](${diagram.imagePath})\n\n`);
            
            sections.push('#### Components\n\n');
            diagram.components.forEach(component => {
                sections.push(`##### ${component.name}\n\n`);
                sections.push(`${component.description}\n\n`);
                sections.push('Responsibilities:\n');
                component.responsibilities.forEach(resp => {
                    sections.push(`- ${resp}\n`);
                });
                sections.push('\n');
            });
        });

        // Development Guides
        sections.push('## Development Guides\n\n');
        this.config.guides.forEach(guide => {
            sections.push(`### ${guide.title}\n\n`);
            sections.push(`${guide.content}\n\n`);

            if (guide.codeExamples?.length) {
                guide.codeExamples.forEach(example => {
                    sections.push(`#### ${example.title}\n\n`);
                    if (example.description) {
                        sections.push(`${example.description}\n\n`);
                    }
                    sections.push('```' + example.language + '\n');
                    sections.push(example.code + '\n');
                    sections.push('```\n\n');
                });
            }
        });

        // Best Practices
        sections.push('## Best Practices\n\n');
        this.config.bestPractices.forEach(category => {
            sections.push(`### ${category.category}\n\n`);
            category.practices.forEach(practice => {
                sections.push(`#### ${practice.title}\n\n`);
                sections.push(`${practice.description}\n\n`);

                if (practice.example) {
                    sections.push('##### Good Example\n\n');
                    sections.push('```' + practice.example.language + '\n');
                    sections.push(practice.example.good + '\n');
                    sections.push('```\n\n');

                    sections.push('##### Bad Example\n\n');
                    sections.push('```' + practice.example.language + '\n');
                    sections.push(practice.example.bad + '\n');
                    sections.push('```\n\n');
                }
            });
        });

        return sections.join('');
    }
}
