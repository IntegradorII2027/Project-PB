import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: (origin, callback) => {
    // Permite cualquier localhost en dev, y el FRONTEND_URL en producción
    if (!origin || origin.startsWith('http://localhost') || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('CORS no permitido'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api', router);

app.get('/health', (_, res) => res.json({ status: 'ok', version: '2.0.0' }));

app.listen(PORT, () => {
  console.log(`🚀 RestaurantOS v2 backend corriendo en http://localhost:${PORT}`);
});
