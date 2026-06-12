import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
import authRoutes from './routes/auth.routes';
import businessRoutes from './routes/business.routes';
import subscriptionRoutes from './routes/subscription.routes';
import userRoutes from './routes/user.routes';
import settingsRoutes from './routes/settings.routes';
import analyticsRoutes from './routes/analytics.routes';
import paymentRoutes from './routes/payment.routes';
import activityRoutes from './routes/activity.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';
import tableRoutes from './routes/table.routes';
import inventoryRoutes from './routes/inventory.routes';
import staffRoutes from './routes/staff.routes';
import restroSignatureRoutes from './routes/restrosignature.routes';
import barLoungeRoutes from './routes/barlounge.routes';
import cafeBakeryRoutes from './routes/cafebakery.routes';
import customerRoutes from './routes/customer.routes';
import uploadRoutes from './routes/upload.routes';
import reservationRoutes from './routes/reservation.routes';

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Welcome to RestroHub Backend API' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'RestroHub API is running smoothly' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/restro', restroSignatureRoutes);
app.use('/api/barlounge', barLoungeRoutes);
app.use('/api/cafebakery', cafeBakeryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reservations', reservationRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

export default app;
