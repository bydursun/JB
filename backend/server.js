// ============================================
// COMP229 - Job Portal Application Server
// Main server file implementing Express.js backend
// ============================================

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES6 modules don't have __dirname, so we create it manually
// This is needed for serving static files and path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// IMPORT ROUTES (MVC Pattern - Routes Layer)
// Each route file handles specific resource endpoints
// ============================================
import authRoutes from './routes/authRoutes.js';        // Authentication & user management
import jobRoutes from './routes/jobRoutes.js';          // Job posting CRUD operations
import userRoutes from './routes/userRoutes.js';        // User profile operations
import applicationRoutes from './routes/applicationRoutes.js'; // Job application management

// Load environment variables from .env file
// This keeps sensitive data (DB credentials, JWT secrets) out of code
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000; // Default to 5000 if not specified in .env

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.RENDER_FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  
  'https://jobportal-backend-jihl.onrender.com',

].filter(Boolean);

// ============================================
// MIDDLEWARE CONFIGURATION
// Middleware functions execute in order for every request
// ============================================

// CORS (Cross-Origin Resource Sharing)
// Allows frontend (React on port 5173) to communicate with backend (Express on port 5000)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true // Allow cookies and authorization headers
}));

// Body Parser Middleware
// Parse incoming JSON payloads (req.body) for POST/PUT requests
app.use(express.json());

// Parse URL-encoded form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Custom Request Logger Middleware
// Logs every incoming request for debugging purposes
// Helps track which endpoints are being called
app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next(); // Pass control to next middleware
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// DATABASE CONNECTION FUNCTION
// Connects to MongoDB Atlas using Mongoose ODM
// ============================================
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim().length === 0) {
    console.error('[DB] MONGODB_URI is missing. Create .env with MONGODB_URI.');
    console.error('[DB] Example: mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority');
    process.exit(1);
    return;
  }

  console.log(`[DB] Attempting MongoDB connection...`);
  console.log(`[DB] Target URI present: ${uri.startsWith('mongodb') ? 'Yes' : 'No'}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    });
    console.log(`[DB] MongoDB Connected to host: ${conn.connection.host}`);
  } catch (error) {
    console.error('[DB] Database connection error:');
    // Print common diagnostics to help identify Atlas issues quickly
    console.error(`- Name: ${error.name}`);
    console.error(`- Message: ${error.message}`);
    if (error.reason && error.reason.type) {
      console.error(`- Topology Type: ${error.reason.type}`);
    }
    console.error('- Tips:');
    console.error('  1) Verify IP is whitelisted in Atlas (Network Access).');
    console.error('  2) Confirm username/password and database name in URI.');
    console.error('  3) Ensure SRV URI starts with mongodb+srv and uses correct cluster.');
    console.error('  4) Check that your cluster is running and not paused.');
    process.exit(1);
  }
};

// ============================================
// ROUTE MOUNTING (MVC Pattern - Routes Layer)
// Mount route handlers at specific base paths
// All routes are prefixed with /api for API versioning
// ============================================
app.use('/api/auth', authRoutes);           // Authentication endpoints: /api/auth/register, /api/auth/login
app.use('/api/jobs', jobRoutes);            // Job CRUD endpoints: /api/jobs, /api/jobs/:id
app.use('/api/users', userRoutes);          // User management: /api/users, /api/users/:id
app.use('/api/applications', applicationRoutes); // Application endpoints: /api/applications

// ============================================
// HEALTH CHECK ENDPOINT
// Simple endpoint to verify server is running
// Useful for monitoring and deployment verification
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Job Portal API is running!', 
    timestamp: new Date().toISOString() 
  });
});

// Render/uptime health check without /api prefix for load balancers
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// Must be defined AFTER all routes
// Catches any errors thrown in route handlers
// ============================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    // Hide detailed error messages in production for security
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message 
  });
});

// ============================================
// 404 NOT FOUND HANDLER
// Catches all undefined routes
// Must be the LAST route handler
// ============================================
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error);

export default app;
