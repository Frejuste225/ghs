-- Crée la base de données "ghs" si elle n'existe pas
CREATE DATABASE IF NOT EXISTS `ghs`;

-- Sélectionne la base de données "ghs" pour les opérations suivantes
USE `ghs`;

-- --------------------------------------------------------------------------------
-- Table des services
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `services` (
  `serviceID` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `serviceCode` VARCHAR(10) NOT NULL UNIQUE,
  `serviceName` VARCHAR(100) NOT NULL,
  `parentServiceID` INT UNSIGNED,
  `description` TEXT,
  `manager` VARCHAR(100),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------------
-- Table des employés
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `employees` (
  `employeeID` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `employeeNumber` VARCHAR(20) NOT NULL UNIQUE,
  `lastName` VARCHAR(20) NOT NULL,
  `firstName` VARCHAR(30) NOT NULL,
  `serviceID` INT UNSIGNED NOT NULL,
  `contractType` ENUM('CDI', 'CDD', 'Interim', 'Stage', 'Alternance', 'MOO') DEFAULT 'CDI',
  `contact` VARCHAR(20),
  `birthdate` DATE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`serviceID`) REFERENCES `services`(`serviceID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------------
-- Table des comptes
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `accounts` (
  `accountID` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `employeeID` INT UNSIGNED NOT NULL UNIQUE,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `profile` ENUM('Validator', 'Supervisor', 'Administrator', 'Coordinator') DEFAULT 'Validator',
  `isActive` TINYINT(1) DEFAULT 1,
  `lastLogin` TIMESTAMP NULL,
  `resetToken` VARCHAR(100),
  `resetTokenExpiry` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employeeID`) REFERENCES `employees`(`employeeID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------------
-- Table des demandes d'heures supplémentaires
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `requests` (
  `requestID` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `employeeID` INT UNSIGNED NOT NULL,
  `requestDate` DATE NOT NULL,
  `previousStart` TIME NULL,
  `previousEnd` TIME NULL,
  `startAt` TIME NOT NULL,
  `endAt` TIME NOT NULL,
  `status` ENUM('pending', 'submitted', 'firstLevelApproved', 'inProgress', 'secondLevelApproved', 'accepted', 'rejected') DEFAULT 'pending',
  `comment` TEXT,
  `createdBy` INT UNSIGNED,
  `validatedN1At` TIMESTAMP NULL,
  `validatedN2At` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `check_hours` CHECK (`endAt` > `startAt`),
  CONSTRAINT `check_previous_hours` CHECK (`previousEnd` > `previousStart`),
  FOREIGN KEY (`employeeID`) REFERENCES `employees`(`employeeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`createdBy`) REFERENCES `employees`(`employeeID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------------
-- Table des délégations
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `delegations`(
  `delegationID` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `delegatedBy` INT UNSIGNED NOT NULL,
  `delegatedTo` INT UNSIGNED NOT NULL,
  `startAt` DATE NOT NULL,
  `endAt` DATE NOT NULL,
  FOREIGN KEY (`delegatedBy`) REFERENCES `employees`(`employeeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`delegatedTo`) REFERENCES `employees`(`employeeID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------------
-- Table des workflows
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `workflows`(
  `workflowID` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `requestID` INT UNSIGNED NOT NULL,
  `validator` INT UNSIGNED NOT NULL,
  `delegate` INT UNSIGNED NULL,
  `assignDate` DATETIME NOT NULL,
  `validationDate` DATETIME NULL,
  `status` INT UNSIGNED NOT NULL,
  FOREIGN KEY (`requestID`) REFERENCES `requests`(`requestID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`validator`) REFERENCES `employees`(`employeeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`delegate`) REFERENCES `employees`(`employeeID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------------
-- Table de liaison RequestEmployee
-- --------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `requestEmployee`(
  `ID` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `employeeID` INT UNSIGNED NOT NULL,
  `requestID` INT UNSIGNED NOT NULL,
  `totalHours` FLOAT NOT NULL,
  FOREIGN KEY (`employeeID`) REFERENCES `employees`(`employeeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`requestID`) REFERENCES `requests`(`requestID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;