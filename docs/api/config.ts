/**
 * API endpoint documentation
 */
export interface EndpointDoc {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description: string;
    authentication?: boolean;
    parameters?: ParameterDoc[];
    requestBody?: RequestBodyDoc;
    responses: ResponseDoc[];
    examples: EndpointExample[];
}

/**
 * Parameter documentation
 */
export interface ParameterDoc {
    name: string;
    type: string;
    required: boolean;
    description: string;
    location: 'path' | 'query' | 'header';
}

/**
 * Request body documentation
 */
export interface RequestBodyDoc {
    type: string;
    required: boolean;
    description: string;
    schema: object;
}

/**
 * Response documentation
 */
export interface ResponseDoc {
    status: number;
    description: string;
    schema: object;
}

/**
 * Code example
 */
export interface CodeExample {
    title: string;
    language: string;
    code: string;
    description?: string;
}

/**
 * Endpoint example
 */
export interface EndpointExample {
    title: string;
    request: {
        headers?: Record<string, string>;
        params?: Record<string, string>;
        body?: any;
    };
    response: {
        status: number;
        headers?: Record<string, string>;
        body: any;
    };
}

/**
 * API documentation configuration
 */
export interface APIDocConfig {
    version: string;
    title: string;
    description: string;
    baseUrl: string;
    authentication?: {
        type: 'bearer' | 'apiKey';
        description: string;
        examples: CodeExample[];
    };
    endpoints: EndpointDoc[];
    examples: CodeExample[];
}

/**
 * Markdown builder for documentation
 */
export class MarkdownBuilder {
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
     * Adds a table
     */
    addTable(headers: string[], rows: string[][]): this {
        // Add headers
        this.content.push(`| ${headers.join(' | ')} |\n`);
        
        // Add separator
        this.content.push(`| ${headers.map(() => '---').join(' | ')} |\n`);
        
        // Add rows
        rows.forEach(row => {
            this.content.push(`| ${row.join(' | ')} |\n`);
        });
        
        this.content.push('\n');
        return this;
    }

    /**
     * Builds the markdown content
     */
    build(): string {
        return this.content.join('');
    }
}

/**
 * API documentation generator
 */
export class APIDocGenerator {
    private config: APIDocConfig;
    private markdown: MarkdownBuilder;

    constructor(config: APIDocConfig) {
        this.config = config;
        this.markdown = new MarkdownBuilder();
    }

    /**
     * Generates API documentation
     */
    generate(): string {
        this.generateHeader();
        this.generateAuthentication();
        this.generateEndpoints();
        this.generateExamples();
        return this.markdown.build();
    }

    /**
     * Generates documentation header
     */
    private generateHeader(): void {
        this.markdown
            .addHeading(this.config.title)
            .addParagraph(this.config.description)
            .addHeading('Base URL', 2)
            .addParagraph(`\`${this.config.baseUrl}\``)
            .addHeading('Version', 2)
            .addParagraph(`API Version: ${this.config.version}`);
    }

    /**
     * Generates authentication documentation
     */
    private generateAuthentication(): void {
        if (this.config.authentication) {
            const auth = this.config.authentication;
            this.markdown
                .addHeading('Authentication', 2)
                .addParagraph(auth.description);

            auth.examples.forEach(example => {
                this.markdown
                    .addHeading(example.title, 3)
                    .addCode(example.code, example.language);
            });
        }
    }

    /**
     * Generates endpoint documentation
     */
    private generateEndpoints(): void {
        this.markdown.addHeading('Endpoints', 2);

        this.config.endpoints.forEach(endpoint => {
            this.markdown
                .addHeading(`${endpoint.method} ${endpoint.path}`, 3)
                .addParagraph(endpoint.description);

            if (endpoint.authentication) {
                this.markdown.addParagraph('**Requires Authentication**');
            }

            if (endpoint.parameters?.length) {
                this.markdown.addHeading('Parameters', 4);
                this.markdown.addTable(
                    ['Name', 'Type', 'Required', 'Description'],
                    endpoint.parameters.map(param => [
                        param.name,
                        param.type,
                        param.required ? 'Yes' : 'No',
                        param.description
                    ])
                );
            }

            if (endpoint.requestBody) {
                this.markdown
                    .addHeading('Request Body', 4)
                    .addParagraph(endpoint.requestBody.description)
                    .addCode(JSON.stringify(endpoint.requestBody.schema, null, 2), 'json');
            }

            this.markdown.addHeading('Responses', 4);
            endpoint.responses.forEach(response => {
                this.markdown
                    .addHeading(`${response.status} Response`, 5)
                    .addParagraph(response.description)
                    .addCode(JSON.stringify(response.schema, null, 2), 'json');
            });

            if (endpoint.examples?.length) {
                this.markdown.addHeading('Examples', 4);
                endpoint.examples.forEach(example => {
                    this.markdown
                        .addHeading(example.title, 5)
                        .addHeading('Request', 6);

                    if (example.request.headers) {
                        this.markdown.addCode(
                            JSON.stringify(example.request.headers, null, 2),
                            'json'
                        );
                    }

                    if (example.request.body) {
                        this.markdown.addCode(
                            JSON.stringify(example.request.body, null, 2),
                            'json'
                        );
                    }

                    this.markdown
                        .addHeading('Response', 6)
                        .addCode(
                            JSON.stringify(example.response.body, null, 2),
                            'json'
                        );
                });
            }
        });
    }

    /**
     * Generates general examples
     */
    private generateExamples(): void {
        if (this.config.examples?.length) {
            this.markdown.addHeading('Additional Examples', 2);
            this.config.examples.forEach(example => {
                this.markdown
                    .addHeading(example.title, 3)
                    .addParagraph(example.description || '')
                    .addCode(example.code, example.language);
            });
        }
    }
}
