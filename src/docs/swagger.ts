import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../utils/env.js';
import { adminPath } from './path/admin.path.js';
import { customerPath } from './path/customer.path.js';
import { photoSessionPath } from './path/photoSession.path.js';
import { photosPath } from './path/photos.path.js';
import { adminSchema } from './schemas/admin.schema.js';
import { customerSchema } from './schemas/customer.schema.js';
import { photoSessionSchema } from './schemas/photoSession.schema.js';
import { photosSchema } from './schemas/photos.schema.js';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DSC Photobox API',
      version: '1.0.0',
      description: 'REST API untuk DSC Photobox',
    },
    servers: [
      {
        url: `${env?.BASE_URL}/api`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ...photoSessionSchema,
        ...photosSchema,
        ...customerSchema,
        ...adminSchema,
      },
    },
    paths: {
      ...photoSessionPath,
      ...customerPath,
      ...photosPath,
      ...adminPath,
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
