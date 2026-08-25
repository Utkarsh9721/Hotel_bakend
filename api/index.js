// backend/api/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from '../config/passport.js';
import authRoutes from '../routes/authRoutes.js';
import bookingRoutes from '../routes/bookingRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import contactRoutes from '../routes/contactRoutes.js';

dotenv.config();

const app = express();

console.log('🚀 Hotel RAGHAV Backend API on Vercel...');

// CORS
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.includes('vercel.app') || origin.includes('localhost')) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (memory store for serverless)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/api/health', (req, res) => {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    res.json({
        status: 'OK',
        message: 'Backend API is running on Vercel',
        timestamp: new Date().toISOString(),
        mongodb: mongoStatus,
        env: process.env.NODE_ENV || 'development'
    });
});

// ✅ FIXED: MongoDB connection for serverless
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb) {
        console.log('✅ Using cached MongoDB connection');
        return cachedDb;
    }

    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MONGO_URI is not defined');
        }

        console.log('🔗 Connecting to MongoDB...');

        // ✅ Use these options for serverless
        const options = {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            family: 4, // Use IPv4
            maxPoolSize: 1,
            minPoolSize: 1
        };

        const db = await mongoose.connect(uri, options);
        cachedDb = db;
        console.log('✅ MongoDB connected successfully');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
};

// Connect to DB for each request (with caching)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('❌ DB connection error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.url}`
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// Root route for testing
app.get('/', (req, res) => {
    res.json({
        message: 'Hotel RAGHAV Backend API',
        status: 'Running',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth',
            bookings: '/api/bookings'
        }
    });
});
export default app;
