// backend/controllers/authController.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Google Auth Callback
export const googleCallback = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
        }

        const token = jwt.sign(
            {
                id: req.user._id,
                email: req.user.email,
                authMethod: req.user.authMethod || 'google'
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth-callback?token=${token}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Google callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`);
    }
};

// ✅ Admin Login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔐 Admin login attempt:', email);

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find admin user
        const user = await User.findOne({
            email: email.toLowerCase(),
            isAdmin: true
        }).select('+password');

        if (!user) {
            console.log('❌ Admin user not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('❌ Invalid admin password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        // Update last login
        await user.updateLastLogin();

        // Generate admin token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                isAdmin: true
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        console.log('✅ Admin login successful:', email);

        res.status(200).json({
            success: true,
            message: 'Admin login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isAdmin: true,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to login as admin'
        });
    }
};