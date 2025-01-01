/**
 * Guide section
 */
export interface Section {
    title: string;
    content: string;
    subsections?: Section[];
}

/**
 * Code block
 */
export interface CodeBlock {
    title: string;
    language: string;
    code: string;
    description?: string;
}

/**
 * Guide configuration
 */
export interface GuideConfig {
    topic: string;
    description: string;
    sections: Section[];
    examples: CodeBlock[];
}

/**
 * Markdown renderer for guides
 */
export class MarkdownRenderer {
    private content: string[] = [];

    /**
     * Adds a heading
     */
    addHeading(text: string, level: number = 1): this {
        this.content.push(`${'#'.repeat(level)} ${text}\n`);
        return this;
    }

    /**
     * Adds a paragraph
     */
    addParagraph(text: string): this {
        this.content.push(`${text}\n\n`);
        return this;
    }

    /**
     * Adds a code block
     */
    addCode(code: string, language?: string): this {
        this.content.push(`\`\`\`${language || ''}\n${code}\n\`\`\`\n`);
        return this;
    }

    /**
     * Adds a list
     */
    addList(items: string[], ordered: boolean = false): this {
        items.forEach((item, index) => {
            const bullet = ordered ? `${index + 1}.` : '-';
            this.content.push(`${bullet} ${item}\n`);
        });
        this.content.push('\n');
        return this;
    }

    /**
     * Gets the rendered content
     */
    getContent(): string {
        return this.content.join('');
    }
}

/**
 * Guide builder
 */
export class GuideBuilder {
    private config: GuideConfig;
    private renderer: MarkdownRenderer;

    constructor(config: GuideConfig) {
        this.config = config;
        this.renderer = new MarkdownRenderer();
    }

    /**
     * Builds the guide
     */
    build(): string {
        this.addHeader();
        this.addSections(this.config.sections);
        this.addExamples();
        return this.renderer.getContent();
    }

    /**
     * Adds guide header
     */
    private addHeader(): void {
        this.renderer
            .addHeading(this.config.topic)
            .addParagraph(this.config.description);
    }

    /**
     * Adds guide sections
     */
    private addSections(sections: Section[], level: number = 2): void {
        sections.forEach(section => {
            this.renderer
                .addHeading(section.title, level)
                .addParagraph(section.content);

            if (section.subsections?.length) {
                this.addSections(section.subsections, level + 1);
            }
        });
    }

    /**
     * Adds guide examples
     */
    private addExamples(): void {
        if (this.config.examples.length > 0) {
            this.renderer.addHeading('Examples', 2);

            this.config.examples.forEach(example => {
                this.renderer
                    .addHeading(example.title, 3)
                    .addParagraph(example.description || '')
                    .addCode(example.code, example.language);
            });
        }
    }
}
