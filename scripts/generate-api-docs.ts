#!/usr/bin/env node

import * as ts from 'typescript';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import * as glob from 'glob';

interface DocItem {
  name: string;
  kind: string;
  description: string;
  params?: { name: string; type: string; description: string }[];
  returns?: { type: string; description: string };
  examples?: string[];
  since?: string;
  deprecated?: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}

interface ComponentDoc extends DocItem {
  props: DocItem[];
  methods: DocItem[];
}

function extractJSDocComment(node: ts.Node): string[] {
  const comments: string[] = [];
  const nodeText = node.getFullText();
  let commentRanges = ts.getLeadingCommentRanges(nodeText, 0);
  
  if (commentRanges) {
    commentRanges.forEach(range => {
      const comment = nodeText.slice(range.pos, range.end);
      if (comment.startsWith('/**')) {
        comments.push(comment);
      }
    });
  }
  
  return comments;
}

function parseJSDocComment(comment: string): {
  description: string;
  tags: { [key: string]: string };
} {
  const lines = comment
    .replace(/^\/\*\*|\*\/$/g, '')
    .split('\n')
    .map(line => line.replace(/^\s*\*\s?/, ''))
    .filter(line => line.length > 0);
  
  const tags: { [key: string]: string } = {};
  let description = '';
  let currentTag = '';
  
  lines.forEach(line => {
    const tagMatch = line.match(/^@(\w+)\s*(.*)/);
    if (tagMatch) {
      currentTag = tagMatch[1];
      tags[currentTag] = tagMatch[2] || '';
    } else if (currentTag) {
      tags[currentTag] += ' ' + line;
    } else {
      description += line + ' ';
    }
  });
  
  return {
    description: description.trim(),
    tags
  };
}

function getTypeString(type: ts.Type, checker: ts.TypeChecker): string {
  if (type.isUnion()) {
    return type.types.map(t => getTypeString(t, checker)).join(' | ');
  }
  
  if (type.isIntersection()) {
    return type.types.map(t => getTypeString(t, checker)).join(' & ');
  }
  
  const symbol = type.getSymbol();
  if (symbol) {
    return symbol.getName();
  }
  
  return checker.typeToString(type);
}

function extractPropType(
  prop: ts.Symbol,
  checker: ts.TypeChecker
): { type: string; required: boolean } {
  const propType = checker.getTypeOfSymbolAtLocation(
    prop,
    prop.valueDeclaration!
  );
  const required = !(prop.flags & ts.SymbolFlags.Optional);
  
  return {
    type: getTypeString(propType, checker),
    required
  };
}

function processComponent(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker
): ComponentDoc | null {
  let componentDoc: ComponentDoc | null = null;
  
  function visit(node: ts.Node) {
    if (ts.isClassDeclaration(node) || ts.isFunctionDeclaration(node)) {
      const symbol = checker.getSymbolAtLocation(node.name!);
      if (!symbol) return;
      
      const comments = extractJSDocComment(node);
      const { description, tags } = parseJSDocComment(comments[0] || '');
      
      componentDoc = {
        name: symbol.getName(),
        kind: ts.isClassDeclaration(node) ? 'class' : 'function',
        description,
        props: [],
        methods: [],
        since: tags['since'],
        deprecated: tags['deprecated'],
        examples: tags['example']?.split('\n')
      };
      
      // Process props interface
      if (ts.isClassDeclaration(node)) {
        const propsType = node.heritageClauses?.[0]?.types[0];
        if (propsType) {
          const propsSymbol = checker.getSymbolAtLocation(propsType.expression);
          if (propsSymbol) {
            const props = checker.getTypeOfSymbolAtLocation(
              propsSymbol,
              propsSymbol.valueDeclaration!
            );
            
            props.getProperties().forEach(prop => {
              const comments = extractJSDocComment(prop.valueDeclaration!);
              const { description, tags } = parseJSDocComment(comments[0] || '');
              const { type, required } = extractPropType(prop, checker);
              
              componentDoc!.props.push({
                name: prop.getName(),
                kind: 'prop',
                description,
                type,
                required,
                defaultValue: tags['default'],
                since: tags['since'],
                deprecated: tags['deprecated']
              });
            });
          }
        }
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return componentDoc;
}

function generateMarkdown(component: ComponentDoc): string {
  let markdown = `# ${component.name}\n\n`;
  
  if (component.deprecated) {
    markdown += `> ⚠️ **Deprecated:** ${component.deprecated}\n\n`;
  }
  
  markdown += `${component.description}\n\n`;
  
  if (component.since) {
    markdown += `**Since:** ${component.since}\n\n`;
  }
  
  if (component.examples?.length) {
    markdown += '## Examples\n\n';
    component.examples.forEach(example => {
      markdown += '```tsx\n' + example + '\n```\n\n';
    });
  }
  
  if (component.props.length) {
    markdown += '## Props\n\n';
    markdown += '| Name | Type | Required | Default | Description |\n';
    markdown += '|------|------|----------|---------|-------------|\n';
    
    component.props.forEach(prop => {
      const required = prop.required ? '✓' : '';
      const defaultValue = prop.defaultValue || '-';
      const description = prop.deprecated
        ? `~~${prop.description}~~ (Deprecated: ${prop.deprecated})`
        : prop.description;
      
      markdown += `| ${prop.name} | \`${prop.type}\` | ${required} | ${defaultValue} | ${description} |\n`;
    });
    
    markdown += '\n';
  }
  
  if (component.methods.length) {
    markdown += '## Methods\n\n';
    component.methods.forEach(method => {
      markdown += `### ${method.name}\n\n`;
      markdown += `${method.description}\n\n`;
      
      if (method.params?.length) {
        markdown += '**Parameters:**\n\n';
        method.params.forEach(param => {
          markdown += `- \`${param.name}\` (\`${param.type}\`): ${param.description}\n`;
        });
        markdown += '\n';
      }
      
      if (method.returns) {
        markdown += `**Returns:** \`${method.returns.type}\` - ${method.returns.description}\n\n`;
      }
    });
  }
  
  return markdown;
}

function generateDocs(pattern: string, outputDir: string) {
  // Create program
  const configPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    'tsconfig.json'
  );
  
  if (!configPath) {
    throw new Error('Could not find tsconfig.json');
  }
  
  const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    dirname(configPath)
  );
  
  const program = ts.createProgram(glob.sync(pattern), options);
  const checker = program.getTypeChecker();
  
  // Process each source file
  program.getSourceFiles().forEach(sourceFile => {
    if (!sourceFile.isDeclarationFile) {
      const component = processComponent(sourceFile, checker);
      
      if (component) {
        const outputPath = join(
          outputDir,
          `${component.name}.md`
        );
        
        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(outputPath, generateMarkdown(component));
      }
    }
  });
}

// Main execution
function main() {
  const pattern = process.argv[2] || 'src/**/*.{ts,tsx}';
  const outputDir = process.argv[3] || 'docs/api';
  
  try {
    generateDocs(pattern, outputDir);
    console.log('API documentation generated successfully');
  } catch (error) {
    console.error('Failed to generate API documentation:', error);
    process.exit(1);
  }
}

main();
