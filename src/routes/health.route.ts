import { Router } from 'express';

const healthRoute = Router();

healthRoute.get('/', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default healthRoute;
