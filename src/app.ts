import express from 'express';
import router from './routes/route';
import { notFoundMiddleware } from './middlewares/notFound.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { requestIdMiddleware } from './middlewares/requestId.middleware';

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);
app.use('/api', router);

// Error and 404 Handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
