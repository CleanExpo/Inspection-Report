/**
 * Component property documentation
 */
export interface PropDoc {
    name: string;
    type: string;
    required: boolean;
    description: string;
    defaultValue?: string;
}

/**
 * Component example
 */
export interface Example {
    title: string;
    description: string;
    code: string;
    preview?: boolean;
}

/**
 * Component visual guide
 */
export interface VisualGuide {
    title: string;
    description: string;
    imagePath: string;
    altText: string;
}

/**
 * Component documentation
 */
export interface ComponentDoc {
    name: string;
    description: string;
    props: PropDoc[];
    examples: Example[];
    visualGuides?: VisualGuide[];
    notes: string[];
}

/**
 * Component documentation builder
 */
export class ComponentDocBuilder {
    private docs: Map<string, ComponentDoc>;

    constructor() {
        this.docs = new Map();
    }

    /**
     * Adds a component documentation
     */
    addComponent(doc: ComponentDoc): this {
        this.docs.set(doc.name, doc);
        return this;
    }

    /**
     * Gets component documentation
     */
    getComponent(name: string): ComponentDoc | undefined {
        return this.docs.get(name);
    }

    /**
     * Gets all component documentation
     */
    getAllComponents(): ComponentDoc[] {
        return Array.from(this.docs.values());
    }

    /**
     * Generates markdown documentation
     */
    generateMarkdown(): string {
        const components = this.getAllComponents();
        const sections: string[] = [];

        // Add header
        sections.push('# Component Documentation\n');

        // Add table of contents
        sections.push('## Table of Contents\n');
        components.forEach(component => {
            sections.push(`- [${component.name}](#${component.name.toLowerCase()})\n`);
        });
        sections.push('\n');

        // Add component documentation
        components.forEach(component => {
            // Component header
            sections.push(`## ${component.name}\n`);
            sections.push(`${component.description}\n\n`);

            // Props table
            if (component.props.length > 0) {
                sections.push('### Props\n\n');
                sections.push('| Name | Type | Required | Description | Default |\n');
                sections.push('| ---- | ---- | -------- | ----------- | ------- |\n');
                component.props.forEach(prop => {
                    sections.push(
                        `| ${prop.name} | ${prop.type} | ${prop.required ? 'Yes' : 'No'} | ${
                            prop.description
                        } | ${prop.defaultValue || '-'} |\n`
                    );
                });
                sections.push('\n');
            }

            // Examples
            if (component.examples.length > 0) {
                sections.push('### Examples\n\n');
                component.examples.forEach(example => {
                    sections.push(`#### ${example.title}\n`);
                    sections.push(`${example.description}\n\n`);
                    sections.push('```tsx\n');
                    sections.push(example.code);
                    sections.push('\n```\n\n');
                });
            }

            // Visual guides
            if (component.visualGuides?.length) {
                sections.push('### Visual Guides\n\n');
                component.visualGuides.forEach(guide => {
                    sections.push(`#### ${guide.title}\n`);
                    sections.push(`${guide.description}\n\n`);
                    sections.push(`![${guide.altText}](${guide.imagePath})\n\n`);
                });
            }

            // Notes
            if (component.notes.length > 0) {
                sections.push('### Notes\n\n');
                component.notes.forEach(note => {
                    sections.push(`- ${note}\n`);
                });
                sections.push('\n');
            }
        });

        return sections.join('');
    }
}
