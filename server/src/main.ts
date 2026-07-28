import express from 'express';
import webhookRoute from './routes/webhookRoute';
import { errorMiddleware } from './middleware/errorMiddleware';
import destinationRoute from './routes/destinationRoute';

const app = express();

app.use(express.json());

app.use('/api/webhook', webhookRoute);
app.use('/api/destination', destinationRoute);

// test route to receive webhooks
app.post('/api/test-receiver', (req, res) => {
  console.log('Webhook received:');
  console.log(req.body);

  res.status(200).json({
    success: true,
    message: 'Webhook received successfully',
  });
});

// last middleware to handle errors
app.use(errorMiddleware);

export default app;
