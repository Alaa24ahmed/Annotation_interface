const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });
console.log("Env file path:", path.join(__dirname, '../.env'));
console.log("Environment variables loaded:", {
  SUPABASE_URL: process.env.SUPABASE_URL ? "Found" : "Missing",
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? "Found" : "Missing"
});
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Heroku (only in production)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
}

// Security middleware with CSP configuration to allow inline scripts/styles
// and FingerprintJS CDN
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Rate limiting with proper trust proxy configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  // Only trust proxy when in production (Heroku)
  trustProxy: process.env.NODE_ENV === 'production'
});
app.use('/api', limiter);

// IP capture middleware
app.use((req, res, next) => {
  req.userIP = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               req.ip;
  
  if (req.userIP === '::1') req.userIP = '127.0.0.1';
  next();
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Logging middleware for debugging validation
app.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/api/annotations') {
    console.log('Annotation submission received:', {
      user_id: req.body.user_id,
      device_fingerprint: req.body.device_fingerprint,
      user_ip: req.userIP,
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// API routes
app.use('/api', apiRoutes);

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Annotation tool route
app.get('/annotate', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/annotate.html'));
});

// Verification tool route
app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/verify.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});