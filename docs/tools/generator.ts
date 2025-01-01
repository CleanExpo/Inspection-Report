import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Documentation format
 */
export type DocFormat = 'markdown' | 'html' | 'pdf';

/**
 * Documentation generator options
 */
export interface GeneratorOptions {
    format: DocFormat;
    title?: string;
    stylesheet?: string;
    template?: string;
    outputDir?: string;
}

/**
 * Documentation generator for converting between formats
 */
export class DocGenerator {
    private options: GeneratorOptions;

    constructor(options: GeneratorOptions) {
        this.options = {
            outputDir: 'dist',
            ...options
        };
    }

    /**
     * Generates documentation in specified format
     */
    async generate(content: string, outputPath: string): Promise<void> {
        const { format } = this.options;

        switch (format) {
            case 'html':
                await this.generateHtml(content, outputPath);
                break;
            case 'pdf':
                await this.generatePdf(content, outputPath);
                break;
            default:
                await this.generateMarkdown(content, outputPath);
        }
    }

    /**
     * Generates markdown documentation
     */
    private async generateMarkdown(content: string, outputPath: string): Promise<void> {
        const outputFile = this.getOutputPath(outputPath, 'md');
        await fs.writeFile(outputFile, content, 'utf-8');
    }

    /**
     * Generates HTML documentation
     */
    private async generateHtml(content: string, outputPath: string): Promise<void> {
        const html = await this.markdownToHtml(content);
        const styled = await this.applyHtmlStyle(html);
        const outputFile = this.getOutputPath(outputPath, 'html');
        await fs.writeFile(outputFile, styled, 'utf-8');
    }

    /**
     * Generates PDF documentation
     */
    private async generatePdf(content: string, outputPath: string): Promise<void> {
        const html = await this.markdownToHtml(content);
        const styled = await this.applyHtmlStyle(html);
        const outputFile = this.getOutputPath(outputPath, 'pdf');

        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setContent(styled);
        await page.pdf({
            path: outputFile,
            format: 'A4',
            margin: {
                top: '40px',
                right: '40px',
                bottom: '40px',
                left: '40px'
            }
        });
        await browser.close();
    }

    /**
     * Converts markdown to HTML
     */
    private async markdownToHtml(markdown: string): Promise<string> {
        return marked(markdown);
    }

    /**
     * Applies styling to HTML
     */
    private async applyHtmlStyle(html: string): Promise<string> {
        const { title, stylesheet, template } = this.options;

        if (template) {
            const templateHtml = await fs.readFile(template, 'utf-8');
            return templateHtml.replace('{{content}}', html);
        }

        const dom = new JSDOM('<!DOCTYPE html>');
        const { document } = dom.window;

        // Create basic HTML structure
        const head = document.createElement('head');
        const body = document.createElement('body');

        // Add title if provided
        if (title) {
            const titleElement = document.createElement('title');
            titleElement.textContent = title;
            head.appendChild(titleElement);
        }

        // Add stylesheet if provided
        if (stylesheet) {
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = stylesheet;
            head.appendChild(style);
        } else {
            // Add default styles
            const style = document.createElement('style');
            style.textContent = `
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                pre {
                    background: #f4f4f4;
                    padding: 1rem;
                    border-radius: 4px;
                    overflow-x: auto;
                }
                code {
                    font-family: 'Courier New', Courier, monospace;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1rem 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f4f4f4;
                }
            `;
            head.appendChild(style);
        }

        // Add content
        body.innerHTML = html;

        document.documentElement.appendChild(head);
        document.documentElement.appendChild(body);

        return dom.serialize();
    }

    /**
     * Gets output file path
     */
    private getOutputPath(outputPath: string, extension: string): string {
        const { outputDir } = this.options;
        const fileName = path.basename(outputPath, path.extname(outputPath));
        return path.join(outputDir!, `${fileName}.${extension}`);
    }
}
