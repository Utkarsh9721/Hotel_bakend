// backend/routes/adminRoutes.js
import express from 'express';

const router = express.Router();

// Get admin stats
router.get('/stats', (req, res) => {
    res.json({
        success: true,
        stats: {
            totalBookings: 0,
            pendingBookings: 0,
            confirmedBookings: 0,
            totalRevenue: 0
        }
    });
});

// Get all bookings
router.get('/bookings', (req, res) => {
    res.json({
        success: true,
        bookings: []
    });
});

// Get booking by ID
router.get('/bookings/:id', (req, res) => {
    res.json({
        success: true,
        booking: {
            id: req.params.id,
            reference: 'BOOK-123'
        }
    });
});

// Update booking status
router.put('/bookings/:id/status', (req, res) => {
    res.json({
        success: true,
        message: 'Booking status updated'
    });
});

// Add contact history
router.post('/bookings/:id/contact', (req, res) => {
    res.json({
        success: true,
        message: 'Contact history added'
    });
});

// Get all users
router.get('/users', (req, res) => {
    res.json({
        success: true,
        users: []
    });
});

// Get user by ID
router.get('/users/:id', (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.params.id,
            email: 'user@example.com'
        }
    });
});

// Update user
router.put('/users/:id', (req, res) => {
    res.json({
        success: true,
        message: 'User updated'
    });
});

// Delete user
router.delete('/users/:id', (req, res) => {
    res.json({
        success: true,
        message: 'User deleted'
    });
});

export default router;