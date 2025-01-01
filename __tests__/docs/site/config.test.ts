import { DocSiteBuilder, SiteConfig, DocPage } from '../../../docs/site/config';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';

// Mock fs and path modules
jest.mock('fs/promises', () => ({
    readFile: jest.fn(),
    writeFile: jest.fn()
}));

jest.mock('path', () => ({
    join: jest.fn((...args: unknown[]) => args.join('/'))
}));

// Mock marked
jest.mock('marked', () => ({
    marked: jest.fn((text: string) => `<p>${text}</p>`)
}));

describe('Documentation Site Builder', () => {
    let config: SiteConfig;
    let builder: DocSiteBuilder;
    let mockTemplate: string;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock template
        mockTemplate = `
            <!DOCTYPE html>
            <html>
                <head><title>{{title}}</title></head>
                <body>
                    {{navigation}}
                    <main>{{content}}</main>
                </body>
            </html>
        `;

        // Mock fs.readFile to return template
        (fs.readFile as jest.Mock).mockImplementation(() => Promise.resolve(mockTemplate));

        // Setup test configuration
        config = {
            title: 'Test Documentation',
            description: 'Test documentation site',
            basePath: '/docs',
            navigation: [
                {
                    title: 'Getting Started',
                    path: '/getting-started',
                    children: [
                        { title: 'Installation', path: '/installation' },
                        { title: 'Configuration', path: '/configuration' }
                    ]
                },
                {
                    title: 'API Reference',
                    path: '/api'
                }
            ]
        };

        builder = new DocSiteBuilder(config);
    });

    describe('Page Generation', () => {
        it('should generate HTML for a documentation page', async () => {
            const page: DocPage = {
                title: 'Installation Guide',
                content: '# Installation\n\nInstallation instructions here.',
                path: '/installation',
                type: 'guide'
            };

            await builder.addPage(page);

            expect(fs.writeFile).toHaveBeenCalledWith(
                '/docs/installation.html',
                expect.stringContaining('<title>Installation Guide</title>'),
                'utf-8'
            );

            expect(fs.writeFile).toHaveBeenCalledWith(
                '/docs/installation.html',
                expect.stringContaining('<p># Installation</p>'),
                'utf-8'
            );
        });

        it('should handle pages with custom tags', async () => {
            const page: DocPage = {
                title: 'API Reference',
                content: '# API Documentation\n\nAPI details here.',
                path: '/api',
                type: 'api',
                tags: ['api', 'reference']
            };

            await builder.addPage(page);

            expect(fs.writeFile).toHaveBeenCalledWith(
                '/docs/api.html',
                expect.stringContaining('<title>API Reference</title>'),
                'utf-8'
            );
        });
    });

    describe('Navigation Generation', () => {
        it('should generate navigation with active states', () => {
            const nav = builder.getNavigation('/installation');

            expect(nav[0].children?.[0].active).toBe(true);
            expect(nav[0].children?.[1].active).toBe(false);
        });

        it('should handle navigation without children', () => {
            const nav = builder.getNavigation('/api');

            expect(nav[1].active).toBe(undefined);
            expect(nav[1].children).toBe(undefined);
        });
    });

    describe('Search Functionality', () => {
        beforeEach(async () => {
            // Add test pages
            await builder.addPage({
                title: 'Installation Guide',
                content: '# Installation\n\nInstallation instructions here.',
                path: '/installation',
                type: 'guide'
            });

            await builder.addPage({
                title: 'API Reference',
                content: '# API Documentation\n\nAPI details here.',
                path: '/api',
                type: 'api',
                tags: ['api', 'reference']
            });

            // Build search index
            builder.buildSearchIndex();
        });

        it('should find pages by title', () => {
            const results = builder.search('installation');
            
            expect(results).toHaveLength(1);
            expect(results[0].title).toBe('Installation Guide');
        });

        it('should find pages by content', () => {
            const results = builder.search('api details');
            
            expect(results).toHaveLength(1);
            expect(results[0].title).toBe('API Reference');
        });

        it('should find pages by tags', () => {
            const results = builder.search('reference');
            
            expect(results).toHaveLength(1);
            expect(results[0].tags).toContain('reference');
        });

        it('should return empty array for no matches', () => {
            const results = builder.search('nonexistent');
            
            expect(results).toHaveLength(0);
        });

        it('should throw error if search index not built', () => {
            const newBuilder = new DocSiteBuilder(config);
            
            expect(() => newBuilder.search('test')).toThrow('Search index not built');
        });
    });

    describe('Template Handling', () => {
        it('should cache template after first load', async () => {
            const page: DocPage = {
                title: 'Test Page',
                content: 'Test content',
                path: '/test',
                type: 'guide'
            };

            await builder.addPage(page);
            await builder.addPage(page);

            expect(fs.readFile).toHaveBeenCalledTimes(1);
        });

        it('should handle template with custom variables', async () => {
            const customTemplate = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>{{title}}</title>
                        <meta name="description" content="{{description}}">
                    </head>
                    <body>
                        {{navigation}}
                        <main>{{content}}</main>
                    </body>
                </html>
            `;

            (fs.readFile as jest.Mock).mockImplementation(() => Promise.resolve(customTemplate));

            const page: DocPage = {
                title: 'Custom Page',
                content: 'Custom content',
                path: '/custom',
                type: 'guide'
            };

            await builder.addPage(page);

            expect(fs.writeFile).toHaveBeenCalledWith(
                '/docs/custom.html',
                expect.stringContaining('<title>Custom Page</title>'),
                'utf-8'
            );
        });
    });
});
