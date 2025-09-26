# Hostinger Migration Plan

## Current Architecture
- Frontend: Angular (localhost:4200)
- Backend: Node.js/Express (localhost:3333)
- Database: Local MySQL
- Email: Hostinger SMTP

## Recommended Approach: Hybrid Deployment

### Frontend → Hostinger Static Hosting
1. **Build Angular for Production**
   ```bash
   ng build --configuration production
   ```

2. **Configure for Static Hosting**
   - Update `angular.json` for static hosting
   - Configure routing for client-side navigation
   - Update API endpoints to point to production backend

3. **Deploy to Hostinger**
   - Upload `dist/` folder contents to `public_html/`
   - Configure `.htaccess` for Angular routing

### Backend → Node.js Hosting Service
**Recommended Services:**
- **Railway** (Easy, good free tier)
- **Render** (Simple deployment)
- **DigitalOcean App Platform**
- **Heroku** (More expensive)

**Steps:**
1. Create account on chosen service
2. Connect GitHub repository
3. Configure environment variables
4. Deploy automatically on git push

### Database Options
**Option 1: Hostinger MySQL** (if available)
- Export current database
- Import to Hostinger MySQL
- Update connection string

**Option 2: External Database**
- **PlanetScale** (MySQL-compatible, free tier)
- **Railway PostgreSQL** (if switching to PostgreSQL)
- **MongoDB Atlas** (if switching to MongoDB)

## Migration Checklist

### Phase 1: Frontend Preparation
- [ ] Build Angular app for production
- [ ] Update API endpoints to production URLs
- [ ] Test static build locally
- [ ] Create `.htaccess` for Angular routing
- [ ] Prepare deployment package

### Phase 2: Backend Deployment
- [ ] Choose Node.js hosting service
- [ ] Set up repository connection
- [ ] Configure environment variables
- [ ] Test backend deployment
- [ ] Update CORS settings for production domain

### Phase 3: Database Migration
- [ ] Export current database
- [ ] Set up production database
- [ ] Import data
- [ ] Update connection strings
- [ ] Test database connectivity

### Phase 4: Email Configuration
- [ ] Verify Hostinger SMTP settings
- [ ] Test email sending from production
- [ ] Update email templates with production URLs

### Phase 5: DNS and Domain
- [ ] Point domain to Hostinger
- [ ] Configure SSL certificates
- [ ] Test all functionality
- [ ] Set up monitoring

## Environment Variables for Production

### Backend (.env)
```bash
NODE_ENV=production
PORT=3333
DB_HOST=your_production_db_host
DB_USERNAME=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=poker_signup

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=info@kyzereyeemporium.com
SMTP_PASS=your_email_password
SMTP_FROM=info@kyzereyeemporium.com

FRONTEND_URL=https://yourdomain.com
```

### Frontend (environment.prod.ts)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.com/api'
};
```

## Cost Estimate
- **Hostinger Premier**: $2.99-4.99/month (frontend hosting)
- **Railway/Render**: $5-10/month (backend hosting)
- **Database**: Free tier available on most services
- **Total**: ~$8-15/month

## Timeline
- **Week 1**: Frontend preparation and static hosting setup
- **Week 2**: Backend deployment and testing
- **Week 3**: Database migration and integration
- **Week 4**: Testing, DNS setup, and go-live

## Next Steps
1. Choose your preferred backend hosting service
2. Start with frontend static deployment
3. Set up backend hosting
4. Migrate database
5. Test everything thoroughly
6. Update DNS and go live
