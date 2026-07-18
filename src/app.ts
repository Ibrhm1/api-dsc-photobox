import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import healthRoute from './routes/health.route';
import router from './routes/route';
import { env } from './utils/env';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: env.ORIGIN_ALLOWED }));
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
