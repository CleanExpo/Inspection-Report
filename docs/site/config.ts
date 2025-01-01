import fs from 'fs/promises';
import path from 'path';
import { marked } from 'marked';
import lunr from 'lunr';

/**
 * Documentation page type
 */
export type DocPageType = 'api' | 'component' | 'guide' | 'development';

/**
 * Documentation page
 */
export interface DocPage {
    title: string;
    content: string;
    path: string;
    type: DocPageType;
    tags?: string[];
}

/**
 * Search index document
 */
export interface SearchDoc {
    id: string;
    title: string;
    content: string;
    type: DocPageType;
    path: string;
    tags?: string[];
}

/**
 * Site navigation item
 */
export interface NavItem {
    title: string;
    path: string;
    children?: NavItem[];
    active?: boolean;
}

/**
 * Site configuration
 */
export interface SiteConfig {
    title: string;
    description: string;
    basePath: string;
    navigation: NavItem[];
    theme?: {
        primaryColor?: string;
        fontFamily?: string;
        codeTheme?: string;
    };
}

/**
 * Documentation site builder
 */
export class DocSiteBuilder {
    private config: SiteConfig;
    private pages: Map<string, DocPage>;
    private searchIndex: lunr.Index | null;
    private pagesArray: DocPage[];
    private templateCache: string | null;

    constructor(config: SiteConfig) {
        this.config = config;
        this.pages = new Map();
        this.searchIndex = null;
        this.pagesArray = [];
        this.templateCache = null;
    }

    /**
     * Adds a documentation page
     */
    async addPage(page: DocPage): Promise<void> {
        this.pages.set(page.path, page);
        this.pagesArray.push(page);
        await this.generateHtml(page);
    }

    /**
     * Builds the search index
     */
    buildSearchIndex(): void {
        const builder = new lunr.Builder();
        builder.ref('id');
        builder.field('title', { boost: 10 });
        builder.field('content');
        builder.field('tags', { boost: 5 });

        const docs: SearchDoc[] = this.pagesArray.map(page => ({
            id: page.path,
            title: page.title,
            content: page.content,
            type: page.type,
            path: page.path,
            tags: page.tags
        }));

        docs.forEach(doc => builder.add(doc));
        this.searchIndex = builder.build();
    }

    /**
     * Searches documentation
     */
    search(query: string): SearchDoc[] {
        if (!this.searchIndex) {
            throw new Error('Search index not built');
        }

        const results = this.searchIndex.search(query);
        return results
            .map(result => {
                const page = this.pages.get(result.ref);
                if (!page) return null;
                const searchDoc: SearchDoc = {
                    id: page.path,
                    title: page.title,
                    content: page.content,
                    type: page.type,
                    path: page.path,
                    tags: page.tags
                };
                return searchDoc;
            })
            .filter((doc): doc is SearchDoc => doc !== null);
    }

    /**
     * Gets navigation for a page
     */
    getNavigation(currentPath: string): NavItem[] {
        return this.config.navigation.map(item => ({
            ...item,
            children: item.children?.map(child => ({
                ...child,
                active: child.path === currentPath
            }))
        }));
    }

    /**
     * Generates HTML for a page
     */
    private async generateHtml(page: DocPage): Promise<void> {
        const html = await this.renderMarkdown(page.content);
        const navigation = this.getNavigation(page.path);
        const templateContent = await this.loadTemplate();

        const rendered = this.replaceTemplateVariables(templateContent, {
            title: page.title,
            content: html,
            navigation: this.renderNavigation(navigation)
        });

        const outputPath = path.join(this.config.basePath, `${page.path}.html`);
        await fs.writeFile(outputPath, rendered, 'utf-8');
    }

    /**
     * Renders markdown to HTML
     */
    private async renderMarkdown(content: string): Promise<string> {
        return new Promise((resolve) => {
            resolve(marked(content));
        });
    }

    /**
     * Loads and caches the HTML template
     */
    private async loadTemplate(): Promise<string> {
        if (!this.templateCache) {
            const templatePath = path.join(__dirname, 'template.html');
            this.templateCache = await fs.readFile(templatePath, 'utf-8');
        }
        return this.templateCache;
    }

    /**
     * Replace template variables
     */
    private replaceTemplateVariables(template: string, variables: Record<string, string>): string {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value);
        }
        return result;
    }

    /**
     * Renders navigation HTML
     */
    private renderNavigation(items: NavItem[]): string {
        return `
            <nav class="site-nav">
                <ul>
                    ${items.map(item => this.renderNavItem(item)).join('')}
                </ul>
            </nav>
        `;
    }

    /**
     * Renders a navigation item
     */
    private renderNavItem(item: NavItem): string {
        const hasChildren = item.children && item.children.length > 0;
        const activeClass = item.active ? 'active' : '';

        return `
            <li class="nav-item ${activeClass}">
                <a href="${item.path}">${item.title}</a>
                ${hasChildren ? `
                    <ul>
                        ${item.children!.map(child => this.renderNavItem(child)).join('')}
                    </ul>
                ` : ''}
            </li>
        `;
    }
}
