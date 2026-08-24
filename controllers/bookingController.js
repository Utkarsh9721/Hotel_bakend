import mongoose from 'mongoose';
import EmailService from '../utils/emailService.js';

// In-memory storage for demo (replace with MongoDB later)
let bookings = [];
let bookingCounter = 0;

export const createBooking = async (req, res) => {
    try {
        const {
            roomType,
            guests,
            checkIn,
            checkOut,
            specialRequests,
            totalPrice,
            nights,
            firstName,
            lastName,
            email,
            phone,
            isGuest,
            userId
        } = req.body;

        console.log('📝 Booking Data Received:', req.body);

        // Validate required fields
        const requiredFields = ['roomType', 'guests', 'checkIn', 'checkOut', 'totalPrice', 'firstName', 'lastName', 'email', 'phone'];
        const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field] === '');

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                errors: missingFields.map(f => `${f} is required`)
            });
        }

        // Generate booking reference
        bookingCounter++;
        const bookingRef = `RAG-${String(bookingCounter).padStart(4, '0')}`;
        const bookingDate = new Date().toISOString();

        // Create booking object
        const booking = {
            id: bookingCounter,
            bookingReference: bookingRef,
            roomType,
            guests: parseInt(guests),
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            totalPrice: parseFloat(totalPrice),
            nights: parseInt(nights) || 0,
            bookingStatus: 'pending',
            paymentMethod: 'cash',
            paymentStatus: 'pending',
            guestDetails: {
                firstName,
                lastName: lastName || 'Unknown',
                email,
                phone: phone || 'Not provided',
                specialRequests: specialRequests || 'None'
            },
            adminActions: [{
                action: 'created',
                note: `Booking created ${isGuest ? 'as guest' : 'by registered user'}`,
                performedAt: new Date()
            }],
            createdAt: new Date()
        };

        // Store booking (in-memory for demo)
        bookings.push(booking);
        console.log('✅ Booking created:', booking.bookingReference);

        // Prepare email data
        const emailData = {
            ...booking,
            guestDetails: booking.guestDetails,
            bookingReference: booking.bookingReference
        };

        // Send emails
        let adminEmailSent = false;
        let customerEmailSent = false;

        try {
            console.log('📧 Attempting to send booking email to admin...');
            adminEmailSent = await EmailService.sendBookingNotificationToAdmin(emailData);
            if (adminEmailSent) {
                console.log('✅ Admin booking email sent successfully');
            } else {
                console.log('⚠️ Admin booking email failed but continuing');
            }
        } catch (emailError) {
            console.error('❌ Failed to send admin email:', emailError.message);
        }

        try {
            console.log('📧 Attempting to send customer confirmation email...');
            customerEmailSent = await EmailService.sendBookingConfirmationToCustomer(emailData);
            if (customerEmailSent) {
                console.log('✅ Customer confirmation email sent successfully');
            } else {
                console.log('⚠️ Customer confirmation email failed but continuing');
            }
        } catch (emailError) {
            console.error('❌ Failed to send customer email:', emailError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                id: booking.id,
                reference: booking.bookingReference,
                status: booking.bookingStatus,
                adminEmailSent,
                customerEmailSent
            }
        });
    } catch (error) {
        console.error('❌ Booking creation error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create booking'
        });
    }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
    res.json({
        success: true,
        count: bookings.length,
        bookings: bookings
    });
};

// Get booking by ID
export const getBookingById = async (req, res) => {
    const booking = bookings.find(b => b.id === parseInt(req.params.id));
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }
    res.json({
        success: true,
        booking
    });
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
    const booking = bookings.find(b => b.id === parseInt(req.params.id));
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }
    booking.bookingStatus = req.body.status || booking.bookingStatus;
    res.json({
        success: true,
        message: 'Booking status updated',
        booking
    });
};

// Get booking stats
export const getBookingStats = async (req, res) => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.bookingStatus === 'pending').length;
    const confirmed = bookings.filter(b => b.bookingStatus === 'confirmed').length;
    const cancelled = bookings.filter(b => b.bookingStatus === 'cancelled').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
        success: true,
        stats: {
            total,
            pending,
            confirmed,
            cancelled,
            totalRevenue
        }
    });
};

// Get my bookings (user)
export const getMyBookings = async (req, res) => {
    // For demo, return all bookings
    res.json({
        success: true,
        bookings: bookings
    });
};

// Cancel booking
export const cancelBooking = async (req, res) => {
    const booking = bookings.find(b => b.id === parseInt(req.params.id));
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }
    booking.bookingStatus = 'cancelled';
    booking.cancelledAt = new Date();
    res.json({
        success: true,
        message: 'Booking cancelled',
        booking
    });
};

// Add contact history
export const addContactHistory = async (req, res) => {
    const booking = bookings.find(b => b.id === parseInt(req.params.id));
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }
    res.json({
        success: true,
        message: 'Contact history added'
    });
};
