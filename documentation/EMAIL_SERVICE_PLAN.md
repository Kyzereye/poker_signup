# Email Service Implementation Plan - Password Reset Functionality

## Overview
This plan outlines the implementation of an email service to enable password reset functionality for users.

## Current State
- No email service configured
- No password reset functionality
- Users cannot recover accounts if they forget passwords

## Implementation Phases

---

## **PHASE 1: Email Service Setup**

### 1.1 Choose Email Service Provider
**Options:**
- **Nodemailer with SMTP** (Gmail, Outlook, custom SMTP) - Free/cheap, good for development
- **SendGrid** - Free tier (100 emails/day), reliable, easy setup
- **Mailgun** - Free tier (5,000 emails/month), developer-friendly
- **AWS SES** - Very cheap, scalable, requires AWS account
- **Resend** - Modern API, good free tier

**Recommendation**: Start with **Nodemailer + Gmail SMTP** for development, then move to **SendGrid** or **Resend** for production.

### 1.2 Install Email Package
**Backend**: Install nodemailer
```bash
cd backend
npm install nodemailer
```

### 1.3 Create Email Service Module
**File**: `backend/services/email.service.js`

**Purpose**: Centralize email sending logic

**Key Functions**:
- `sendPasswordResetEmail(email, resetToken, resetUrl)` - Send password reset email
- `sendEmailVerificationEmail(email, verificationToken, verificationUrl)` - For future use
- `sendWelcomeEmail(email, username)` - For future use
- `sendEmail(to, subject, html, text)` - Generic email sender

**Configuration**:
- SMTP settings from environment variables
- Email templates (HTML and plain text)
- From address configuration

### 1.4 Configure Environment Variables
**File**: `backend/.env`

**Add**:
```
# Email Configuration
EMAIL_SERVICE=gmail  # or 'sendgrid', 'smtp', etc.
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false  # true for 465, false for other ports
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password  # Gmail app password, not regular password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Poker Signup

# For SendGrid (alternative)
SENDGRID_API_KEY=your_sendgrid_api_key

# For Resend (alternative)
RESEND_API_KEY=your_resend_api_key
```

**Note**: For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an "App Password" (not your regular password)
3. Use the app password in EMAIL_PASSWORD

---

## **PHASE 2: Password Reset Token System**

### 2.1 Create Password Reset Token Table
**File**: `sql/password_reset_tokens.sql` (or add to existing schema)

**Table Structure**:
```sql
CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

**Purpose**: Store password reset tokens with expiration and usage tracking

### 2.2 Create Password Reset Token Utility
**File**: `backend/utils/passwordReset.js`

**Key Functions**:
- `generateResetToken()` - Generate secure random token
- `createResetToken(userId)` - Create token in database with expiration
- `validateResetToken(token)` - Check if token exists, not expired, not used
- `markTokenAsUsed(token)` - Mark token as used after password reset
- `cleanupExpiredTokens()` - Remove expired tokens (can be scheduled job)

**Token Expiry**: 1 hour (configurable)

---

## **PHASE 3: Backend API Endpoints**

### 3.1 Forgot Password Endpoint
**File**: `backend/routes/auth_routes.js` (new file) or add to `login_routes.js`

**Endpoint**: `POST /api/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Implementation**:
1. Validate email format
2. Check if user exists (don't reveal if email doesn't exist - security)
3. Generate reset token
4. Store token in database with expiration
5. Send password reset email with token link
6. Return success message (always return success, even if email doesn't exist)

**Response**:
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Security**: Always return same message regardless of whether email exists (prevents email enumeration)

### 3.2 Reset Password Endpoint
**File**: `backend/routes/auth_routes.js` or `login_routes.js`

**Endpoint**: `POST /api/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset_token_here",
  "newPassword": "new_secure_password"
}
```

**Implementation**:
1. Validate token (exists, not expired, not used)
2. Validate new password (meet requirements)
3. Hash new password
4. Update user password in database
5. Mark token as used
6. Optionally invalidate all user sessions (if implementing session management)
7. Return success

**Response**:
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Error Responses**:
- 400: Invalid or expired token
- 400: Password doesn't meet requirements
- 404: Token not found

### 3.3 Verify Reset Token Endpoint (Optional)
**Endpoint**: `GET /api/auth/verify-reset-token/:token`

**Purpose**: Verify token validity before showing reset password form

**Response**:
```json
{
  "valid": true,
  "message": "Token is valid"
}
```

---

## **PHASE 4: Frontend Implementation**

### 4.1 Create Forgot Password Component
**File**: `frontend/src/app/pages/forgot-password/forgot-password.component.ts`

**Features**:
- Email input field
- Form validation
- Submit button
- Success/error message display
- Link back to login

**Route**: `/forgot-password`

### 4.2 Create Reset Password Component
**File**: `frontend/src/app/pages/reset-password/reset-password.component.ts`

**Features**:
- Token from URL parameter
- New password input (with requirements display)
- Confirm password input
- Form validation
- Submit button
- Success/error message display
- Redirect to login on success

**Route**: `/reset-password/:token`

### 4.3 Create Password Reset Service
**File**: `frontend/src/app/services/password-reset.service.ts`

**Methods**:
- `requestPasswordReset(email: string)` - Call forgot-password endpoint
- `resetPassword(token: string, newPassword: string)` - Call reset-password endpoint
- `verifyToken(token: string)` - Verify token validity

### 4.4 Update Login Component
**File**: `frontend/src/app/login/login.component.ts`

**Add**:
- "Forgot Password?" link below login form
- Link to `/forgot-password` route

### 4.5 Update Routes
**File**: `frontend/src/app/app.routes.ts`

**Add**:
```typescript
{
  path: 'forgot-password',
  component: ForgotPasswordComponent
},
{
  path: 'reset-password/:token',
  component: ResetPasswordComponent
}
```

---

## **PHASE 5: Email Templates**

### 5.1 Create Email Template Service
**File**: `backend/utils/emailTemplates.js`

**Purpose**: Generate HTML and plain text email templates

**Templates Needed**:
- Password reset email template
- (Future) Email verification template
- (Future) Welcome email template

### 5.2 Password Reset Email Template
**Content**:
- Subject: "Reset Your Password - Poker Signup"
- HTML: Professional email with reset link button
- Plain text: Fallback for email clients that don't support HTML
- Reset link format: `https://yourdomain.com/reset-password?token=TOKEN`
- Expiry notice: "This link expires in 1 hour"
- Security notice: "If you didn't request this, ignore this email"

---

## **PHASE 6: Security Enhancements**

### 6.1 Rate Limiting
**Implementation**: Add rate limiting to forgot-password endpoint
- Limit: 3 requests per email per hour
- Limit: 10 requests per IP per hour
- Prevents abuse and email spam

**Package**: `express-rate-limit`

### 6.2 Token Security
- Use cryptographically secure random tokens (32+ characters)
- Store hashed tokens in database (optional but recommended)
- Single-use tokens (mark as used after password reset)
- Short expiration time (1 hour)

### 6.3 Password Validation
- Enforce same password requirements as registration
- Server-side validation (don't trust client)

---

## **PHASE 7: Testing & Edge Cases**

### 7.1 Test Scenarios
- ✅ Request password reset with valid email
- ✅ Request password reset with invalid email (should still return success)
- ✅ Request password reset multiple times (rate limiting)
- ✅ Reset password with valid token
- ✅ Reset password with expired token
- ✅ Reset password with used token
- ✅ Reset password with invalid token
- ✅ Reset password with weak password (validation)
- ✅ Email delivery (check spam folder)
- ✅ Email link format and token in URL

### 7.2 Edge Cases to Handle
- Token expires while user is filling form
- User requests multiple resets (invalidate old tokens)
- Email service is down (graceful error handling)
- Invalid email format
- User doesn't exist (don't reveal)
- Token already used
- Token doesn't exist

---

## **Implementation Order (Recommended)**

1. **Backend Foundation**
   - Phase 1.2: Install nodemailer
   - Phase 1.3: Create email service
   - Phase 1.4: Configure environment variables
   - Phase 2.1: Create password reset tokens table
   - Phase 2.2: Create password reset token utility
   - Phase 5.1: Create email templates

2. **Backend API**
   - Phase 3.1: Forgot password endpoint
   - Phase 3.2: Reset password endpoint
   - Phase 3.3: Verify token endpoint (optional)
   - Phase 6.1: Add rate limiting

3. **Frontend**
   - Phase 4.3: Create password reset service
   - Phase 4.1: Create forgot password component
   - Phase 4.2: Create reset password component
   - Phase 4.4: Update login component
   - Phase 4.5: Update routes

4. **Polish**
   - Phase 6.2: Token security enhancements
   - Phase 6.3: Password validation
   - Phase 7: Testing

---

## **Files to Create/Modify Summary**

### New Files (Backend)
- `backend/services/email.service.js`
- `backend/utils/passwordReset.js`
- `backend/utils/emailTemplates.js`
- `backend/routes/auth_routes.js` (or add to login_routes.js)
- `sql/password_reset_tokens.sql`

### Modified Files (Backend)
- `backend/package.json` (add nodemailer)
- `backend/.env` (add email configuration)
- `backend/index.js` (add auth routes if new file)

### New Files (Frontend)
- `frontend/src/app/pages/forgot-password/forgot-password.component.ts`
- `frontend/src/app/pages/forgot-password/forgot-password.component.html`
- `frontend/src/app/pages/forgot-password/forgot-password.component.scss`
- `frontend/src/app/pages/reset-password/reset-password.component.ts`
- `frontend/src/app/pages/reset-password/reset-password.component.html`
- `frontend/src/app/pages/reset-password/reset-password.component.scss`
- `frontend/src/app/services/password-reset.service.ts`

### Modified Files (Frontend)
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/login/login.component.ts`
- `frontend/src/app/login/login.component.html`

---

## **Dependencies**

### Backend
- `nodemailer` - Email sending library
- `express-rate-limit` - Rate limiting (optional but recommended)
- `crypto` - Built-in Node.js module for secure token generation

### Frontend
- No new dependencies needed (Angular Material already installed)

---

## **Email Service Provider Setup Guides**

### Gmail SMTP (Development)
1. Enable 2-factor authentication on Gmail account
2. Go to Google Account → Security → App passwords
3. Generate app password for "Mail"
4. Use app password in EMAIL_PASSWORD

### SendGrid (Production)
1. Sign up at sendgrid.com
2. Verify sender identity
3. Create API key
4. Use API key in SENDGRID_API_KEY
5. Update email service to use SendGrid API

### Resend (Production Alternative)
1. Sign up at resend.com
2. Verify domain
3. Create API key
4. Use API key in RESEND_API_KEY
5. Update email service to use Resend API

---

## **Environment Variables Checklist**

### Backend (.env)
```env
# Email Configuration (Gmail SMTP)
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Poker Signup

# Or SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key

# Or Resend
RESEND_API_KEY=your_resend_api_key

# Frontend URL (for reset links)
FRONTEND_URL=http://localhost:4200
```

---

## **Security Best Practices**

1. **Never reveal if email exists** - Always return same success message
2. **Rate limit requests** - Prevent abuse and email spam
3. **Short token expiry** - 1 hour maximum
4. **Single-use tokens** - Mark as used after password reset
5. **Secure token generation** - Use crypto.randomBytes()
6. **HTTPS in production** - Reset links must be over HTTPS
7. **Password requirements** - Enforce same rules as registration
8. **Log password resets** - For security auditing (optional)

---

## **Future Enhancements**

1. **Email verification** - Verify email on registration
2. **Password change** - Allow logged-in users to change password
3. **Account lockout** - Lock account after multiple failed attempts
4. **Two-factor authentication** - Add 2FA via email
5. **Email notifications** - Game reminders, signup confirmations, etc.

---

## **Testing Checklist**

- [ ] Email service sends emails successfully
- [ ] Password reset email received
- [ ] Reset link works correctly
- [ ] Token expires after 1 hour
- [ ] Used tokens cannot be reused
- [ ] Invalid tokens return error
- [ ] Rate limiting works
- [ ] Password requirements enforced
- [ ] Success message shown after reset
- [ ] User can login with new password
- [ ] Old password no longer works
- [ ] Email doesn't reveal if account exists

---

This plan provides a complete roadmap for implementing email service and password reset functionality. Start with Phase 1 (Email Service Setup) and work through each phase systematically.

