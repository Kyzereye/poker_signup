/**
 * Generate password reset email template
 * @param {string} resetUrl - Password reset URL with token
 * @returns {object} Object containing subject, html, and text
 */
function generatePasswordResetEmail(resetUrl) {
  const subject = 'Reset Your Password - Poker Signup';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
        <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
        
        <p>You requested to reset your password for your Poker Signup account.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          <strong>Important:</strong>
        </p>
        <ul style="color: #666; font-size: 14px;">
          <li>This link will expire in 1 hour</li>
          <li>This link can only be used once</li>
          <li>If you didn't request this password reset, please ignore this email</li>
          <li>Your password will not be changed until you click the link above</li>
        </ul>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Reset Your Password - Poker Signup

You requested to reset your password for your Poker Signup account.

Click the link below to reset your password:
${resetUrl}

Important:
- This link will expire in 1 hour
- This link can only be used once
- If you didn't request this password reset, please ignore this email
- Your password will not be changed until you click the link above

This is an automated message. Please do not reply to this email.
  `;

  return { subject, html, text };
}

/**
 * Generate email verification email template (for future use)
 * @param {string} verificationUrl - Email verification URL with token
 * @returns {object} Object containing subject, html, and text
 */
function generateEmailVerificationEmail(verificationUrl) {
  const subject = 'Verify Your Email - Poker Signup';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h1>Verify Your Email</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
    </body>
    </html>
  `;

  const text = `Verify Your Email\n\nPlease verify your email address by clicking the link: ${verificationUrl}`;

  return { subject, html, text };
}

module.exports = {
  generatePasswordResetEmail,
  generateEmailVerificationEmail
};

