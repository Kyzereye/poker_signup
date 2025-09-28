-- Poker Signup Database Schema
-- This file creates all tables including email verification and normalized roles

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Table structure for table `games`
DROP TABLE IF EXISTS `games`;
CREATE TABLE `games` (
  `id` int NOT NULL AUTO_INCREMENT,
  `location_id` int DEFAULT NULL,
  `game_day` varchar(10) NOT NULL,
  `start_time` varchar(10) NOT NULL,
  `notes` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_games_location_id` (`location_id`),
  KEY `idx_games_game_day` (`game_day`),
  KEY `idx_games_location_day` (`location_id`,`game_day`),
  CONSTRAINT `games_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `locations`
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `address` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_locations_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `users` (with email verification and password reset fields)
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(25) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(250) NOT NULL,
  `email_verified` boolean DEFAULT FALSE,
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_username` (`username`),
  KEY `idx_verification_token` (`verification_token`),
  KEY `idx_password_reset_token` (`password_reset_token`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `roles` (normalized roles)
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `user_features` (with normalized role_id)
DROP TABLE IF EXISTS `user_features`;
CREATE TABLE `user_features` (
  `user_id` int NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `role_id` int NOT NULL DEFAULT 1,
  `total_points` int DEFAULT '0',
  PRIMARY KEY (`user_id`),
  KEY `idx_user_features_user_id` (`user_id`),
  KEY `idx_user_features_role_id` (`role_id`),
  CONSTRAINT `user_features_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_features_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table structure for table `user_game_signups`
DROP TABLE IF EXISTS `user_game_signups`;
CREATE TABLE `user_game_signups` (
  `user_id` int NOT NULL,
  `game_id` int NOT NULL,
  `location_id` int DEFAULT NULL,
  `signup_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`game_id`),
  KEY `game_id` (`game_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `user_game_signups_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_game_signups_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`),
  CONSTRAINT `user_game_signups_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES 
(1, 'player', 'Regular poker player'),
(2, 'dealer', 'Poker dealer'),
(3, 'admin', 'System administrator');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;