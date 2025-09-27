# Poker Signup Application 🃏

A full-stack web application for managing poker game signups with real-time player lists and day-of-game registration.

## 🚀 Features

### Core Functionality
- **Game Signup System** - Sign up for poker games on the day of play
- **Player List Management** - View who's signed up for each game
- **Real-time Updates** - Refresh player lists instantly
- **Duplicate Prevention** - Prevents multiple signups for the same game
- **Day-of-Game Only** - Users can only sign up on the actual game day
- **Email Verification** - Secure user registration with email verification system
- **Role-Based Access** - Player, Dealer, and Admin roles with different permissions
- **Venue Management** - Add, edit, and delete poker venues with separate address fields
- **Game Management** - Create and manage recurring poker games with detailed notes
- **User Management** - Complete user administration with add, edit, delete, search, and sort
- **Role Management** - Dedicated role administration with CRUD operations
- **Admin Dashboard** - Comprehensive admin panel with user and system management

### User Experience
- **Responsive Design** - Works on desktop and mobile devices
- **Material Design UI** - Clean, modern interface using Angular Material
- **Smart Gray-out Logic** - Only shows games available for today
- **Interactive Dialogs** - User-friendly error messages and confirmations
- **Date Display** - Shows formatted dates (e.g., "Thursday Sept 11 at 7:00 PM")
- **Real-time Search** - Instant filtering of venues, games, and users as you type
- **Smart Sorting** - Sortable tables with intuitive toggle behavior
- **Confirmation Dialogs** - Safe delete operations with user confirmation
- **Role Management** - Visual role badges and easy role assignment
- **Email Verification** - User-friendly email verification flow with resend options
- **Form Validation** - Comprehensive form validation with helpful error messages
- **Expandable Notes** - Resizable textarea fields for detailed game information

### Technical Features
- **RESTful API** - Clean backend architecture with Express.js
- **MySQL Database** - Reliable data storage with proper indexing and normalization
- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Comprehensive error management and user feedback
- **Code Optimization** - Efficient memory management and performance
- **Email System** - Nodemailer integration for email verification
- **Database Normalization** - Proper foreign key relationships and role management
- **Token-based Verification** - Secure email verification with expiration

## 🛠️ Tech Stack

### Frontend
- **Angular 17** - Modern web framework
- **TypeScript** - Type-safe development
- **Angular Material** - UI component library
- **RxJS** - Reactive programming
- **SCSS** - Enhanced styling

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **mysql2** - MySQL client for Node.js
- **Nodemailer** - Email sending service
- **bcryptjs** - Password hashing

### Development Tools
- **Git** - Version control
- **npm** - Package management
- **Angular CLI** - Development tooling

## 📁 Project Structure

```
poker_signup/
├── frontend/                 # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Reusable components
│   │   │   ├── pages/        # Page components
│   │   │   │   ├── signup/   # Game signup page
│   │   │   │   └── the-list/ # Player list page
│   │   │   ├── services/     # API services
│   │   │   ├── interceptors/ # HTTP interceptors
│   │   │   └── guards/       # Route guards
│   │   └── environments/     # Environment configs
│   └── package.json
├── backend/                  # Node.js backend application
│   ├── routes/              # API route handlers
│   ├── middleware/          # Custom middleware
│   ├── connection.js        # Database connection
│   └── package.json
├── sql/                     # Database scripts
│   └── sql_queries.sql     # Database schema and data
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kyzereye/poker_signup.git
   cd poker_signup
   ```

2. **Set up the database**
   ```bash
   # Create a MySQL database
   mysql -u root -p
   CREATE DATABASE poker_signup;
   
   # Import the database schema
   mysql -u root -p poker_signup < sql/sql_queries.sql
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Configure environment variables**
   
   Update `frontend/src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3333'
   };
   ```

   Update `backend/connection.js` with your MySQL credentials:
   ```javascript
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'your_username',
     password: 'your_password',
     database: 'poker_signup'
   });
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm start
   ```
   Server will run on `http://localhost:3333`

2. **Start the frontend development server**
   ```bash
   cd frontend
   ng serve
   ```
   Application will run on `http://localhost:4200`

3. **Open your browser**
   Navigate to `http://localhost:4200`

## 📊 Database Schema

### Tables
- **users** - User accounts and authentication with email verification
- **roles** - Normalized role definitions (player, dealer, admin)
- **locations** - Poker game venues with detailed address information
- **games** - Recurring poker games with notes and scheduling
- **user_game_signups** - Player signups for specific games
- **user_features** - Additional user profile information with role references

### Key Relationships
- Games belong to locations
- Signups link users to games
- Composite primary key on user_game_signups (user_id, game_id)
- User roles stored in user_features table

### Role System
- **Player** (default) - Can sign up for games and view player lists
- **Dealer** - Additional permissions for game management
- **Admin** - Full system access including admin panel and role management
- Roles are normalized in a separate `roles` table with foreign key references
- New users automatically get 'player' role upon registration
- Role management includes CRUD operations for creating and managing roles

## 🔧 API Endpoints

### Authentication
- `POST /login_routes/login` - User login with email verification check
- `POST /register_routes/register` - User registration with email verification
- `GET /auth/verify-email/:token` - Email verification endpoint
- `POST /auth/resend-verification` - Resend verification email

### Game Management
- `GET /user_routes/get_all_locations` - Get all venues
- `GET /venue_routes/get_venue_data/:locationId` - Get games for a venue
- `GET /user_routes/get_game_details/:gameId` - Get specific game details
- `GET /user_routes/get_player_signups/:gameId` - Get players signed up for a game

### Venue Management (Admin)
- `GET /venues/locations` - Get all venues
- `POST /venues/locations` - Create new venue with separate address fields
- `PUT /venues/locations/:id` - Update venue
- `DELETE /venues/locations/:id` - Delete venue (with safety checks)

### Game Management (Admin)
- `GET /venues/games` - Get all games with venue details
- `POST /venues/games` - Create new game with notes and scheduling
- `PUT /venues/games/:id` - Update game
- `DELETE /venues/games/:id` - Delete game (with safety checks)

### User Management (Admin)
- `GET /admin_routes/all_users` - Get all users for management
- `POST /admin_routes/create_user` - Create new user with password hashing
- `PUT /admin_routes/update_user/:userId` - Update user information and roles
- `DELETE /admin_routes/delete_user/:userId` - Delete user (with safety checks)

### User Actions
- `POST /user_routes/get_user_data` - Get current user data
- `POST /user_routes/game_sign_up` - Sign up for a game
- `PUT /user_routes/update_profile` - Update user profile information

### Role Management (Admin)
- `GET /admin/roles` - Get all roles with user counts
- `GET /admin/roles/:id` - Get specific role details
- `POST /admin/roles` - Create new role
- `PUT /admin/roles/:id` - Update role
- `DELETE /admin/roles/:id` - Delete role (with safety checks)

## 🎮 Usage

### For Players
1. **Register/Login** - Create an account with email verification or sign in
2. **Verify Email** - Check email and click verification link (if new user)
3. **Select Location** - Choose a poker venue
4. **View Games** - See available games for today
5. **Sign Up** - Click to sign up for a game
6. **View List** - See who else is signed up

### For Administrators
1. **Admin Dashboard** - Access comprehensive admin panel
2. **Manage Venues** - Add, edit, and delete poker locations with separate address fields
3. **Schedule Games** - Create and manage recurring poker games with detailed notes
4. **User Management** - Complete user administration with add, edit, delete, search, and sort
5. **Role Management** - Dedicated role administration with full CRUD operations
6. **Search & Sort** - Advanced filtering and sorting capabilities
7. **Safety Features** - Confirmation dialogs and data integrity checks
8. **Email Verification** - Monitor and manage user email verification status

## 🎛️ Admin Features

### Venue & Game Management
- **Real-time Search** - Filter venues and games as you type
- **Smart Sorting** - Sort by venue name, game day, or start time
- **CRUD Operations** - Full create, read, update, delete functionality
- **Data Validation** - Form validation with user-friendly error messages
- **Safety Checks** - Prevents deletion of venues with associated games
- **Confirmation Dialogs** - Safe delete operations with user confirmation
- **Address Management** - Separate fields for street address, city, state, and ZIP
- **Game Notes** - Expandable notes field with helpful hints for game details

### User Management
- **Complete CRUD Operations** - Add, view, edit, and delete users
- **Real-time Search** - Filter users by username, email, name, or role
- **Smart Sorting** - Sort by any column with intuitive toggle behavior
- **Role Management** - Assign and change user roles with visual badges
- **Password Management** - Secure password handling with hashing
- **Data Validation** - Form validation with user-friendly error messages
- **Safety Checks** - Prevents deletion of users with active signups

### Role Management
- **Complete CRUD Operations** - Create, read, update, and delete roles
- **User Count Tracking** - See how many users are assigned to each role
- **Safety Checks** - Prevents deletion of roles with assigned users
- **Validation** - Role name validation and duplicate prevention

### Admin Dashboard
- **User Statistics** - View total users and system information
- **Role Management** - Dedicated role administration panel
- **Quick Actions** - Easy access to venue, game, user, and role management
- **Responsive Design** - Works on all screen sizes

## 🚨 Error Handling

The application includes comprehensive error handling:
- **409 Conflict** - User already signed up for game
- **404 Not Found** - Game or location not found
- **403 Forbidden** - Email verification required
- **500 Server Error** - Database or server issues
- **User-friendly dialogs** - Clear error messages with actions
- **Data Integrity** - Prevents orphaned data with foreign key constraints
- **Email Verification** - Secure token-based verification with expiration

## 🔒 Security Features

- **Input validation** - Server-side data validation
- **SQL injection protection** - Parameterized queries
- **Error sanitization** - Safe error message display
- **Route protection** - Authentication guards
- **Email verification** - Token-based verification with expiration
- **Password hashing** - Secure password storage with bcryptjs
- **Generic error messages** - Prevents information disclosure

## 🚀 Deployment

### Production Build
```bash
cd frontend
ng build --prod
```

### Environment Configuration
Update `environment.prod.ts` with production API URL:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com'
};
```

### Database Setup
Ensure MySQL is properly configured for production with:
- Proper user permissions
- Database backups
- Connection pooling
- SSL connections (recommended)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Jeff Kyzer** - *Initial work* - [Kyzereye](https://github.com/Kyzereye)

## 🙏 Acknowledgments

- Angular Material for the UI components
- Express.js community for backend best practices
- MySQL documentation for database optimization

## 📞 Support

For support or questions, please open an issue in the GitHub repository.

---

**Happy Poker Playing!** 🃏♠️♥️♣️♦️
