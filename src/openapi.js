const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Notes API',
      version: '1.0.0',
      description: 'Multi-user notes backend — intern assignment',
    },
    servers: [{ url: '/', description: 'Current host' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Note: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            content: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        NoteInput: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
          },
        },
        ShareRequest: {
          type: 'object',
          required: ['share_with_email'],
          properties: {
            share_with_email: { type: 'string', format: 'email' },
          },
        },
        PinRequest: {
          type: 'object',
          required: ['pinned'],
          properties: {
            pinned: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      '/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
          },
          responses: {
            201: { description: 'User created' },
            400: { description: 'Validation error' },
            409: { description: 'Email already exists' },
          },
        },
      },
      '/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and receive JWT',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
          },
          responses: {
            200: {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { access_token: { type: 'string' } },
                  },
                },
              },
            },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/notes': {
        get: {
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          summary: 'List notes for authenticated user',
          responses: {
            200: {
              description: 'List of notes',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Note' } },
                },
              },
            },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          summary: 'Create a note',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/NoteInput' } } },
          },
          responses: {
            201: {
              description: 'Created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } },
            },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/notes/{id}': {
        get: {
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          summary: 'Get note by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Note', content: { 'application/json': { schema: { $ref: '#/components/schemas/Note' } } } },
            404: { description: 'Not found' },
          },
        },
        put: {
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          summary: 'Update a note',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/NoteInput' } } },
          },
          responses: { 200: { description: 'Updated note' }, 404: { description: 'Not found' } },
        },
        delete: {
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          summary: 'Delete a note',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } },
        },
      },
      '/notes/{id}/share': {
        post: {
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          summary: 'Share note with another user',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ShareRequest' } } },
          },
          responses: { 200: { description: 'Shared' } },
        },
      },
      '/notes/{id}/pin': {
        patch: {
          tags: ['Notes'],
          security: [{ bearerAuth: [] }],
          summary: 'Pin or unpin a note (custom feature)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/PinRequest' } } },
          },
          responses: { 200: { description: 'Pinned state updated' } },
        },
      },
      '/about': {
        get: {
          tags: ['Meta'],
          summary: 'About the author and custom features',
          responses: { 200: { description: 'About info' } },
        },
      },
    },
  },
  apis: [],
};

const spec = swaggerJsdoc(options);

module.exports = spec;
