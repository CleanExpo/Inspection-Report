import { DocGenerator, GeneratorOptions } from '../../../docs/tools/generator';
import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { Browser, Page } from 'puppeteer';
import type { PathLike } from 'fs';

// Define mock types
type MockFn = jest.Mock;

interface MockPage {
    setContent: MockFn;
    pdf: MockFn;
}

interface MockBrowser {
    newPage: MockFn;
    close: MockFn;
}

// Create partial mock of fs module with required functions
const mockFs = {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    mkdir: jest.fn()
};

// Mock puppeteer module
const mockPuppeteer = {
    launch: jest.fn()
};

// Mock modules
jest.mock('fs/promises', () => ({
    writeFile: mockFs.writeFile,
    readFile: mockFs.readFile,
    mkdir: mockFs.mkdir
}));
jest.mock('puppeteer', () => mockPuppeteer);

jest.mock('marked', () => ({
    marked: jest.fn((text) => `<p>${text}</p>`)
}));

jest.mock('jsdom', () => ({
    JSDOM: jest.fn(() => ({
        window: {
            document: {
                createElement: jest.fn(() => ({
                    appendChild: jest.fn(),
                    textContent: '',
                    innerHTML: '',
                    rel: '',
                    href: ''
                })),
                documentElement: {
                    appendChild: jest.fn()
                }
            }
        },
        serialize: jest.fn(() => '<!DOCTYPE html><html></html>')
    }))
}));

describe('Documentation Generator', () => {
    const mockContent = '# Test Document\n\nTest content';
    const mockOutputPath = 'test-doc';
    const mockOutputDir = 'test-dist';

    beforeEach(() => {
        jest.clearAllMocks();
        mockFs.writeFile.mockImplementation(() => Promise.resolve());
        mockFs.mkdir.mockImplementation(() => Promise.resolve());
        mockFs.readFile.mockImplementation(() => Promise.resolve(Buffer.from('')));
    });

    describe('Markdown Generation', () => {
        it('should generate markdown file', async () => {
            const options: GeneratorOptions = {
                format: 'markdown',
                outputDir: mockOutputDir
            };

            const generator = new DocGenerator(options);
            await generator.generate(mockContent, mockOutputPath);

            expect(mockFs.writeFile).toHaveBeenCalledWith(
                path.join(mockOutputDir, 'test-doc.md'),
                mockContent,
                'utf-8'
            );
        });
    });

    describe('HTML Generation', () => {
        it('should generate HTML file with default styles', async () => {
            const options: GeneratorOptions = {
                format: 'html',
                outputDir: mockOutputDir,
                title: 'Test Document'
            };

            const generator = new DocGenerator(options);
            await generator.generate(mockContent, mockOutputPath);

            expect(mockFs.writeFile).toHaveBeenCalledWith(
                path.join(mockOutputDir, 'test-doc.html'),
                expect.stringContaining('<!DOCTYPE html>'),
                'utf-8'
            );
        });

        it('should use custom stylesheet when provided', async () => {
            const options: GeneratorOptions = {
                format: 'html',
                outputDir: mockOutputDir,
                stylesheet: 'custom.css'
            };

            const generator = new DocGenerator(options);
            await generator.generate(mockContent, mockOutputPath);

            expect(mockFs.writeFile).toHaveBeenCalledWith(
                path.join(mockOutputDir, 'test-doc.html'),
                expect.stringContaining('custom.css'),
                'utf-8'
            );
        });

        it('should use custom template when provided', async () => {
            const mockTemplate = '<html>{{content}}</html>';
            mockFs.readFile.mockImplementation(() => Promise.resolve(Buffer.from(mockTemplate)));

            const options: GeneratorOptions = {
                format: 'html',
                outputDir: mockOutputDir,
                template: 'template.html'
            };

            const generator = new DocGenerator(options);
            await generator.generate(mockContent, mockOutputPath);

            expect(mockFs.readFile).toHaveBeenCalledWith('template.html', 'utf-8');
            expect(mockFs.writeFile).toHaveBeenCalledWith(
                path.join(mockOutputDir, 'test-doc.html'),
                expect.stringContaining(mockContent),
                'utf-8'
            );
        });
    });

    describe('PDF Generation', () => {
        let mockPage: MockPage;
        let mockBrowser: MockBrowser;

        beforeEach(() => {
            mockPage = {
                setContent: jest.fn().mockImplementation(() => Promise.resolve()),
                pdf: jest.fn().mockImplementation(() => Promise.resolve())
            };

            mockBrowser = {
                newPage: jest.fn().mockImplementation(() => Promise.resolve(mockPage)),
                close: jest.fn().mockImplementation(() => Promise.resolve())
            };

            mockPuppeteer.launch.mockImplementation(() => Promise.resolve(mockBrowser as unknown as Browser));
        });

        it('should generate PDF file', async () => {
            const options: GeneratorOptions = {
                format: 'pdf',
                outputDir: mockOutputDir
            };

            const generator = new DocGenerator(options);
            await generator.generate(mockContent, mockOutputPath);

            expect(mockPage.setContent).toHaveBeenCalled();
            expect(mockPage.pdf).toHaveBeenCalledWith({
                path: path.join(mockOutputDir, 'test-doc.pdf'),
                format: 'A4',
                margin: {
                    top: '40px',
                    right: '40px',
                    bottom: '40px',
                    left: '40px'
                }
            });
            expect(mockBrowser.close).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should handle file write errors', async () => {
            const mockError = new Error('Write error');
            mockFs.writeFile.mockImplementation(() => Promise.reject(mockError));

            const options: GeneratorOptions = {
                format: 'markdown',
                outputDir: mockOutputDir
            };

            const generator = new DocGenerator(options);
            await expect(generator.generate(mockContent, mockOutputPath))
                .rejects
                .toThrow('Write error');
        });

        it('should handle template read errors', async () => {
            const mockError = new Error('Template not found');
            mockFs.readFile.mockImplementation(() => Promise.reject(mockError));

            const options: GeneratorOptions = {
                format: 'html',
                outputDir: mockOutputDir,
                template: 'missing.html'
            };

            const generator = new DocGenerator(options);
            await expect(generator.generate(mockContent, mockOutputPath))
                .rejects
                .toThrow('Template not found');
        });

        it('should handle PDF generation errors', async () => {
            const mockError = new Error('PDF generation failed');
            const mockPage: MockPage = {
                setContent: jest.fn().mockImplementation(() => Promise.resolve()),
                pdf: jest.fn().mockImplementation(() => Promise.reject(mockError))
            };

            const mockBrowser: MockBrowser = {
                newPage: jest.fn().mockImplementation(() => Promise.resolve(mockPage)),
                close: jest.fn().mockImplementation(() => Promise.resolve())
            };

            mockPuppeteer.launch.mockImplementation(() => Promise.resolve(mockBrowser as unknown as Browser));

            const options: GeneratorOptions = {
                format: 'pdf',
                outputDir: mockOutputDir
            };

            const generator = new DocGenerator(options);
            await expect(generator.generate(mockContent, mockOutputPath))
                .rejects
                .toThrow('PDF generation failed');

            expect(mockBrowser.close).toHaveBeenCalled();
        });
    });
});
