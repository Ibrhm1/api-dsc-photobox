import { Router } from 'express';
import { env } from '../utils/env';

const healthRoute = Router();

healthRoute.get('/', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default healthRoute;
