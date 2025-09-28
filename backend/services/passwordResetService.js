const nodemailer = require('nodemailer');
const crypto = require('crypto');

class PasswordResetService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Generate a secure password reset token
  generatePasswordResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send password reset email
  async sendPasswordResetEmail(email, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"Poker Signup" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Password - Poker Signup',
      html: this.getPasswordResetEmailTemplate(resetUrl),
      text: this.getPasswordResetEmailText(resetUrl)
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }


  // HTML email template for password reset
  getPasswordResetEmailTemplate(resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .button:hover { background-color: #c0392b; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🃏 Poker Signup</h1>
          <h2>Password Reset Request</h2>
        </div>
        <div class="content">
          <p>You requested to reset your password for your Poker Signup account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <div class="warning">
            <strong>Important:</strong> This link will expire in 15 minutes for security reasons.
          </div>
          <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px; font-family: monospace;">${resetUrl}</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; 2024 Poker Signup. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  // Text email template for password reset
  getPasswordResetEmailText(resetUrl) {
    return `
      Password Reset Request - Poker Signup
      
      You requested to reset your password for your Poker Signup account.
      
      To reset your password, click the following link:
      ${resetUrl}
      
      This link will expire in 15 minutes for security reasons.
      
      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
      
      This is an automated message. Please do not reply to this email.
      
      © 2024 Poker Signup. All rights reserved.
    `;
  }

}

module.exports = PasswordResetService;
