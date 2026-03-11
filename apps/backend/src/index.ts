import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import Redis from 'ioredis';
import { GameSessionService } from './services/GameSessionService';
import { createGameRouter } from './routes/game';

const PORT = process.env.PORT ?? 3001;
const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV ?? 'development';

const app = express();

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

const redis = new Redis(REDIS_URL);

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
  console.log(`Connected to Redis at ${REDIS_URL}`);
});

const sessionService = new GameSessionService(redis);
app.use('/api/game', createGameRouter(sessionService));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', redis: redis.status });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(err.status ?? 500).json({ error: err.message ?? 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT} [${NODE_ENV}]`);
});
