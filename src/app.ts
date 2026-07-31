import express from 'express';
import { PaymentController } from './api/v1/payments/PaymentController';

const app = express();
app.use(express.json());

// API Routes
const paymentController = new PaymentController();

app.post('/api/v1/payments', (req, res) => paymentController.createPayment(req, res));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'payment-os' });
});

export { app };
