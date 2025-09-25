// Quick email test script
require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('SMTP Host:', process.env.SMTP_HOST);
  console.log('SMTP User:', process.env.SMTP_USER);
  console.log('SMTP Port:', process.env.SMTP_PORT);
  
  try {
    // Test connection
    const connectionTest = await emailService.testConnection();
    if (connectionTest) {
      console.log('✅ Email service connection successful!');
      
      // Send a test email
      const result = await emailService.sendVerificationEmail(
        'info@kyzereyeemporium.com', // Send to yourself for testing
        'Test User',
        'test-token-123'
      );
      
      if (result.success) {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', result.messageId);
      } else {
        console.log('❌ Failed to send test email:', result.error);
      }
    } else {
      console.log('❌ Email service connection failed');
    }
  } catch (error) {
    console.error('❌ Email test error:', error.message);
  }
}

testEmail();
