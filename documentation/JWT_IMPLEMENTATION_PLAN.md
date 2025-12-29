# JWT Implementation Plan for Poker Signup Application

## Overview
This plan outlines the step-by-step implementation of JWT (JSON Web Token) authentication to replace the current sessionless authentication system.

## Current State Analysis
- **Backend**: No token generation/validation, routes are unprotected
- **Frontend**: Authentication state stored only in-memory (BehaviorSubjects), lost on refresh
- **Security**: Users can access API endpoints without authentication
- **Persistence**: No way to maintain login state across page refreshes

## Implementation Phases

---

## **PHASE 1: Backend Foundation**

### 1.1 Create JWT Utility Module
**File**: `backend/utils/jwt.js`

**Purpose**: Centralize JWT token generation and verification logic

**Key Functions**:
- `generateToken(userId, email, role)` - Generate access token (short-lived, 15-30 min)
- `generateRefreshToken(userId)` - Generate refresh token (long-lived, 7-30 days)
- `verifyToken(token)` - Verify and decode JWT token
- `decodeToken(token)` - Decode token without verification (for debugging)

**Configuration Needed**:
- `JWT_SECRET` - Secret key for signing tokens (from .env)
- `JWT_ACCESS_EXPIRY` - Access token expiry (e.g., "30m" or "1h")
- `JWT_REFRESH_EXPIRY` - Refresh token expiry (e.g., "7d" or "30d")

---

### 1.2 Create Authentication Middleware
**File**: `backend/middleware/auth.middleware.js`

**Purpose**: Protect routes by verifying JWT tokens

**Key Functions**:
- `authenticateToken(req, res, next)` - Verify JWT token from Authorization header
- `requireAdmin(req, res, next)` - Verify token AND check for admin role
- `requireDealer(req, res, next)` - Verify token AND check for dealer role

**Implementation Details**:
- Extract token from `Authorization: Bearer <token>` header
- Verify token using JWT utility
- Attach user info (userId, email, role) to `req.user`
- Handle token expiration, invalid tokens, missing tokens

---

### 1.3 Update Login Route
**File**: `backend/routes/login_routes.js`

**Changes**:
- After successful password verification, generate access token and refresh token
- Return both tokens in response
- Store refresh token in database (optional but recommended for token revocation)
- Response format:
  ```json
  {
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user_data": {
      "id": 1,
      "username": "jkyzer",
      "email": "user@example.com",
      "role": "admin",
      "first_name": "Jeff",
      "last_name": "Kyzer"
    }
  }
  ```

---

### 1.4 Create Refresh Token Route
**File**: `backend/routes/login_routes.js` (or new `auth_routes.js`)

**Endpoint**: `POST /api/auth/refresh`

**Purpose**: Generate new access token using refresh token

**Implementation**:
- Accept refresh token in request body
- Verify refresh token
- Generate new access token
- Optionally rotate refresh token (security best practice)
- Return new access token

---

### 1.5 Protect API Routes
**Files**: All route files (`user_routes.js`, `admin_routes.js`, `venue_game_routes.js`)

**Changes**:
- Add `authenticateToken` middleware to all protected routes
- Add `requireAdmin` middleware to admin-only routes
- Exclude public routes (login, register, health check)

**Example**:
```javascript
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Protected route
router.get('/get_user_data', authenticateToken, async (req, res) => {
  // req.user contains userId, email, role
});

// Admin-only route
router.get('/all_users', authenticateToken, requireAdmin, async (req, res) => {
  // ...
});
```

---

### 1.6 Update Environment Variables
**File**: `backend/.env`

**Add**:
```
JWT_SECRET=your_super_secret_key_here_min_32_chars
JWT_ACCESS_EXPIRY=30m
JWT_REFRESH_EXPIRY=7d
```

**Note**: Generate a strong random secret for production!

---

## **PHASE 2: Frontend Token Management**

### 2.1 Create Token Storage Service
**File**: `frontend/src/app/services/token.service.ts`

**Purpose**: Manage token storage and retrieval

**Key Methods**:
- `setTokens(accessToken, refreshToken)` - Store tokens in localStorage
- `getAccessToken()` - Retrieve access token
- `getRefreshToken()` - Retrieve refresh token
- `clearTokens()` - Remove tokens (for logout)
- `isTokenExpired(token)` - Check if token is expired (optional)

**Storage Strategy**:
- Store in `localStorage` for persistence across sessions
- Consider `sessionStorage` for more security (tokens cleared on tab close)
- Store as separate keys: `accessToken` and `refreshToken`

---

### 2.2 Update HTTP Interceptor
**File**: `frontend/src/app/interceptors/http.interceptor.ts`

**Changes**:
- Add `Authorization` header to all requests: `Bearer <accessToken>`
- Handle 401 responses (unauthorized):
  - Attempt token refresh using refresh token
  - Retry original request with new token
  - If refresh fails, logout user and redirect to login
- Don't add token to public endpoints (login, register)

**Flow**:
1. Check if route is public
2. If not public, get token from storage and add to headers
3. On 401 response, try refresh
4. If refresh succeeds, retry request
5. If refresh fails, logout and redirect

---

### 2.3 Update Auth Service
**File**: `frontend/src/app/services/auth.service.ts`

**Changes**:
- Store tokens when user logs in
- Check for existing tokens on service initialization
- Decode token to get user info (optional, or fetch from API)
- Clear tokens on logout
- Add method to check if user is authenticated (check token existence and validity)
- Add method to refresh access token

**New Methods**:
- `initializeAuth()` - Check localStorage on app start, restore auth state
- `refreshAccessToken()` - Call refresh endpoint, update tokens
- `isTokenValid()` - Check if token exists and not expired

---

### 2.4 Update Login Service/Component
**File**: `frontend/src/app/services/login.service.ts`
**File**: `frontend/src/app/login/login.component.ts`

**Changes**:
- After successful login, store tokens using TokenService
- Update AuthService with user data AND tokens
- Remove direct user data storage (use tokens instead)

---

### 2.5 Update App Initialization
**File**: `frontend/src/app/app.component.ts`

**Changes**:
- On app start, call `AuthService.initializeAuth()`
- This should check for stored tokens
- If valid token exists, restore user session
- Fetch user data if needed (or decode from token)

---

### 2.6 Update Auth Guard
**File**: `frontend/src/app/auth.guard.ts`

**Changes**:
- Check for valid token (not just in-memory state)
- Verify token is not expired
- If token expired but refresh token exists, attempt refresh
- Only allow route access if valid token exists

---

## **PHASE 3: Token Refresh Strategy**

### 3.1 Implement Token Refresh Logic
**Location**: `frontend/src/app/services/auth.service.ts`

**Strategy Options**:

**Option A: Automatic Refresh (Recommended)**
- Intercept 401 responses in HTTP interceptor
- Automatically call refresh endpoint
- Retry failed request with new token
- User experience: seamless, no interruption

**Option B: Proactive Refresh**
- Check token expiry before making requests
- Refresh token if it's about to expire (e.g., < 5 minutes left)
- More complex but better UX

**Option C: Manual Refresh**
- User must manually refresh when token expires
- Simpler but worse UX

**Recommended**: Option A (Automatic Refresh)

---

### 3.2 Create Refresh Token Endpoint Handler
**Backend**: Already created in Phase 1.4

**Frontend**: Call from AuthService or HTTP Interceptor

---

## **PHASE 4: Logout and Token Revocation**

### 4.1 Update Logout Flow
**Files**: 
- `frontend/src/app/services/auth.service.ts`
- `frontend/src/app/left-sidebar/left-sidebar.component.ts`

**Changes**:
- Clear tokens from storage
- Optionally call backend logout endpoint to invalidate refresh token
- Clear all auth state
- Redirect to login

---

### 4.2 (Optional) Token Revocation Endpoint
**File**: `backend/routes/login_routes.js`

**Endpoint**: `POST /api/auth/logout`

**Purpose**: Invalidate refresh token on server (optional but recommended)

**Implementation**:
- Accept refresh token
- Remove/invalidate refresh token from database
- Prevents token reuse after logout

---

## **PHASE 5: Security Enhancements**

### 5.1 Add Token Expiry Validation
- Frontend: Check token expiry before use
- Backend: JWT library automatically validates expiry

### 5.2 Secure Token Storage
- Consider using httpOnly cookies for refresh tokens (more secure)
- Keep access tokens in memory only (most secure but loses persistence)
- Current plan: localStorage (good balance of security and UX)

### 5.3 Add CORS Configuration
**File**: `backend/index.js`

**Update CORS** to only allow your frontend domain:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));
```

---

## **PHASE 6: Testing & Edge Cases**

### 6.1 Test Scenarios
- ✅ Login generates tokens
- ✅ Protected routes require valid token
- ✅ Invalid token returns 401
- ✅ Expired token triggers refresh
- ✅ Refresh token expiry forces re-login
- ✅ Logout clears tokens
- ✅ Page refresh maintains session
- ✅ Multiple tabs stay in sync (optional)
- ✅ Admin routes check role
- ✅ Token refresh works mid-request

### 6.2 Error Handling
- Token missing → 401
- Token invalid → 401
- Token expired → Attempt refresh
- Refresh token expired → Force re-login
- Network error during refresh → Show error, allow retry

---

## **Implementation Order (Recommended)**

1. **Backend First** (Can test with Postman/curl)
   - Phase 1.1: JWT Utility
   - Phase 1.2: Auth Middleware
   - Phase 1.3: Update Login Route
   - Phase 1.4: Refresh Token Route
   - Phase 1.6: Environment Variables
   - Phase 1.5: Protect Routes (do this last)

2. **Frontend Second**
   - Phase 2.1: Token Storage Service
   - Phase 2.3: Update Auth Service
   - Phase 2.2: Update HTTP Interceptor
   - Phase 2.4: Update Login
   - Phase 2.5: App Initialization
   - Phase 2.6: Update Auth Guard

3. **Polish**
   - Phase 3: Token Refresh
   - Phase 4: Logout
   - Phase 5: Security Enhancements
   - Phase 6: Testing

---

## **Files to Create/Modify Summary**

### New Files (Backend)
- `backend/utils/jwt.js`
- `backend/middleware/auth.middleware.js`

### Modified Files (Backend)
- `backend/routes/login_routes.js`
- `backend/routes/user_routes.js`
- `backend/routes/admin_routes.js`
- `backend/routes/venue_game_routes.js`
- `backend/index.js` (CORS update)
- `backend/.env` (add JWT config)

### New Files (Frontend)
- `frontend/src/app/services/token.service.ts`

### Modified Files (Frontend)
- `frontend/src/app/services/auth.service.ts`
- `frontend/src/app/services/login.service.ts`
- `frontend/src/app/interceptors/http.interceptor.ts`
- `frontend/src/app/auth.guard.ts`
- `frontend/src/app/login/login.component.ts`
- `frontend/src/app/app.component.ts`
- `frontend/src/app/left-sidebar/left-sidebar.component.ts`

---

## **Environment Variables Checklist**

### Backend (.env)
```env
# Database (existing)
DB_HOST=localhost
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=pokerSignup

# Server (existing)
PORT=3333
NODE_ENV=development

# JWT (NEW)
JWT_SECRET=generate_strong_random_secret_min_32_characters
JWT_ACCESS_EXPIRY=30m
JWT_REFRESH_EXPIRY=7d

# CORS (NEW - optional but recommended)
FRONTEND_URL=http://localhost:4200
```

---

## **Dependencies**

### Backend (already installed)
- ✅ `jsonwebtoken` - Already in package.json

### Frontend
- No new dependencies needed (localStorage is built-in)

---

## **Important Considerations**

1. **Token Expiry Times**
   - Access token: 15-30 minutes (short-lived)
   - Refresh token: 7-30 days (long-lived)
   - Balance security vs. user experience

2. **Refresh Token Storage (Backend)**
   - Optional: Store refresh tokens in database
   - Allows token revocation and logout on all devices
   - Adds complexity but improves security

3. **HTTPS in Production**
   - Essential for JWT security
   - Tokens transmitted in headers must be encrypted

4. **Token Payload Size**
   - Keep JWT payload small (only essential user info)
   - Can add more data via API call after authentication

5. **Multiple Tabs/Browsers**
   - localStorage is shared across tabs
   - Logout in one tab should log out in others (requires custom solution or use events)

---

## **Next Steps After JWT Implementation**

Once JWT is working:
1. Add rate limiting to login/refresh endpoints
2. Implement password reset functionality
3. Add email verification
4. Consider refresh token rotation
5. Add audit logging for authentication events

---

## **Questions to Consider**

1. **Refresh Token Storage**: Store in database for revocation, or stateless?
   - Recommendation: Start stateless, add database storage later if needed

2. **Token Expiry**: What times work best for your users?
   - Recommendation: 30min access, 7 days refresh (adjust based on usage)

3. **Logout Strategy**: Invalidate refresh token on logout?
   - Recommendation: Yes, if storing refresh tokens in DB

4. **Multiple Devices**: Allow same user logged in on multiple devices?
   - Current plan: Yes (can enhance later with device tracking)

---

This plan provides a complete roadmap for JWT implementation. Start with Phase 1 (Backend Foundation) and work through each phase systematically.

