const swaggerJsdoc = require('swagger-jsdoc');

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
          description: 'JWT token from login/signup response',
        },
      },
      schemas: {
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
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
