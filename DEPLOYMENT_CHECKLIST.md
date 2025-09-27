# Hostinger Deployment Checklist 🚀

## Pre-Deployment Setup

### 1. **Environment Configuration**
- [ ] Update `frontend/src/environments/environment.prod.ts` with your actual domain
- [ ] Update `backend/.env` with Hostinger database credentials
- [ ] Test local production build: `cd frontend && npm run build:prod`

### 2. **Database Setup on Hostinger**
- [ ] Create database on Hostinger (if not already done)
- [ ] Import database schema: `mysql -u kyzereye -p pokerSignup < backend/sql_queries.sql`
- [ ] Verify database connection from Hostinger
- [ ] Test database with sample data
- [ ] Verify email verification tables are created
- [ ] Test role normalization (roles table with foreign keys)

### 3. **File Upload to Hostinger**
- [ ] Upload entire project to Hostinger file manager
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Ensure Node.js is enabled on Hostinger

## Backend Deployment

### 4. **Backend Configuration**
- [ ] Update `backend/.env` for production:
  ```bash
  NODE_ENV=production
  PORT=3333
  DB_PORT=3306
  DB_HOST=localhost
  DB_USERNAME=kyzereye
  DB_PASSWORD=your_hostinger_password
  DB_NAME=pokerSignup
  
  # Email Configuration (Hostinger SMTP)
  SMTP_HOST=smtp.hostinger.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your_email@yourdomain.com
  SMTP_PASS=your_email_password
  SMTP_FROM=your_email@yourdomain.com
  ```
- [ ] Install dependencies: `cd backend && npm install --production`
- [ ] Test backend: `node server.js`
- [ ] Test email functionality with verification emails

### 5. **Backend Startup**
- [ ] Configure Hostinger to run Node.js app
- [ ] Set startup file to `backend/server.js`
- [ ] Verify backend is accessible at `https://yourdomain.com/api`

## Frontend Deployment

### 6. **Frontend Build**
- [ ] Build production version: `cd frontend && npm run build:prod`
- [ ] Upload `frontend/dist/frontend/browser/` contents to public_html
- [ ] Verify all files are uploaded correctly

### 7. **Frontend Configuration**
- [ ] Update `environment.prod.ts` with correct API URL
- [ ] Rebuild if needed: `npm run build:prod`
- [ ] Test frontend at `https://yourdomain.com`

## Post-Deployment Testing

### 8. **Functionality Testing**
- [ ] Test user registration with email verification
- [ ] Test email verification flow
- [ ] Test user login (both verified and unverified users)
- [ ] Test resend verification email functionality
- [ ] Test game signup functionality
- [ ] Test admin panel (if admin user exists)
- [ ] Test venue management (add/edit/delete with address fields)
- [ ] Test game management (add/edit/delete with notes)
- [ ] Test user management (CRUD operations)
- [ ] Test role management (CRUD operations)
- [ ] Test all CRUD operations
- [ ] Test responsive design on mobile

### 9. **Performance & Security**
- [ ] Check page load times
- [ ] Verify HTTPS is working
- [ ] Test error handling
- [ ] Verify database connections are secure
- [ ] Test email verification security (token expiration)
- [ ] Verify password hashing is working
- [ ] Test generic error messages (no information disclosure)

## Troubleshooting

### Common Issues
- **CORS errors**: Check backend CORS configuration
- **Database connection**: Verify credentials and host
- **File permissions**: Ensure proper 755/644 permissions
- **Node.js version**: Ensure Hostinger supports your Node.js version
- **Email not sending**: Check SMTP configuration and credentials
- **Email verification not working**: Verify token generation and expiration
- **Role management errors**: Check database normalization and foreign keys

### Rollback Plan
- [ ] Keep backup of working version
- [ ] Document current database state
- [ ] Have rollback procedure ready

## Hostinger Specific Notes

### File Structure on Hostinger
```
public_html/
├── index.html (from frontend/dist/frontend/browser/)
├── main.js
├── styles.css
└── assets/

backend/ (separate from public_html)
├── server.js
├── package.json
├── .env
└── routes/
```

### Environment Variables
- Backend .env should be in the backend folder
- Frontend environment.prod.ts should point to your domain
- Database credentials should match Hostinger database
- Email SMTP settings must be configured for Hostinger
- Email verification tokens expire in 15 minutes

### Node.js Configuration
- Set startup file to `backend/server.js`
- Ensure port 3333 is available
- Check Node.js version compatibility

## Final Verification
- [ ] All features working in production
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Fast loading times
- [ ] Secure connections (HTTPS)
- [ ] Database operations working
- [ ] Admin functions working
- [ ] Email verification working
- [ ] Role management functioning
- [ ] Venue and game management working
- [ ] User management working
- [ ] All forms and dialogs working properly

---

**Remember**: Test everything thoroughly before going live! 🎯
