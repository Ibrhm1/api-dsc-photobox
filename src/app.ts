import express from 'express';
import { errorMiddleware } from './middlewares/error.middleware';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import router from './routes/route';

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);
app.use('/api', router);

// Error and 404 Handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
