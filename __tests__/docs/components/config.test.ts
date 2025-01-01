import { 
    ComponentDocBuilder,
    ComponentDoc,
    PropDoc,
    Example,
    VisualGuide
} from '../../../docs/components/config';
import { jest, expect, describe, it } from '@jest/globals';

describe('Component Documentation Builder', () => {
    const mockProp: PropDoc = {
        name: 'value',
        type: 'number',
        required: true,
        description: 'Current moisture reading value',
        defaultValue: '0'
    };

    const mockExample: Example = {
        title: 'Basic Usage',
        description: 'Simple example of the component',
        code: `
import { MoistureReading } from './MoistureReading';

export default function Example() {
    return <MoistureReading value={45.5} />;
}
        `.trim(),
        preview: true
    };

    const mockVisualGuide: VisualGuide = {
        title: 'Component Layout',
        description: 'Visual guide showing component layout',
        imagePath: '/docs/images/moisture-reading-layout.png',
        altText: 'Moisture Reading Component Layout'
    };

    const mockComponent: ComponentDoc = {
        name: 'MoistureReading',
        description: 'Component for displaying moisture reading values',
        props: [mockProp],
        examples: [mockExample],
        visualGuides: [mockVisualGuide],
        notes: [
            'Values are displayed as percentages',
            'Color changes based on moisture level'
        ]
    };

    describe('addComponent', () => {
        it('should add component documentation', () => {
            const builder = new ComponentDocBuilder();
            builder.addComponent(mockComponent);

            const doc = builder.getComponent('MoistureReading');
            expect(doc).toEqual(mockComponent);
        });

        it('should allow chaining', () => {
            const builder = new ComponentDocBuilder();
            const result = builder.addComponent(mockComponent);

            expect(result).toBe(builder);
        });
    });

    describe('getComponent', () => {
        it('should return undefined for unknown component', () => {
            const builder = new ComponentDocBuilder();
            const doc = builder.getComponent('Unknown');

            expect(doc).toBeUndefined();
        });
    });

    describe('getAllComponents', () => {
        it('should return all components', () => {
            const builder = new ComponentDocBuilder();
            builder.addComponent(mockComponent);

            const components = builder.getAllComponents();
            expect(components).toHaveLength(1);
            expect(components[0]).toEqual(mockComponent);
        });

        it('should return empty array when no components', () => {
            const builder = new ComponentDocBuilder();
            const components = builder.getAllComponents();

            expect(components).toHaveLength(0);
        });
    });

    describe('generateMarkdown', () => {
        it('should generate complete documentation', () => {
            const builder = new ComponentDocBuilder();
            builder.addComponent(mockComponent);

            const markdown = builder.generateMarkdown();

            // Verify header
            expect(markdown).toContain('# Component Documentation');

            // Verify table of contents
            expect(markdown).toContain('## Table of Contents');
            expect(markdown).toContain('- [MoistureReading](#moisturereading)');

            // Verify component section
            expect(markdown).toContain('## MoistureReading');
            expect(markdown).toContain('Component for displaying moisture reading values');

            // Verify props table
            expect(markdown).toContain('### Props');
            expect(markdown).toContain('| Name | Type | Required | Description | Default |');
            expect(markdown).toContain('| value | number | Yes |');

            // Verify examples
            expect(markdown).toContain('### Examples');
            expect(markdown).toContain('#### Basic Usage');
            expect(markdown).toContain('```tsx');
            expect(markdown).toContain('import { MoistureReading }');

            // Verify visual guides
            expect(markdown).toContain('### Visual Guides');
            expect(markdown).toContain('#### Component Layout');
            expect(markdown).toContain('![Moisture Reading Component Layout]');

            // Verify notes
            expect(markdown).toContain('### Notes');
            expect(markdown).toContain('- Values are displayed as percentages');
            expect(markdown).toContain('- Color changes based on moisture level');
        });

        it('should handle component without props', () => {
            const componentWithoutProps: ComponentDoc = {
                ...mockComponent,
                props: []
            };

            const builder = new ComponentDocBuilder();
            builder.addComponent(componentWithoutProps);

            const markdown = builder.generateMarkdown();
            expect(markdown).not.toContain('### Props');
            expect(markdown).not.toContain('| Name | Type |');
        });

        it('should handle component without examples', () => {
            const componentWithoutExamples: ComponentDoc = {
                ...mockComponent,
                examples: []
            };

            const builder = new ComponentDocBuilder();
            builder.addComponent(componentWithoutExamples);

            const markdown = builder.generateMarkdown();
            expect(markdown).not.toContain('### Examples');
            expect(markdown).not.toContain('```tsx');
        });

        it('should handle component without visual guides', () => {
            const componentWithoutGuides: ComponentDoc = {
                ...mockComponent,
                visualGuides: undefined
            };

            const builder = new ComponentDocBuilder();
            builder.addComponent(componentWithoutGuides);

            const markdown = builder.generateMarkdown();
            expect(markdown).not.toContain('### Visual Guides');
            expect(markdown).not.toContain('![');
        });

        it('should handle component without notes', () => {
            const componentWithoutNotes: ComponentDoc = {
                ...mockComponent,
                notes: []
            };

            const builder = new ComponentDocBuilder();
            builder.addComponent(componentWithoutNotes);

            const markdown = builder.generateMarkdown();
            expect(markdown).not.toContain('### Notes');
            expect(markdown).not.toContain('- Values are displayed');
        });
    });
});
