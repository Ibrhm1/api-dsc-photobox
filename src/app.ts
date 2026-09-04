import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { notFoundMiddleware } from './middlewares/notFound.middleware.js';
import { globalRateLimiter } from './middlewares/rateLimit.middleware.js';
import { requestIdMiddleware } from './middlewares/requestId.middleware.js';
import healthRoute from './routes/health.route.js';
import router from './routes/route.js';
import { env } from './utils/env.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.ORIGIN_ALLOWED, credentials: true }));
app.use(express.json());
app.use(requestIdMiddleware);

// Endpoint
app.use('/', healthRoute);
app.use('/api', globalRateLimiter, router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error and 404 Handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
