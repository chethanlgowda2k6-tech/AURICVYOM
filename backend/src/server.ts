import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import destinationsRoutes from './routes/destinations.routes';
import propertiesRoutes from './routes/properties.routes';
import plannerRoutes from './routes/planner.routes';
import bookingsRoutes from './routes/bookings.routes';
import transportRoutes from './routes/transport.routes';
import searchRoutes from './routes/search.routes';
import holdsRoutes from './routes/holds.routes';
import reviewsRoutes from './routes/reviews.routes';
import notificationsRoutes from './routes/notifications.routes';
import adminRoutes from './routes/admin.routes';
import analyticsRoutes from './routes/analytics.routes';
import assistantRoutes from './routes/assistant.routes';
import { notificationScheduler } from './services/notificationScheduler.service';

const app = express();
const PORT = process.env.PORT || 5001;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/destinations`, destinationsRoutes);
app.use(`${API_PREFIX}/properties`, propertiesRoutes);
app.use(`${API_PREFIX}/planner`, plannerRoutes);
app.use(`${API_PREFIX}/bookings`, bookingsRoutes);
app.use(`${API_PREFIX}/transport`, transportRoutes);
app.use(`${API_PREFIX}/search`, searchRoutes);
app.use(`${API_PREFIX}/holds`, holdsRoutes);
app.use(`${API_PREFIX}/reviews`, reviewsRoutes);
app.use(`${API_PREFIX}/notifications`, notificationsRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);
app.use(`${API_PREFIX}/analytics`, analyticsRoutes);
app.use(`${API_PREFIX}/assistant`, assistantRoutes);

// Health Check
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.json({ success: true, message: 'AuricVyom API is running smoothly.', version: '1.0.0' });
});

// Start Server & Notification Scheduler
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
  notificationScheduler.startScheduler();
});
