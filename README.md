# Poker Signup Application 🃏

A full-stack web application for managing poker game signups with real-time player lists and day-of-game registration.

## 🚀 Features

### Core Functionality
- **Game Signup System** - Sign up for poker games on the day of play
- **Player List Management** - View who's signed up for each game
- **Real-time Updates** - Refresh player lists instantly
- **Duplicate Prevention** - Prevents multiple signups for the same game
- **Day-of-Game Only** - Users can only sign up on the actual game day
- **Role-Based Access** - Player, Dealer, and Admin roles with different permissions
- **Venue Management** - Add, edit, and delete poker venues
- **Game Management** - Create and manage recurring poker games
- **User Management** - Complete user administration with add, edit, delete, search, and sort
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

### Technical Features
- **RESTful API** - Clean backend architecture with Express.js
- **MySQL Database** - Reliable data storage with proper indexing
- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Comprehensive error management and user feedback
- **Code Optimization** - Efficient memory management and performance

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
- **users** - User accounts and authentication
- **locations** - Poker game venues
- **games** - Recurring poker games (weekly schedule)
- **user_game_signups** - Player signups for specific games
- **user_features** - Additional user profile information including roles

### Key Relationships
- Games belong to locations
- Signups link users to games
- Composite primary key on user_game_signups (user_id, game_id)
- User roles stored in user_features table

### Role System
- **Player** (default) - Can sign up for games and view player lists
- **Dealer** - Additional permissions for game management (future feature)
- **Admin** - Full system access including admin panel
- Roles are stored as ENUM in user_features.role column
- New users automatically get 'player' role upon registration

## 🔧 API Endpoints

### Authentication
- `POST /login_routes/login` - User login
- `POST /register_routes/register` - User registration

### Game Management
- `GET /user_routes/get_all_locations` - Get all venues
- `GET /venue_routes/get_venue_data/:locationId` - Get games for a venue
- `GET /user_routes/get_game_details/:gameId` - Get specific game details
- `GET /user_routes/get_player_signups/:gameId` - Get players signed up for a game

### Venue Management (Admin)
- `GET /venue_routes/locations` - Get all venues
- `POST /venue_routes/locations` - Create new venue
- `PUT /venue_routes/locations/:id` - Update venue
- `DELETE /venue_routes/locations/:id` - Delete venue (with safety checks)

### Game Management (Admin)
- `GET /venue_routes/games` - Get all games with venue details
- `POST /venue_routes/games` - Create new game
- `PUT /venue_routes/games/:id` - Update game
- `DELETE /venue_routes/games/:id` - Delete game (with safety checks)

### User Management (Admin)
- `GET /admin_routes/all_users` - Get all users for management
- `POST /admin_routes/create_user` - Create new user with password hashing
- `PUT /admin_routes/update_user/:userId` - Update user information and roles
- `DELETE /admin_routes/delete_user/:userId` - Delete user (with safety checks)

### User Actions
- `POST /user_routes/get_user_data` - Get current user data
- `POST /user_routes/game_sign_up` - Sign up for a game
- `PUT /user_routes/update_profile` - Update user profile information

### Role Management
- `GET /user_routes/get_user_role/:userId` - Get user's role
- `GET /user_routes/get_all_roles` - Get all available roles
- `PUT /user_routes/update_user_role` - Update user role (admin only)

## 🎮 Usage

### For Players
1. **Register/Login** - Create an account or sign in
2. **Select Location** - Choose a poker venue
3. **View Games** - See available games for today
4. **Sign Up** - Click to sign up for a game
5. **View List** - See who else is signed up

### For Administrators
1. **Admin Dashboard** - Access comprehensive admin panel
2. **Manage Venues** - Add, edit, and delete poker locations with real-time search
3. **Schedule Games** - Create and manage recurring poker games
4. **User Management** - Complete user administration with add, edit, delete, search, and sort
5. **Role Management** - Assign and change user roles (Player, Dealer, Admin)
6. **Search & Sort** - Advanced filtering and sorting capabilities
7. **Safety Features** - Confirmation dialogs and data integrity checks

## 🎛️ Admin Features

### Venue & Game Management
- **Real-time Search** - Filter venues and games as you type
- **Smart Sorting** - Sort by venue name, game day, or start time
- **CRUD Operations** - Full create, read, update, delete functionality
- **Data Validation** - Form validation with user-friendly error messages
- **Safety Checks** - Prevents deletion of venues with associated games
- **Confirmation Dialogs** - Safe delete operations with user confirmation

### User Management
- **Complete CRUD Operations** - Add, view, edit, and delete users
- **Real-time Search** - Filter users by username, email, name, or role
- **Smart Sorting** - Sort by any column with intuitive toggle behavior
- **Role Management** - Assign and change user roles with visual badges
- **Password Management** - Secure password handling with hashing
- **Data Validation** - Form validation with user-friendly error messages
- **Safety Checks** - Prevents deletion of users with active signups

### Admin Dashboard
- **User Statistics** - View total users and system information
- **Role Management** - Manage user roles (Player, Dealer, Admin)
- **Quick Actions** - Easy access to venue, game, and user management
- **Responsive Design** - Works on all screen sizes

## 🚨 Error Handling

The application includes comprehensive error handling:
- **409 Conflict** - User already signed up for game
- **404 Not Found** - Game or location not found
- **500 Server Error** - Database or server issues
- **User-friendly dialogs** - Clear error messages with actions
- **Data Integrity** - Prevents orphaned data with foreign key constraints

## 🔒 Security Features

- **Input validation** - Server-side data validation
- **SQL injection protection** - Parameterized queries
- **Error sanitization** - Safe error message display
- **Route protection** - Authentication guards

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
