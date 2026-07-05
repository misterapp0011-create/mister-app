import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { zodErrorMiddleware } from './controllers/authController.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(zodErrorMiddleware);
  app.use(errorHandler);

  return app;
}
