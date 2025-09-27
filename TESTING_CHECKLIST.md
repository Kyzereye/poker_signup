# Poker Signup Application - Manual Testing Checklist

## Pre-Testing Setup
- [ ] Backend server is running on port 3333
- [ ] Frontend application is running on port 4200 (or alternative port)
- [ ] Database is properly initialized with test data
- [ ] Clear browser cache/cookies for fresh testing

## 1. User Registration
### Basic Registration
- [ ] Navigate to registration page
- [ ] Fill in all required fields (username, email, password, first name, last name)
- [ ] Submit registration form
- [ ] Verify success message appears
- [ ] Verify user is redirected to login page
- [ ] Verify new user has 'player' role by default

### Registration Validation
- [ ] Try submitting with empty fields - verify validation errors
- [ ] Try submitting with invalid email format - verify validation error
- [ ] Try submitting with short password - verify validation error
- [ ] Try submitting with existing username - verify error message
- [ ] Try submitting with existing email - verify error message

## 2. User Login
### Successful Login
- [ ] Navigate to login page
- [ ] Enter valid credentials
- [ ] Submit login form
- [ ] Verify successful login
- [ ] Verify redirect to dashboard
- [ ] Verify user role is correctly loaded

### Login Validation
- [ ] Try logging in with invalid username - verify generic error message
- [ ] Try logging in with invalid password - verify generic error message
- [ ] Try logging in with empty fields - verify validation errors
- [ ] Verify error messages are generic for security (not specific about username/password)

## 3. Dashboard Navigation
### Sidebar Menu
- [ ] Verify all menu items are visible for logged-in user
- [ ] Click on each menu item and verify navigation works
- [ ] Verify "The List" menu item is present
- [ ] Verify "Profile" menu item is present
- [ ] Verify "Sign Up" menu item is present
- [ ] Verify "Standings" menu item is present

### Admin Menu (Admin Users Only)
- [ ] Login as admin user
- [ ] Verify "Admin" menu item is visible
- [ ] Click on "Admin" menu item
- [ ] Verify admin dashboard loads correctly
- [ ] Verify admin menu item is NOT visible for non-admin users

## 4. Profile Management
### View Profile
- [ ] Navigate to Profile page
- [ ] Verify user information is displayed correctly
- [ ] Verify username, email, first name, last name are shown
- [ ] Verify role is displayed correctly

### Edit Profile
- [ ] Click "Edit Profile" button
- [ ] Verify edit dialog opens
- [ ] Modify profile information
- [ ] Save changes
- [ ] Verify success message appears
- [ ] Verify changes are reflected in profile view
- [ ] Test cancel functionality

## 5. The List (Player Signups)
### View The List
- [ ] Navigate to "The List" page
- [ ] Verify list of signed-up players is displayed
- [ ] Verify player information is shown correctly
- [ ] Verify game information is displayed
- [ ] Verify date/time formatting is correct (Weekday Month Day at Time format)

### Sign Up for Game
- [ ] Click "Sign Up" button for available game
- [ ] Verify signup is successful
- [ ] Verify success message appears
- [ ] Verify player appears in the list
- [ ] Verify "Sign Up" button changes to "Cancel Signup"

### Cancel Signup
- [ ] Click "Cancel Signup" button
- [ ] Verify cancellation is successful
- [ ] Verify success message appears
- [ ] Verify player is removed from the list
- [ ] Verify "Cancel Signup" button changes back to "Sign Up"

## 6. Admin Dashboard
### Dashboard Overview (Admin Users Only)
- [ ] Login as admin user
- [ ] Navigate to Admin dashboard
- [ ] Verify dashboard loads without errors
- [ ] Verify user statistics are displayed
- [ ] Verify system information is shown
- [ ] Verify quick actions section is present

### User Management
- [ ] Click on "User Management" section
- [ ] Verify list of all users is displayed
- [ ] Verify user details are shown correctly
- [ ] Test role change functionality (if implemented)
- [ ] Verify role changes are saved correctly

### Venue & Game Management
- [ ] Click "Venue & Game Management" button
- [ ] Verify venue management page loads
- [ ] Verify both "Venues" and "Games" tabs are present

### User Management
- [ ] Click "User Management" button
- [ ] Verify user management page loads
- [ ] Verify user list is displayed with all user information
- [ ] Verify search functionality works for users
- [ ] Verify sorting functionality works for all columns

## 7. User Management
### View Users
- [ ] Navigate to User Management page
- [ ] Verify list of users is displayed
- [ ] Verify user information (username, email, first name, last name, role) is shown
- [ ] Verify role badges are displayed with correct colors
- [ ] Verify action buttons (Edit, Delete) are present

### Add User
- [ ] Click "Add User" button
- [ ] Verify add user dialog opens
- [ ] Fill in all required fields (username, email, password, first name, last name, role)
- [ ] Submit form
- [ ] Verify success message appears
- [ ] Verify new user appears in the list
- [ ] Test form validation (empty fields, invalid email, etc.)

### Edit User
- [ ] Click "Edit" button on existing user
- [ ] Verify edit dialog opens with current data
- [ ] Modify user information
- [ ] Test password field (leave blank to keep current password)
- [ ] Change user role
- [ ] Save changes
- [ ] Verify success message appears
- [ ] Verify changes are reflected in the list

### Delete User
- [ ] Click "Delete" button on user
- [ ] Verify confirmation dialog appears
- [ ] Confirm deletion
- [ ] Verify success message appears
- [ ] Verify user is removed from the list
- [ ] Test deletion of user with active signups (should show error)

### User Search & Sort
- [ ] Use search box to filter users by username, email, name, or role
- [ ] Verify real-time filtering works
- [ ] Test sorting by username (ascending/descending)
- [ ] Test sorting by email (ascending/descending)
- [ ] Test sorting by first name (ascending/descending)
- [ ] Test sorting by last name (ascending/descending)
- [ ] Test sorting by role (ascending/descending)
- [ ] Verify sort toggle works correctly (only 2 states)
- [ ] Clear search and verify all users are shown

## 8. Venue Management
### View Venues
- [ ] Navigate to Venues tab
- [ ] Verify list of venues is displayed
- [ ] Verify venue information (name, address) is shown
- [ ] Verify action buttons (Edit, Delete) are present

### Add Venue
- [ ] Click "Add Venue" button
- [ ] Verify add venue dialog opens
- [ ] Fill in venue name and address
- [ ] Submit form
- [ ] Verify success message appears
- [ ] Verify new venue appears in the list
- [ ] Test form validation (empty fields, etc.)

### Edit Venue
- [ ] Click "Edit" button on existing venue
- [ ] Verify edit dialog opens with current data
- [ ] Modify venue information
- [ ] Save changes
- [ ] Verify success message appears
- [ ] Verify changes are reflected in the list

### Delete Venue
- [ ] Click "Delete" button on venue
- [ ] Verify confirmation dialog appears
- [ ] Confirm deletion
- [ ] Verify success message appears
- [ ] Verify venue is removed from the list
- [ ] Test deletion of venue with associated games (should show error)

### Venue Search & Sort
- [ ] Use search box to filter venues by name
- [ ] Verify real-time filtering works
- [ ] Test sorting by venue name (ascending/descending)
- [ ] Verify sort toggle works correctly (only 2 states)
- [ ] Clear search and verify all venues are shown

## 9. Game Management
### View Games
- [ ] Navigate to Games tab
- [ ] Verify list of games is displayed
- [ ] Verify game information (location, day, time, notes) is shown
- [ ] Verify action buttons are present

### Game Search & Sort
- [ ] Use search box to filter games
- [ ] Verify real-time filtering works across all fields
- [ ] Test sorting by location name
- [ ] Test sorting by game day
- [ ] Test sorting by start time
- [ ] Verify notes column is not sortable
- [ ] Verify sort toggle works correctly (only 2 states)

## 10. Responsive Design
### Mobile View
- [ ] Test on mobile device or browser dev tools mobile view
- [ ] Verify sidebar collapses properly
- [ ] Verify all pages are usable on mobile
- [ ] Verify dialogs work on mobile
- [ ] Verify tables are responsive

### Tablet View
- [ ] Test on tablet or browser dev tools tablet view
- [ ] Verify layout adapts correctly
- [ ] Verify all functionality works

## 11. Error Handling
### Network Errors
- [ ] Test with backend server stopped
- [ ] Verify appropriate error messages are shown
- [ ] Verify application doesn't crash

### Form Validation
- [ ] Test all forms with invalid data
- [ ] Verify validation messages are clear
- [ ] Verify forms don't submit with invalid data

### Permission Errors
- [ ] Try accessing admin features as non-admin user
- [ ] Verify appropriate access denied messages
- [ ] Verify non-admin users can't see admin menu items

## 12. Data Persistence
### Refresh Test
- [ ] Perform various actions (signup, edit profile, etc.)
- [ ] Refresh the page
- [ ] Verify data persists after refresh
- [ ] Verify user remains logged in

### Browser Navigation
- [ ] Use browser back/forward buttons
- [ ] Verify navigation works correctly
- [ ] Verify no data loss occurs

## 13. Performance
### Loading Times
- [ ] Verify pages load within reasonable time
- [ ] Verify no excessive loading spinners
- [ ] Verify smooth transitions between pages

### Memory Usage
- [ ] Monitor browser memory usage
- [ ] Verify no memory leaks during extended use
- [ ] Verify application remains responsive

## 14. Cross-Browser Testing
### Chrome
- [ ] Test all functionality in Chrome
- [ ] Verify no console errors
- [ ] Verify all features work correctly

### Firefox
- [ ] Test all functionality in Firefox
- [ ] Verify no console errors
- [ ] Verify all features work correctly

### Safari (if applicable)
- [ ] Test all functionality in Safari
- [ ] Verify no console errors
- [ ] Verify all features work correctly

## 15. Security Testing
### Authentication
- [ ] Verify users must be logged in to access protected pages
- [ ] Verify logout functionality works
- [ ] Verify session timeout (if implemented)

### Authorization
- [ ] Verify admin features are only accessible to admin users
- [ ] Verify users can only see their own data where appropriate
- [ ] Verify proper error messages for unauthorized access

## 16. Final Verification
### Complete User Journey
- [ ] Register new user
- [ ] Login with new user
- [ ] Complete profile setup
- [ ] Sign up for a game
- [ ] View the list
- [ ] Cancel signup
- [ ] Edit profile
- [ ] Logout

### Admin User Journey
- [ ] Login as admin
- [ ] View admin dashboard
- [ ] Manage users
- [ ] Add new venue
- [ ] Edit venue
- [ ] Delete venue
- [ ] Manage games
- [ ] Test search and sort functionality

## Notes
- Test with different user roles (player, dealer, admin)
- Test with various data scenarios (empty lists, large lists, etc.)
- Document any bugs or issues found during testing
- Verify all error messages are user-friendly and helpful
- Ensure consistent UI/UX across all pages

## Test Data Requirements
- At least one admin user
- At least one regular player user
- At least one venue in the database
- At least one game in the database
- Some existing player signups for testing "The List" functionality
