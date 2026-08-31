import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.ts';
import { errorMiddleware } from './middlewares/error.middleware.ts';
import { notFoundMiddleware } from './middlewares/notFound.middleware.ts';
import { globalRateLimiter } from './middlewares/rateLimit.middleware.ts';
import { requestIdMiddleware } from './middlewares/requestId.middleware.ts';
import healthRoute from './routes/health.route.ts';
import router from './routes/route.ts';
import { env } from './utils/env.ts';

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
