const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Snap Talk API',
      version: '1.0.0',
      description: 'Complete Social Media Application API Documentation with all features',
      contact: {
        name: 'Snap Talk Support',
        email: 'support@snaptalk.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Paste data.accessToken from /auth/login or /auth/signup, or data.token from /admin/login. Swagger sends it as Authorization: Bearer <token>.',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Request completed successfully.' },
            data: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong.' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'JWT bearer token. Use this value in the Swagger Authorize button.',
            },
            refreshToken: {
              type: 'string',
              description: 'Refresh token used with /auth/refresh-token.',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Logged in successfully.' },
            data: {
              allOf: [
                { $ref: '#/components/schemas/AuthTokens' },
                {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              ],
            },
          },
        },
        AdminAuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Admin logged in.' },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'Admin JWT bearer token. Use this value in the Swagger Authorize button.',
                },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            mobile: { type: 'string' },
            bio: { type: 'string' },
            avatar: { type: 'string' },
            website: { type: 'string' },
            isPrivate: { type: 'boolean' },
            followersCount: { type: 'number' },
            followingCount: { type: 'number' },
            postsCount: { type: 'number' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            author: { type: 'string' },
            mediaUrl: { type: 'string' },
            mediaType: { type: 'string', enum: ['image', 'video'] },
            caption: { type: 'string' },
            likesCount: { type: 'number' },
            commentsCount: { type: 'number' },
            isLiked: { type: 'boolean' },
            isSaved: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            sender: { type: 'string' },
            recipient: { type: 'string' },
            type: { type: 'string', enum: ['text', 'image'] },
            text: { type: 'string' },
            mediaUrl: { type: 'string' },
            seen: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        UploadResult: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            publicId: { type: 'string' },
            resourceType: { type: 'string', enum: ['image', 'video'] },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, '../app.js'), path.join(__dirname, '../routes/*.js')],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
