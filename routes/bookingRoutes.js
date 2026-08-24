import express from 'express';
import {
    createBooking,
    getAllBookings,
    getBookingById,
    updateBookingStatus,
    getBookingStats,
    getMyBookings,
    cancelBooking,
    addContactHistory
} from '../controllers/bookingController.js';

const router = express.Router();

// Public routes
router.post('/create', createBooking);

// Admin routes (will add auth later)
router.get('/all', getAllBookings);
router.get('/stats', getBookingStats);
router.get('/:id', getBookingById);
router.put('/:id/status', updateBookingStatus);
router.post('/:id/contact', addContactHistory);

// User routes
router.get('/my-bookings', getMyBookings);
router.put('/:id/cancel', cancelBooking);

export default router;
