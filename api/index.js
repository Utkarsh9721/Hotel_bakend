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
    res.json({
        status: 'OK',
        message: 'Backend API is running on Vercel',
        timestamp: new Date().toISOString()
    });
});

// MongoDB connection (cached for serverless)
let cachedDb = null;

const connectDB = async () => {
    if (cachedDb) return cachedDb;
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        cachedDb = db;
        console.log('✅ MongoDB connected');
        return db;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
    }
};

// Connect to DB before each request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error('DB error:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed'
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

export default app;