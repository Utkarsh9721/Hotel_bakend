import EmailService from '../utils/emailService.js';

export const submitContact = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        console.log('📝 Contact Form Submission:', { name, email, subject });

        // Validate required fields
        if (!name || !email || !message) {
            console.log('❌ Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Name, email, and message are required'
            });
        }

        // Validate email
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format:', email);
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Prepare contact data for email
        const contactData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone ? phone.trim() : 'Not provided',
            subject: subject || 'General Question',
            message: message.trim(),
            createdAt: new Date()
        };

        console.log('📧 Attempting to send email to admin...');
        console.log('📧 Contact data:', JSON.stringify(contactData, null, 2));

        // Send email to admin
        try {
            const result = await EmailService.sendContactNotificationToAdmin(contactData);
            console.log('📧 Email send result:', result);
        } catch (emailError) {
            console.error('❌ Email error:', emailError.message);
            console.error('❌ Full email error:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again later.'
            });
        }

        console.log('✅ Contact form processed successfully');
        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully! We will get back to you soon.'
        });
    } catch (error) {
        console.error('❌ Contact submission error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to send message. Please try again.'
        });
    }
};
