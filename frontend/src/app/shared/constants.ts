/**
 * Shared constants used across multiple components
 * This file centralizes commonly used arrays and data to avoid duplication
 */

// Days of the week - used in multiple components
export const DAYS_OF_WEEK: readonly string[] = [
  'Sunday',
  'Monday', 
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
] as const;

// Month names (abbreviated) - used for date formatting
export const MONTH_NAMES: readonly string[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
] as const;

// User roles - used in user management and role assignment
export const USER_ROLES: readonly string[] = [
  'player',
  'dealer', 
  'admin'
] as const;

// US States - used in venue address forms
export const US_STATES: readonly string[] = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
] as const;

// Default state (Colorado)
export const DEFAULT_STATE = 'Colorado';

// Type definitions for better TypeScript support
export type DayOfWeek = typeof DAYS_OF_WEEK[number];
export type MonthName = typeof MONTH_NAMES[number];
export type UserRole = typeof USER_ROLES[number];
export type USState = typeof US_STATES[number];
