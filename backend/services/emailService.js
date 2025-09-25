const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Generate a secure random token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate expiration time (15 minutes from now)
  generateTokenExpiration() {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 15);
    return expiration;
  }

  // Send verification email
  async sendVerificationEmail(email, firstName, verificationToken) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: `"Poker Signup" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Verify Your Email Address - Poker Signup',
      html: this.getVerificationEmailTemplate(firstName, verificationUrl),
      text: this.getVerificationEmailText(firstName, verificationUrl)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }
  }

  // HTML email template
  getVerificationEmailTemplate(firstName, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .button:hover { background-color: #2980b9; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Poker Signup!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName || 'there'}!</h2>
          <p>Thank you for registering with Poker Signup. To complete your registration and start playing, please verify your email address by clicking the button below:</p>
          
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </p>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 3px;">${verificationUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong> This verification link will expire in 15 minutes for security reasons. If it expires, you can request a new verification email from the login page.
          </div>
          
          <p>If you didn't create an account with Poker Signup, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>This email was sent by Poker Signup. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  // Plain text email template
  getVerificationEmailText(firstName, verificationUrl) {
    return `
Welcome to Poker Signup!

Hi ${firstName || 'there'}!

Thank you for registering with Poker Signup. To complete your registration and start playing, please verify your email address by visiting this link:

${verificationUrl}

IMPORTANT: This verification link will expire in 15 minutes for security reasons. If it expires, you can request a new verification email from the login page.

If you didn't create an account with Poker Signup, you can safely ignore this email.

Best regards,
The Poker Signup Team
    `.trim();
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection successful');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
