// backend/routes/authRoutes.js
import express from 'express';
import passport from '../config/passport.js';
import { googleCallback, adminLogin } from '../controllers/authController.js';

const router = express.Router();

// Google OAuth
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        accessType: 'offline'
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`,
        session: true
    }),
    googleCallback
);

// ✅ Admin Login
router.post('/admin-login', adminLogin);

// Auth status
router.get('/status', (req, res) => {
    res.json({ isAuthenticated: false });
});

export default router;