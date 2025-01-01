import { 
    APIDocGenerator, 
    APIDocConfig,
    EndpointDoc
} from '../../../docs/api/config';
import { jest, expect, describe, it } from '@jest/globals';

describe('API Documentation Generator', () => {
    const mockEndpoint: EndpointDoc = {
        path: '/api/moisture/readings',
        method: 'POST',
        description: 'Create a new moisture reading',
        authentication: true,
        parameters: [
            {
                name: 'locationId',
                type: 'string',
                required: true,
                description: 'ID of the location',
                location: 'query'
            }
        ],
        requestBody: {
            type: 'object',
            required: true,
            description: 'Moisture reading data',
            schema: {
                type: 'object',
                properties: {
                    value: { type: 'number' },
                    timestamp: { type: 'string' }
                },
                required: ['value']
            }
        },
        responses: [
            {
                status: 200,
                description: 'Reading created successfully',
                schema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        value: { type: 'number' },
                        timestamp: { type: 'string' }
                    }
                }
            },
            {
                status: 400,
                description: 'Invalid request',
                schema: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        ],
        examples: [
            {
                title: 'Create Reading',
                request: {
                    headers: {
                        'Authorization': 'Bearer token123',
                        'Content-Type': 'application/json'
                    },
                    params: {
                        locationId: 'loc123'
                    },
                    body: {
                        value: 45.5,
                        timestamp: '2024-01-15T12:00:00Z'
                    }
                },
                response: {
                    status: 200,
                    body: {
                        id: 'reading123',
                        value: 45.5,
                        timestamp: '2024-01-15T12:00:00Z'
                    }
                }
            }
        ]
    };

    const mockConfig: APIDocConfig = {
        version: '1.0.0',
        title: 'Moisture Mapping API',
        description: 'API for managing moisture readings and locations',
        baseUrl: 'https://api.example.com',
        authentication: {
            type: 'bearer',
            description: 'Use Bearer token authentication',
            examples: [
                {
                    title: 'Authentication Header',
                    language: 'bash',
                    code: 'Authorization: Bearer <token>'
                }
            ]
        },
        endpoints: [mockEndpoint],
        examples: [
            {
                title: 'Curl Example',
                language: 'bash',
                code: 'curl -X POST https://api.example.com/readings',
                description: 'Example using curl'
            }
        ]
    };

    describe('generate', () => {
        it('should generate complete documentation', () => {
            const generator = new APIDocGenerator(mockConfig);
            const docs = generator.generate();

            // Verify header section
            expect(docs).toContain('# Moisture Mapping API');
            expect(docs).toContain('API Version: 1.0.0');
            expect(docs).toContain('`https://api.example.com`');

            // Verify authentication section
            expect(docs).toContain('## Authentication');
            expect(docs).toContain('Bearer token authentication');

            // Verify endpoints section
            expect(docs).toContain('## Endpoints');
            expect(docs).toContain('### POST /api/moisture/readings');
            expect(docs).toContain('**Requires Authentication**');

            // Verify parameters table
            expect(docs).toContain('| Name | Type | Required | Description |');
            expect(docs).toContain('| locationId | string | Yes |');

            // Verify request body
            expect(docs).toContain('#### Request Body');
            expect(docs).toContain('"type": "object"');
            expect(docs).toContain('"value": {');

            // Verify responses
            expect(docs).toContain('#### Responses');
            expect(docs).toContain('##### 200 Response');
            expect(docs).toContain('##### 400 Response');

            // Verify examples
            expect(docs).toContain('#### Examples');
            expect(docs).toContain('##### Create Reading');
            expect(docs).toContain('"Authorization": "Bearer token123"');

            // Verify additional examples
            expect(docs).toContain('## Additional Examples');
            expect(docs).toContain('### Curl Example');
            expect(docs).toContain('curl -X POST');
        });

        it('should handle missing authentication config', () => {
            const configWithoutAuth: APIDocConfig = {
                ...mockConfig,
                authentication: undefined
            };

            const generator = new APIDocGenerator(configWithoutAuth);
            const docs = generator.generate();

            expect(docs).not.toContain('## Authentication');
            expect(docs).toContain('# Moisture Mapping API');
        });

        it('should handle endpoints without parameters', () => {
            const endpointWithoutParams: EndpointDoc = {
                ...mockEndpoint,
                parameters: undefined
            };

            const configWithoutParams = {
                ...mockConfig,
                endpoints: [endpointWithoutParams]
            };

            const generator = new APIDocGenerator(configWithoutParams);
            const docs = generator.generate();

            expect(docs).not.toContain('#### Parameters');
            expect(docs).toContain('### POST /api/moisture/readings');
        });

        it('should handle endpoints without examples', () => {
            const endpointWithoutExamples: EndpointDoc = {
                ...mockEndpoint,
                examples: []
            };

            const configWithoutExamples = {
                ...mockConfig,
                endpoints: [endpointWithoutExamples]
            };

            const generator = new APIDocGenerator(configWithoutExamples);
            const docs = generator.generate();

            expect(docs).not.toContain('#### Examples');
            expect(docs).toContain('### POST /api/moisture/readings');
        });
    });
});
