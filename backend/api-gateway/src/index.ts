import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service URLs
const services = {
  user: process.env.USER_SERVICE_URL || 'http://localhost:3002',
  matching: process.env.MATCHING_SERVICE_URL || 'http://localhost:3003',
  messaging: process.env.MESSAGING_SERVICE_URL || 'http://localhost:3004',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006',
};

// Authentication middleware
const authenticateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Pass through authorization headers to services
  next();
};

// Route requests to appropriate services
app.use('/api/users', createProxy('user'));
app.use('/api/matches', createProxy('matching'));
app.use('/api/messages', createProxy('messaging'));
app.use('/api/payments', createProxy('payment'));
app.use('/api/notifications', createProxy('notification'));

// Auth routes (handled by frontend for now, but could be proxied)
app.use('/api/auth', (req, res) => {
  // These are handled by Next.js API routes in the frontend
  res.status(404).json({ error: 'Auth routes should be handled by frontend API' });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const healthChecks = await Promise.allSettled([
      axios.get(`${services.user}/health`),
      axios.get(`${services.matching}/health`),
      axios.get(`${services.messaging}/health`),
      axios.get(`${services.payment}/health`),
      axios.get(`${services.notification}/health`),
    ]);

    const results = {
      gateway: 'healthy',
      services: {
        user: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        matching: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        messaging: healthChecks[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        payment: healthChecks[3].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        notification: healthChecks[4].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      },
      timestamp: new Date().toISOString()
    };

    const allHealthy = Object.values(results.services).every(status => status === 'healthy');
    res.status(allHealthy ? 200 : 503).json(results);
  } catch (error) {
    res.status(503).json({
      gateway: 'unhealthy',
      error: 'Failed to check service health',
      timestamp: new Date().toISOString()
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Sugar Daddy API Gateway',
    status: 'running',
    version: '1.0.0',
    services: Object.keys(services)
  });
});

// Proxy function to forward requests to services
function createProxy(serviceName: keyof typeof services) {
  return async (req: express.Request, res: express.Response) => {
    try {
      const serviceUrl = services[serviceName];
      const url = `${serviceUrl}${req.path}`;

      const response = await axios({
        method: req.method as any,
        url,
        data: req.body,
        params: req.query,
        headers: {
          ...req.headers,
          // Remove host header to avoid conflicts
          host: new URL(serviceUrl).host,
        },
        timeout: 30000, // 30 second timeout
      });

      // Forward the response
      res.status(response.status).json(response.data);
    } catch (error: any) {
      if (error.response) {
        // Service returned an error
        res.status(error.response.status).json(error.response.data);
      } else if (error.code === 'ECONNREFUSED') {
        // Service is down
        res.status(503).json({
          error: 'Service unavailable',
          service: serviceName,
          message: `${serviceName} service is currently unavailable`
        });
      } else {
        // Other error
        console.error(`Proxy error for ${serviceName}:`, error.message);
        res.status(500).json({
          error: 'Internal server error',
          service: serviceName
        });
      }
    }
  };
}

// Socket.IO for real-time features
io.on('connection', (socket) => {
  console.log('Client connected to gateway:', socket.id);

  // Forward socket events to messaging service
  socket.onAny((event, ...args) => {
    // Could forward to messaging service if needed
    console.log(`Socket event: ${event}`, args);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected from gateway:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log('Connected services:', services);
});