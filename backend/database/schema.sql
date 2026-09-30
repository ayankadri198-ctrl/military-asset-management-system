-- ==========================================================
-- MILITARY ASSET MANAGEMENT SYSTEM (MAMS)
-- MySQL Database Schema
-- Demonstrative Educational / College Project System
-- Note: Uses fictional/demo defense logistics data only
-- ==========================================================

CREATE DATABASE IF NOT EXISTS military_assets_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE military_assets_db;

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'Manager', 'Staff') NOT NULL DEFAULT 'Staff',
  rank_title VARCHAR(50) DEFAULT 'Specialist',
  military_unit VARCHAR(100) DEFAULT 'Logistics Command HQ',
  service_id VARCHAR(50) UNIQUE,
  status ENUM('Active', 'Suspended', 'Inactive') NOT NULL DEFAULT 'Active',
  avatar_url VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_email (email),
  INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 2. PERSONNEL TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS personnel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_number VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  rank_title VARCHAR(60) NOT NULL,
  unit VARCHAR(100) NOT NULL,
  role_assignment VARCHAR(100) NOT NULL,
  clearance_level ENUM('Confidential', 'Secret', 'Top Secret', 'General Clearance') NOT NULL DEFAULT 'Secret',
  phone VARCHAR(30) DEFAULT NULL,
  email VARCHAR(100) DEFAULT NULL,
  status ENUM('Active', 'On Leave', 'Deployed', 'Transferred') NOT NULL DEFAULT 'Active',
  assigned_base VARCHAR(100) NOT NULL DEFAULT 'Forward Operating Base Alpha',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_personnel_service (service_number),
  INDEX idx_personnel_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 3. ASSETS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  type ENUM('Vehicle', 'Weapon', 'Communication', 'Optics', 'Heavy Equipment', 'Surveillance', 'Medical Gear') NOT NULL,
  serial_number VARCHAR(100) NOT NULL UNIQUE,
  quantity INT NOT NULL DEFAULT 1,
  status ENUM('Available', 'Assigned', 'Under Maintenance', 'Retired') NOT NULL DEFAULT 'Available',
  location VARCHAR(120) NOT NULL DEFAULT 'Central Armory - Alpha',
  assigned_to_id INT DEFAULT NULL,
  purchase_date DATE NOT NULL,
  last_maintenance_date DATE DEFAULT NULL,
  next_maintenance_date DATE DEFAULT NULL,
  description TEXT DEFAULT NULL,
  condition_state ENUM('Excellent', 'Good', 'Fair', 'Critical') NOT NULL DEFAULT 'Good',
  value_usd DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to_id) REFERENCES personnel(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_asset_code (asset_code),
  INDEX idx_asset_status (status),
  INDEX idx_asset_type (type),
  INDEX idx_asset_location (location)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 4. VEHICLES TABLE (Sub-specialization of Vehicle Assets)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL UNIQUE,
  vehicle_type ENUM('Armored Patrol', 'Tactical Truck', 'APC', 'Reconnaissance Rover', 'Utility Transport') NOT NULL,
  registration_no VARCHAR(50) NOT NULL UNIQUE,
  engine_no VARCHAR(60) NOT NULL,
  mileage_km INT NOT NULL DEFAULT 0,
  fuel_type ENUM('Diesel', 'JP-8 Heavy Fuel', 'Hybrid Electric', 'Battery EV') NOT NULL DEFAULT 'Diesel',
  operational_readiness ENUM('Mission Ready', 'Standby', 'In Shop', 'Decommissioned') NOT NULL DEFAULT 'Mission Ready',
  assigned_driver_id INT DEFAULT NULL,
  armor_level VARCHAR(40) DEFAULT 'STANAG Level 2',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (assigned_driver_id) REFERENCES personnel(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_veh_reg (registration_no),
  INDEX idx_veh_readiness (operational_readiness)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 5. EQUIPMENT TABLE (Sub-specialization of Tactical Equipment)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL UNIQUE,
  category ENUM('Tactical Optics', 'Encrypted Radio', 'Ballistic Gear', 'Drone / UAV', 'Field Power') NOT NULL,
  calibration_date DATE DEFAULT NULL,
  battery_health VARCHAR(20) DEFAULT '98%',
  serial_no VARCHAR(100) NOT NULL UNIQUE,
  storage_locker VARCHAR(60) NOT NULL DEFAULT 'Locker B-12',
  operational_state ENUM('Fully Operational', 'Needs Calibration', 'Defective') NOT NULL DEFAULT 'Fully Operational',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_equip_cat (category)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 6. MAINTENANCE TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  work_order_no VARCHAR(50) NOT NULL UNIQUE,
  asset_id INT NOT NULL,
  maintenance_type ENUM('Routine Inspection', 'Corrective Repair', 'Overhaul', 'Emergency') NOT NULL,
  description TEXT NOT NULL,
  technician_name VARCHAR(100) NOT NULL,
  parts_replaced TEXT DEFAULT NULL,
  cost DECIMAL(10,2) DEFAULT 0.00,
  start_date DATE NOT NULL,
  completion_date DATE DEFAULT NULL,
  status ENUM('Pending', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'In Progress',
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_maint_wo (work_order_no),
  INDEX idx_maint_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 7. TRANSFERS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transfer_code VARCHAR(50) NOT NULL UNIQUE,
  asset_id INT NOT NULL,
  source_location VARCHAR(120) NOT NULL,
  destination_location VARCHAR(120) NOT NULL,
  transfer_date DATE NOT NULL,
  requested_by_id INT DEFAULT NULL,
  approved_by_id INT DEFAULT NULL,
  recipient_personnel_id INT DEFAULT NULL,
  reason TEXT NOT NULL,
  status ENUM('Pending', 'Approved', 'In Transit', 'Completed', 'Rejected') NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (requested_by_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (approved_by_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (recipient_personnel_id) REFERENCES personnel(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_transfer_code (transfer_code),
  INDEX idx_transfer_status (status)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 8. NOTIFICATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'critical', 'success') NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link VARCHAR(200) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_read (is_read)
) ENGINE=InnoDB;

-- ----------------------------------------------------------
-- 9. ACTIVITY_LOGS TABLE
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  user_name VARCHAR(100) DEFAULT 'System',
  action VARCHAR(100) NOT NULL,
  module VARCHAR(60) NOT NULL,
  details TEXT DEFAULT NULL,
  ip_address VARCHAR(50) DEFAULT '127.0.0.1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_activity_module (module),
  INDEX idx_activity_created (created_at)
) ENGINE=InnoDB;
