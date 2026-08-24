export const testEmail = async (req, res) => {
    try {
        console.log('✅ Test endpoint hit!');
        
        const testData = {
            name: 'Test User',
            email: 'test@example.com',
            phone: '+91 9876543210',
            subject: 'Test Email',
            message: 'This is a test email from the test endpoint.',
            createdAt: new Date()
        };
        
        // Try to send email
        const EmailService = (await import('../utils/emailService.js')).default;
        const result = await EmailService.sendContactNotificationToAdmin(testData);
        
        res.json({
            success: true,
            message: 'Test email sent!',
            result: result
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
