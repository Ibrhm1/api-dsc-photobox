import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../utils/env.ts';
import { cleanUpPath } from './path/cleanUp.path.ts';
import { customerPath } from './path/customer.path.ts';
import { photoSessionPath } from './path/photoSession.path.ts';
import { photosPath } from './path/photos.path.ts';
import { customerSchema } from './schemas/customer.schema.ts';
import { photoSessionSchema } from './schemas/photoSession.schema.ts';
import { photosSchema } from './schemas/photos.schema.ts';

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
        url: `${env.BASE_URL}/api`,
        description: 'Development Server',
      },
    ],
    components: {
      schemas: {
        ...photoSessionSchema,
        ...photosSchema,
        ...customerSchema,
      },
    },
    paths: {
      ...photoSessionPath,
      ...customerPath,
      ...photosPath,
      '/clean-up': cleanUpPath,
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
