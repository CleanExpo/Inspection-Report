import { APIDocGenerator, APIDocConfig } from '../docs/api/config';
import fs from 'fs/promises';
import path from 'path';

/**
 * Documentation configuration for moisture API
 */
const moistureApiConfig: APIDocConfig = {
    version: '1.0.0',
    title: 'Moisture Mapping API',
    description: 'API for managing moisture readings and locations in inspection reports.',
    baseUrl: 'https://api.example.com/v1',
    authentication: {
        type: 'bearer',
        description: 'Bearer token authentication is required for most endpoints. Include the JWT token in the Authorization header.',
        examples: [
            {
                title: 'Authentication Header Example',
                language: 'bash',
                code: 'Authorization: Bearer <token>'
            }
        ]
    },
    endpoints: [
        {
            path: '/api/moisture/readings',
            method: 'POST',
            description: 'Create a new moisture reading for a location.',
            authentication: true,
            parameters: [
                {
                    name: 'locationId',
                    type: 'string',
                    required: true,
                    description: 'ID of the location to record reading for',
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
                        value: {
                            type: 'number',
                            description: 'Moisture reading value (percentage)',
                            minimum: 0,
                            maximum: 100
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Time of reading (ISO 8601)'
                        },
                        notes: {
                            type: 'string',
                            description: 'Optional notes about the reading'
                        }
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
                            id: {
                                type: 'string',
                                description: 'Unique identifier for the reading'
                            },
                            locationId: {
                                type: 'string',
                                description: 'Location ID'
                            },
                            value: {
                                type: 'number',
                                description: 'Moisture reading value'
                            },
                            timestamp: {
                                type: 'string',
                                description: 'Time of reading'
                            },
                            notes: {
                                type: 'string',
                                description: 'Optional notes'
                            }
                        }
                    }
                },
                {
                    status: 400,
                    description: 'Invalid request',
                    schema: {
                        type: 'object',
                        properties: {
                            error: {
                                type: 'string',
                                description: 'Error message'
                            },
                            details: {
                                type: 'array',
                                items: {
                                    type: 'string'
                                },
                                description: 'Detailed error messages'
                            }
                        }
                    }
                }
            ],
            examples: [
                {
                    title: 'Create Reading Example',
                    request: {
                        headers: {
                            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
                            'Content-Type': 'application/json'
                        },
                        body: {
                            value: 45.5,
                            timestamp: '2024-01-15T12:00:00Z',
                            notes: 'North wall reading'
                        }
                    },
                    response: {
                        status: 200,
                        body: {
                            id: 'read_123abc',
                            locationId: 'loc_456def',
                            value: 45.5,
                            timestamp: '2024-01-15T12:00:00Z',
                            notes: 'North wall reading'
                        }
                    }
                }
            ]
        }
    ],
    examples: [
        {
            title: 'Curl Example',
            language: 'bash',
            code: `curl -X POST https://api.example.com/v1/moisture/readings \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "value": 45.5,
    "timestamp": "2024-01-15T12:00:00Z",
    "notes": "North wall reading"
  }'`,
            description: 'Example using curl to create a reading'
        }
    ]
};

/**
 * Generates documentation for all APIs
 */
async function generateDocs() {
    try {
        // Create docs directory if it doesn't exist
        const docsDir = path.join(__dirname, '..', 'docs', 'api');
        await fs.mkdir(docsDir, { recursive: true });

        // Generate moisture API docs
        const moistureApiGenerator = new APIDocGenerator(moistureApiConfig);
        const moistureApiDocs = moistureApiGenerator.generate();
        await fs.writeFile(
            path.join(docsDir, 'moisture-api.md'),
            moistureApiDocs,
            'utf-8'
        );

        console.log('Documentation generated successfully');
    } catch (error) {
        console.error('Error generating documentation:', error);
        process.exit(1);
    }
}

// Run generator
generateDocs();
