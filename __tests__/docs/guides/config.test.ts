import { 
    GuideBuilder,
    GuideConfig,
    Section,
    CodeBlock,
    MarkdownRenderer
} from '../../../docs/guides/config';
import { jest, expect, describe, it } from '@jest/globals';

describe('Integration Guide Builder', () => {
    const mockSection: Section = {
        title: 'Getting Started',
        content: 'Guide to get started with moisture mapping.',
        subsections: [
            {
                title: 'Prerequisites',
                content: 'Required tools and dependencies.'
            },
            {
                title: 'Installation',
                content: 'Steps to install the system.'
            }
        ]
    };

    const mockExample: CodeBlock = {
        title: 'Basic Setup',
        language: 'typescript',
        code: `
import { MoistureMap } from '@/components';

export function setupMoistureMapping() {
    // Configuration
    const config = {
        apiKey: process.env.API_KEY,
        endpoint: 'https://api.example.com'
    };

    return new MoistureMap(config);
}
        `.trim(),
        description: 'Example showing basic setup'
    };

    const mockConfig: GuideConfig = {
        topic: 'Moisture Mapping Integration',
        description: 'Complete guide for integrating moisture mapping functionality.',
        sections: [mockSection],
        examples: [mockExample]
    };

    describe('GuideBuilder', () => {
        it('should build complete guide', () => {
            const builder = new GuideBuilder(mockConfig);
            const guide = builder.build();

            // Verify header
            expect(guide).toContain('# Moisture Mapping Integration');
            expect(guide).toContain('Complete guide for integrating');

            // Verify sections
            expect(guide).toContain('## Getting Started');
            expect(guide).toContain('### Prerequisites');
            expect(guide).toContain('### Installation');

            // Verify examples
            expect(guide).toContain('## Examples');
            expect(guide).toContain('### Basic Setup');
            expect(guide).toContain('```typescript');
            expect(guide).toContain('import { MoistureMap }');
        });

        it('should handle guide without examples', () => {
            const configWithoutExamples: GuideConfig = {
                ...mockConfig,
                examples: []
            };

            const builder = new GuideBuilder(configWithoutExamples);
            const guide = builder.build();

            expect(guide).not.toContain('## Examples');
            expect(guide).not.toContain('```typescript');
        });

        it('should handle guide without subsections', () => {
            const configWithoutSubsections: GuideConfig = {
                ...mockConfig,
                sections: [{
                    title: 'Simple Section',
                    content: 'Simple content'
                }]
            };

            const builder = new GuideBuilder(configWithoutSubsections);
            const guide = builder.build();

            expect(guide).toContain('## Simple Section');
            expect(guide).not.toContain('###');
        });
    });

    describe('MarkdownRenderer', () => {
        let renderer: MarkdownRenderer;

        beforeEach(() => {
            renderer = new MarkdownRenderer();
        });

        it('should render headings with different levels', () => {
            const content = renderer
                .addHeading('Level 1', 1)
                .addHeading('Level 2', 2)
                .addHeading('Level 3', 3)
                .getContent();

            expect(content).toContain('# Level 1');
            expect(content).toContain('## Level 2');
            expect(content).toContain('### Level 3');
        });

        it('should render paragraphs', () => {
            const content = renderer
                .addParagraph('First paragraph')
                .addParagraph('Second paragraph')
                .getContent();

            expect(content).toContain('First paragraph\n\n');
            expect(content).toContain('Second paragraph\n\n');
        });

        it('should render code blocks with language', () => {
            const content = renderer
                .addCode('const x = 1;', 'typescript')
                .getContent();

            expect(content).toContain('```typescript\n');
            expect(content).toContain('const x = 1;');
            expect(content).toContain('```\n');
        });

        it('should render unordered lists', () => {
            const content = renderer
                .addList(['Item 1', 'Item 2', 'Item 3'])
                .getContent();

            expect(content).toContain('- Item 1\n');
            expect(content).toContain('- Item 2\n');
            expect(content).toContain('- Item 3\n');
        });

        it('should render ordered lists', () => {
            const content = renderer
                .addList(['First', 'Second', 'Third'], true)
                .getContent();

            expect(content).toContain('1. First\n');
            expect(content).toContain('2. Second\n');
            expect(content).toContain('3. Third\n');
        });

        it('should support method chaining', () => {
            const content = renderer
                .addHeading('Title')
                .addParagraph('Content')
                .addCode('code')
                .addList(['item'])
                .getContent();

            expect(content).toContain('# Title');
            expect(content).toContain('Content');
            expect(content).toContain('code');
            expect(content).toContain('- item');
        });
    });
});
