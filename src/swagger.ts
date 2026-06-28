import { OpenAPIV3 } from 'openapi-types';

const spec: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'Tanwir Emailer API',
    version: '1.0.0',
    description: 'Internal email service for Tanwir Institute',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        security: [],
        responses: {
          200: {
            description: 'Service is running',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { status: { type: 'string', example: 'ok' } } },
              },
            },
          },
        },
      },
    },
    '/send-financial-aid-email': {
      post: {
        summary: 'Send a financial aid approval email',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['recipientEmail', 'studentName', 'discountPercentage', 'discountCode', 'programName'],
                properties: {
                  recipientEmail: { type: 'string', format: 'email', example: 'student@example.com' },
                  studentName: { type: 'string', example: 'Ahmad Ali' },
                  discountPercentage: {
                    oneOf: [{ type: 'integer' }, { type: 'string' }],
                    enum: [25, 50, 75, 100, '25', '50', '75', '100'],
                    example: 50,
                  },
                  discountCode: { type: 'string', example: 'AID-2024-XYZ' },
                  programName: { type: 'string', example: 'Arabic Intensive' },
                  additionalDetails: { type: 'string', example: 'Please complete registration within 14 days.' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Email sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Financial aid acceptance email sent successfully' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid request',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Missing required fields' },
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Unauthorized' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Failed to send email',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string' },
                    error: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export default spec;
