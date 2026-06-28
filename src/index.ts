import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { requireApiKey } from './middleware/auth';
import financialAidRouter from './routes/financialAid';
import swaggerSpec from './swagger';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 50,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/send-financial-aid-email', limiter, requireApiKey, financialAidRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
