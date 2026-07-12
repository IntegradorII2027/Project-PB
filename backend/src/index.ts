import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes';
import helmet from 'helmet';
import { logger } from './utils/logger';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: { error: 'Demasiadas peticiones, intenta más tarde' },
});

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de login, intenta más tarde' },
});

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173'
    ].filter(Boolean);

    if (!origin) return callback(null, true);

    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true,
}));

app.use(helmet({
  crossOriginResourcePolicy: {
    policy: 'cross-origin',
  },
}));

app.use(express.json());

app.use(cookieParser());

app.get('/api/csrf-token', (_, res) => {
  const token =
    crypto.randomBytes(32)
      .toString('hex');

  res.cookie(
    'csrf-token',
    token,
    {
      httpOnly: false,
      secure:
        process.env.NODE_ENV ===
        'production',

      sameSite:
        process.env.NODE_ENV ===
          'production'
          ? 'none'
          : 'lax',

      maxAge: 1 * 60 * 60 * 1000,
    }
  );

  res.json({
    csrfToken: token,
  });
});

const csrfMiddleware =
  (
    req: any,
    res: any,
    next: any
  ) => {

    const excluded = [
      '/auth/login',
      '/csrf-token',
    ];

    if (
      excluded.some(
        (r) =>
          req.path.startsWith(
            r
          )
      )
    ) {
      return next();
    }

    if (
      ['GET', 'HEAD', 'OPTIONS']
        .includes(
          req.method
        )
    ) {
      return next();
    }

    const cookie =
      req.cookies[
      'csrf-token'
      ];

    const header =
      req.header(
        'CSRF-Token'
      );

    if (
      !cookie ||
      cookie !== header
    ) {
      return res
        .status(403)
        .json({
          error:
            'CSRF inválido',
        });
    }
    next();
  };
app.use(limiter);
app.use('/api/auth/login', loginLimiter);

app.use((req, res, next) => {
  res.on('finish', () => {
    const msg = `${req.method} ${req.path} ${res.statusCode}`;

    if (res.statusCode >= 500)
      logger.error(msg);
    else if (res.statusCode >= 400)
      logger.warn(msg);
    else
      logger.info(msg);
  });

  next();
});

app.use('/api', csrfMiddleware, router);

app.get('/api/health', (_, res) =>
  res.json({
    status: 'ok',
    version: '2.0.0',
  })
);

app.listen(PORT, () => {
  console.log(
     `🚀RestaurantOS v2 backend corriendo en http://localhost:${PORT}`
  );
});