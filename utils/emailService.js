import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
    constructor() {
        console.log('📧 Initializing Email Service...');
        console.log('📧 SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Missing');
        console.log('📧 SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Missing');
        console.log('📧 ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'raghavhotel7@gmail.com');
        
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service connected successfully');
        } catch (error) {
            console.error('❌ Email service connection failed:', error.message);
        }
    }

    async sendContactNotificationToAdmin(contactData) {
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'raghavhotel7@gmail.com';
            
            console.log('📧 Sending contact email to:', adminEmail);
            
            const mailOptions = {
                from: `"Hotel RAGHAV" <${process.env.SMTP_USER}>`,
                to: adminEmail,
                replyTo: contactData.email,
                subject: `📩 New Contact Form Message - ${contactData.subject}`,
                html: this.getContactEmailTemplate(contactData),
                text: `Name: ${contactData.name}\nEmail: ${contactData.email}\nPhone: ${contactData.phone || 'N/A'}\nMessage: ${contactData.message}`
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent! Message ID:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Email send error:', error.message);
            return false;
        }
    }

    async sendBookingNotificationToAdmin(bookingData) {
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'raghavhotel7@gmail.com';
            
            console.log('📧 Sending booking email to:', adminEmail);
            console.log('📧 Booking reference:', bookingData.bookingReference);
            
            const mailOptions = {
                from: `"Hotel RAGHAV" <${process.env.SMTP_USER}>`,
                to: adminEmail,
                subject: `🔔 New Booking Request - ${bookingData.bookingReference || 'N/A'}`,
                html: this.getBookingEmailTemplate(bookingData),
                text: `New Booking Request\nReference: ${bookingData.bookingReference}\nGuest: ${bookingData.guestDetails?.firstName} ${bookingData.guestDetails?.lastName}\nEmail: ${bookingData.guestDetails?.email}\nPhone: ${bookingData.guestDetails?.phone}\nRoom: ${bookingData.roomType}\nCheck-in: ${bookingData.checkIn}\nCheck-out: ${bookingData.checkOut}\nTotal: ₹${bookingData.totalPrice}`
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Booking email sent! Message ID:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Booking email error:', error.message);
            return false;
        }
    }

    async sendBookingConfirmationToCustomer(bookingData) {
        try {
            const customerEmail = bookingData.guestDetails?.email;
            
            if (!customerEmail) {
                console.log('⚠️ No customer email provided, skipping');
                return false;
            }
            
            console.log('📧 Sending confirmation email to customer:', customerEmail);
            
            const mailOptions = {
                from: `"Hotel RAGHAV" <${process.env.SMTP_USER}>`,
                to: customerEmail,
                subject: `✅ Booking Request Received - ${bookingData.bookingReference || 'N/A'}`,
                html: this.getCustomerBookingEmailTemplate(bookingData),
                text: `Booking Request Received\nReference: ${bookingData.bookingReference}\nThank you for choosing Hotel RAGHAV!`
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Customer email sent! Message ID:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Customer email error:', error.message);
            return false;
        }
    }

    getContactEmailTemplate(contact) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #c0392b; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .details { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
                    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .message-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #c0392b; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏨 Hotel RAGHAV</h1>
                        <h2>📩 New Contact Form Message</h2>
                    </div>
                    <div class="content">
                        <p>A new message has been submitted through the contact form.</p>
                        <div class="details">
                            <h3>📋 Sender Details</h3>
                            <div class="row"><span><strong>Name:</strong></span><span>${contact.name}</span></div>
                            <div class="row"><span><strong>Email:</strong></span><span>${contact.email}</span></div>
                            ${contact.phone ? `<div class="row"><span><strong>Phone:</strong></span><span>${contact.phone}</span></div>` : ''}
                            <div class="row"><span><strong>Subject:</strong></span><span>${contact.subject}</span></div>
                        </div>
                        <div class="details">
                            <h3>💬 Message</h3>
                            <div class="message-box"><p>${contact.message}</p></div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Hotel RAGHAV - ${new Date().getFullYear()}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    getBookingEmailTemplate(booking) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .details { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
                    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏨 Hotel RAGHAV</h1>
                        <h2>🔔 New Booking Request</h2>
                    </div>
                    <div class="content">
                        <p>A new booking request has been received.</p>
                        <div class="details">
                            <h3>📋 Booking Details</h3>
                            <div class="row"><span><strong>Reference:</strong></span><span>${booking.bookingReference}</span></div>
                            <div class="row"><span><strong>Room Type:</strong></span><span>${booking.roomType?.toUpperCase()}</span></div>
                            <div class="row"><span><strong>Guests:</strong></span><span>${booking.guests}</span></div>
                            <div class="row"><span><strong>Check-in:</strong></span><span>${new Date(booking.checkIn).toLocaleDateString()}</span></div>
                            <div class="row"><span><strong>Check-out:</strong></span><span>${new Date(booking.checkOut).toLocaleDateString()}</span></div>
                            <div class="row"><span><strong>Total:</strong></span><span><strong>₹${booking.totalPrice}</strong></span></div>
                        </div>
                        <div class="details">
                            <h3>👤 Guest Information</h3>
                            <div class="row"><span><strong>Name:</strong></span><span>${booking.guestDetails.firstName} ${booking.guestDetails.lastName}</span></div>
                            <div class="row"><span><strong>Email:</strong></span><span>${booking.guestDetails.email}</span></div>
                            <div class="row"><span><strong>Phone:</strong></span><span>${booking.guestDetails.phone}</span></div>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Hotel RAGHAV - ${new Date().getFullYear()}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    getCustomerBookingEmailTemplate(booking) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .details { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
                    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏨 Hotel RAGHAV</h1>
                        <h2>✅ Booking Request Received</h2>
                    </div>
                    <div class="content">
                        <h3>Hello ${booking.guestDetails.firstName}! 🎉</h3>
                        <p>Thank you for choosing Hotel RAGHAV. Your booking request has been received.</p>
                        <div class="details">
                            <h3>📋 Booking Details</h3>
                            <div class="row"><span><strong>Reference:</strong></span><span>${booking.bookingReference}</span></div>
                            <div class="row"><span><strong>Check-in:</strong></span><span>${new Date(booking.checkIn).toLocaleDateString()}</span></div>
                            <div class="row"><span><strong>Check-out:</strong></span><span>${new Date(booking.checkOut).toLocaleDateString()}</span></div>
                            <div class="row"><span><strong>Total:</strong></span><span><strong>₹${booking.totalPrice}</strong></span></div>
                        </div>
                        <p>We will contact you shortly to confirm your booking.</p>
                        <p>📞 +91 9335424144</p>
                        <p>✉️ raghavhotel7@gmail.com</p>
                    </div>
                    <div class="footer">
                        <p>Thank you for choosing Hotel RAGHAV!</p>
                        <p>${new Date().getFullYear()} Hotel RAGHAV. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

export default new EmailService();
