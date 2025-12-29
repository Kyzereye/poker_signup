const nodemailer = require('nodemailer');

// Create transporter based on email service configuration
function createTransporter() {
  const emailService = process.env.EMAIL_SERVICE || 'smtp';
  
  if (emailService === 'sendgrid') {
    // SendGrid configuration
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }
  
  // Default SMTP configuration (Gmail, custom SMTP, etc.)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587,
    secure: (process.env.SMTP_SECURE || process.env.EMAIL_SECURE) === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD
    }
  });
}

/**
 * Send email using configured transporter
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email body
 * @param {string} text - Plain text email body (optional)
 */
async function sendEmail(to, subject, html, text = null) {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Poker Signup'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version if not provided
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param {string} email - User email address
 * @param {string} resetToken - Password reset token
 */
async function sendPasswordResetEmail(email, resetToken) {
  const { generatePasswordResetEmail } = require('../utils/emailTemplates');
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
  
  const { subject, html, text } = generatePasswordResetEmail(resetUrl);
  
  return await sendEmail(email, subject, html, text);
}

/**
 * Send email verification email (for future use)
 * @param {string} email - User email address
 * @param {string} verificationToken - Email verification token
 */
async function sendEmailVerificationEmail(email, verificationToken) {
  // Placeholder for future implementation
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
  
  const subject = 'Verify Your Email - Poker Signup';
  const html = `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`;
  
  return await sendEmail(email, subject, html);
}

/**
 * Send welcome email (for future use)
 * @param {string} email - User email address
 * @param {string} username - Username
 */
async function sendWelcomeEmail(email, username) {
  // Placeholder for future implementation
  const subject = 'Welcome to Poker Signup!';
  const html = `<p>Welcome ${username}! Thank you for joining Poker Signup.</p>`;
  
  return await sendEmail(email, subject, html);
}

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendWelcomeEmail
};

