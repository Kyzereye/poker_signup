# Email Verification Configuration

## Environment Variables Required

Add these environment variables to your `.env` file in the backend directory:

```bash
# Database Configuration (existing)
DB_HOST=localhost
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=your_database_name

# Server Configuration (existing)
PORT=3333

# Email Configuration (NEW - for nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# Frontend URL (NEW - for verification links)
FRONTEND_URL=http://localhost:4200
```

## Email Provider Setup

### Gmail Setup (Recommended)
1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for this application
3. Use the app password as `SMTP_PASS`
4. Set `SMTP_USER` to your Gmail address

### Outlook/Hotmail Setup
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Yahoo Setup
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### Custom SMTP Server
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_SECURE=false
```

## Database Setup

Run the SQL script to add email verification fields:

```sql
-- Run this in your MySQL database
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN verification_token VARCHAR(255) NULL,
ADD COLUMN verification_token_expires DATETIME NULL;

CREATE INDEX idx_verification_token ON users(verification_token);

-- Update existing users to be email_verified = true
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL;
```

## Testing

1. Start your backend server
2. Register a new user
3. Check your email for the verification link
4. Click the link to verify your account
5. Try logging in

## Token Expiration

- Verification tokens expire after **15 minutes**
- Users can request a new verification email if the token expires
- Tokens are automatically cleaned up when users verify their email

## Security Features

- Secure random token generation
- Token expiration for security
- Generic error messages to prevent email enumeration
- Rate limiting recommended for production
