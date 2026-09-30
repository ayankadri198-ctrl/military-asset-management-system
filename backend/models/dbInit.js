const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const SQLITE_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Staff',
  rank_title TEXT DEFAULT 'Specialist',
  military_unit TEXT DEFAULT 'Logistics Command HQ',
  service_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'Active',
  avatar_url TEXT DEFAULT NULL,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS personnel (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_number TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  rank_title TEXT NOT NULL,
  unit TEXT NOT NULL,
  role_assignment TEXT NOT NULL,
  clearance_level TEXT NOT NULL DEFAULT 'Secret',
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  assigned_base TEXT NOT NULL DEFAULT 'Forward Operating Base Alpha',
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  serial_number TEXT NOT NULL UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Available',
  location TEXT NOT NULL DEFAULT 'Central Armory - Alpha',
  assigned_to_id INTEGER,
  purchase_date TEXT NOT NULL,
  last_maintenance_date TEXT,
  next_maintenance_date TEXT,
  description TEXT,
  condition_state TEXT NOT NULL DEFAULT 'Good',
  value_usd REAL DEFAULT 0.0,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (assigned_to_id) REFERENCES personnel(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL UNIQUE,
  vehicle_type TEXT NOT NULL,
  registration_no TEXT NOT NULL UNIQUE,
  engine_no TEXT NOT NULL,
  mileage_km INTEGER NOT NULL DEFAULT 0,
  fuel_type TEXT NOT NULL DEFAULT 'Diesel',
  operational_readiness TEXT NOT NULL DEFAULT 'Mission Ready',
  assigned_driver_id INTEGER,
  armor_level TEXT DEFAULT 'STANAG Level 2',
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_driver_id) REFERENCES personnel(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL UNIQUE,
  category TEXT NOT NULL,
  calibration_date TEXT,
  battery_health TEXT DEFAULT '98%',
  serial_no TEXT NOT NULL UNIQUE,
  storage_locker TEXT NOT NULL DEFAULT 'Locker B-12',
  operational_state TEXT NOT NULL DEFAULT 'Fully Operational',
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS maintenance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  work_order_no TEXT NOT NULL UNIQUE,
  asset_id INTEGER NOT NULL,
  maintenance_type TEXT NOT NULL,
  description TEXT NOT NULL,
  technician_name TEXT NOT NULL,
  parts_replaced TEXT,
  cost REAL DEFAULT 0.0,
  start_date TEXT NOT NULL,
  completion_date TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transfers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transfer_code TEXT NOT NULL UNIQUE,
  asset_id INTEGER NOT NULL,
  source_location TEXT NOT NULL,
  destination_location TEXT NOT NULL,
  transfer_date TEXT NOT NULL,
  requested_by_id INTEGER,
  approved_by_id INTEGER,
  recipient_personnel_id INTEGER,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (requested_by_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (recipient_personnel_id) REFERENCES personnel(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read INTEGER NOT NULL DEFAULT 0,
  link TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_name TEXT DEFAULT 'System',
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details TEXT,
  ip_address TEXT DEFAULT '127.0.0.1',
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
`;

const SEED_USERS = [
  [1, 'col_mitchell', 'admin@example.com', '$2a$10$U1Gelp0EJR0nc48chj8FC.y28QN2Zz3kGdeTtlpcCFPf9r.Zy54Dq', 'Admin', 'Colonel', 'Joint Logistics Command', 'HQ-ADM-001', 'Active'],
  [2, 'maj_vance', 'manager@example.com', '$2a$10$7WNppoNDz31JEUcqkm2Tc.IvVPlqTWef6AHxogYOkq5cx6GJ/Z216', 'Manager', 'Major', '4th Armored Battalion Depot', 'MGR-DEP-042', 'Active'],
  [3, 'sgt_miller', 'staff@example.com', '$2a$10$FXRe4gXYySc/O/3q/802VuT2tNoDRXaL5mRsiUlvilG3zd0.MmtWC', 'Staff', 'Staff Sergeant', 'Armory Operations Sec-9', 'STF-ARM-108', 'Active'],
  [4, 'capt_rodriguez', 'rodriguez@example.com', '$2a$10$7WNppoNDz31JEUcqkm2Tc.IvVPlqTWef6AHxogYOkq5cx6GJ/Z216', 'Manager', 'Captain', 'Forward Depot Delta', 'MGR-DEP-099', 'Active']
];

const SEED_PERSONNEL = [
  [1, 'SN-849201', 'Marcus Vance', 'Major', '4th Armored Battalion Depot', 'Logistics Commander', 'Top Secret', '+1-555-0101', 'm.vance@mams.internal', 'Active', 'Fort Vanguard HQ'],
  [2, 'SN-739102', 'Sarah Jenkins', 'Captain', '101st Reconnaissance Wing', 'Lead Recon Pilot', 'Secret', '+1-555-0102', 's.jenkins@mams.internal', 'Active', 'FOB Echo Outpost'],
  [3, 'SN-529403', 'David Miller', 'Staff Sergeant', 'Armory Operations Sec-9', 'Master Armorer', 'Secret', '+1-555-0103', 'd.miller@mams.internal', 'Active', 'Fort Vanguard HQ'],
  [4, 'SN-619204', 'Elena Rostova', 'Lieutenant', 'Signals & Cyber Operations', 'Comms Director', 'Top Secret', '+1-555-0104', 'e.rostova@mams.internal', 'Active', 'Sector 7 Comm Center'],
  [5, 'SN-402915', 'Tariq Al-Mansoor', 'Chief Warrant Officer', 'Heavy Maintenance Depot', 'Lead Mechanic', 'Confidential', '+1-555-0105', 't.mansoor@mams.internal', 'Active', 'Depot Bravo Maintenance'],
  [6, 'SN-910283', 'James "Ghost" Callahan', 'Master Sergeant', 'Special Operations Task Unit', 'Assault Team Leader', 'Top Secret', '+1-555-0106', 'j.callahan@mams.internal', 'Deployed', 'Task Force Ironclad'],
  [7, 'SN-384729', 'Chloe Bennett', 'Corporal', 'Tactical Medical Evacuation', 'Field Medic Specialist', 'Secret', '+1-555-0107', 'c.bennett@mams.internal', 'Active', 'Fort Vanguard HQ'],
  [8, 'SN-194820', 'Michael Chang', 'First Lieutenant', 'Air Defense Logistics', 'Artillery Officer', 'Secret', '+1-555-0108', 'm.chang@mams.internal', 'On Leave', 'Airbase Sierra']
];

const SEED_ASSETS = [
  [1, 'AST-1001', 'Guardian Tactical APC (V-8)', 'Vehicle', 'APC-2023-88190', 1, 'Assigned', 'Depot Bay 3', 1, '2023-03-15', '2024-01-10', '2024-07-15', 'Multi-role armored transport with reinforced STANAG ballistic plating.', 'Excellent', 380000.00],
  [2, 'AST-1002', 'Oshkosh Heavy Tactical Cargo Truck', 'Vehicle', 'TRK-2022-44102', 1, 'Available', 'Motor Pool Alpha', null, '2022-06-20', '2024-02-18', '2024-08-20', '8x8 heavy payload logistics transport designed for rough terrain supply chains.', 'Good', 245000.00],
  [3, 'AST-1003', 'Scout Rapid Recon Buggy', 'Vehicle', 'RCV-2024-11009', 1, 'Under Maintenance', 'Depot Bravo Maintenance', 2, '2024-01-05', '2024-02-28', '2024-05-30', 'Lightweight 4x4 fast recon rover fitted with IR optics mount.', 'Fair', 85000.00],
  [4, 'AST-1004', 'Cougar MRAP Armored Patrol', 'Vehicle', 'MRP-2021-93041', 1, 'Assigned', 'FOB Echo Outpost', 6, '2021-11-12', '2023-12-05', '2024-06-01', 'Mine-Resistant Ambush Protected vehicle serving perimeter defense patrols.', 'Good', 420000.00],
  [5, 'AST-2001', 'Harris Falcon III Encrypted Radio Kit', 'Communication', 'RAD-2023-55912', 4, 'Assigned', 'Sector 7 Comm Center', 4, '2023-05-18', '2024-01-22', '2024-07-22', 'Tactical multiband backpack radio system with NSA Type-1 cryptographic agility.', 'Excellent', 32000.00],
  [6, 'AST-2002', 'L3Harris AN/PVS-31A Night Vision Goggles', 'Optics', 'NVG-2023-77401', 12, 'Available', 'Central Armory - Alpha', null, '2023-08-10', '2024-02-14', '2024-08-14', 'Binocular night vision goggles with white phosphor dual-tube optical fidelity.', 'Excellent', 145000.00],
  [7, 'AST-2003', 'Skydio X2D Recon Quadcopter Drone', 'Surveillance', 'UAV-2024-00912', 2, 'Assigned', 'FOB Echo Outpost', 2, '2024-01-19', '2024-02-20', '2024-06-15', 'Autonomous thermal and optical reconnaissance drone with AI obstacle avoidance.', 'Excellent', 42000.00],
  [8, 'AST-2004', 'Field Tactical Surgical Kit (Modular)', 'Medical Gear', 'MED-2022-81923', 5, 'Available', 'Medical Supply Depot', 7, '2022-09-01', '2023-11-10', '2024-05-10', 'Rapid deployable field trauma and stabilization station for frontline medic teams.', 'Good', 18500.00],
  [9, 'AST-3001', 'M4A1 SOPMOD Tactical Carbine Batch #4', 'Weapon', 'WPN-2022-44018', 25, 'Assigned', 'Central Armory - Alpha', 3, '2022-04-10', '2024-01-05', '2024-07-01', 'Standard issue select-fire tactical carbines fitted with suppressed muzzle adaptors.', 'Good', 62500.00],
  [10, 'AST-3002', 'Barrett M107A1 Long-Range Rifle System', 'Weapon', 'WPN-2021-00294', 2, 'Under Maintenance', 'Depot Bravo Maintenance', null, '2021-07-14', '2024-03-01', '2024-04-15', 'Semi-automatic anti-materiel precision rifle with harmonic barrel suppressor.', 'Fair', 36000.00],
  [11, 'AST-4001', 'Caterpillar Armored Heavy Excavator', 'Heavy Equipment', 'CAT-2020-55902', 1, 'Retired', 'Boneyard Reserve Sector', null, '2020-02-11', '2023-04-19', null, 'Fortification earth-mover decommissioned after completing perimeter barriers.', 'Critical', 110000.00],
  [12, 'AST-4002', 'Tactical 60kW Mobile Diesel Generator', 'Heavy Equipment', 'GEN-2023-66291', 3, 'Available', 'Motor Pool Alpha', null, '2023-04-14', '2024-02-01', '2024-08-01', 'Ruggedized all-weather sound-dampened auxiliary power generator unit.', 'Excellent', 74000.00]
];

const SEED_VEHICLES = [
  [1, 1, 'APC', 'MIL-V-88190', 'ENG-DET-9921', 14200, 'JP-8 Heavy Fuel', 'Mission Ready', 1, 'STANAG Level 3'],
  [2, 2, 'Tactical Truck', 'MIL-T-44102', 'ENG-CAT-4402', 38950, 'Diesel', 'Mission Ready', null, 'STANAG Level 1'],
  [3, 3, 'Reconnaissance Rover', 'MIL-R-11009', 'ENG-POL-1088', 8400, 'Hybrid Electric', 'In Shop', 2, 'Light Composite'],
  [4, 4, 'Armored Patrol', 'MIL-M-93041', 'ENG-CUM-9381', 26400, 'Diesel', 'Mission Ready', 6, 'STANAG Level 2+']
];

const SEED_EQUIPMENT = [
  [1, 5, 'Encrypted Radio', '2024-01-20', '96%', 'EQ-RAD-2023-559', 'Rack C-04', 'Fully Operational'],
  [2, 6, 'Tactical Optics', '2024-02-10', '100%', 'EQ-NVG-2023-774', 'Vault Optical-01', 'Fully Operational'],
  [3, 7, 'Drone / UAV', '2024-02-18', '94%', 'EQ-UAV-2024-009', 'Hangar Bay B-2', 'Fully Operational'],
  [4, 8, 'Ballistic Gear', '2023-11-10', 'N/A', 'EQ-MED-2022-819', 'Med-Locker 09', 'Fully Operational']
];

const SEED_MAINTENANCE = [
  [1, 'WO-2024-001', 3, 'Corrective Repair', 'Hydraulic front suspension seal rupture after rough field exercise.', 'CWO Tariq Al-Mansoor', 'Front Strut Assembly, O-Rings, High-Pressure Line', 3420.00, '2024-02-28', null, 'In Progress', 'Awaiting OEM replacement bushing arriving next Tuesday.'],
  [2, 'WO-2024-002', 10, 'Routine Inspection', 'Borescope inspection and chamber tolerance check. Recoil spring replacement.', 'Sgt. David Miller', 'Buffer Spring Assembly, Extractor Pin', 850.00, '2024-03-01', null, 'In Progress', 'Chamber headspace within factory green tolerances.'],
  [3, 'WO-2024-003', 1, 'Routine Inspection', '6-month comprehensive drivetrain inspection, oil & hydraulic fluids flushed.', 'CWO Tariq Al-Mansoor', 'Filters, Heavy Transmission Fluid, Seals', 1980.00, '2024-01-08', '2024-01-10', 'Completed', 'Approved for immediate combat deployment.'],
  [4, 'WO-2024-004', 6, 'Routine Inspection', 'White phosphor intensifier tube alignment and gain calibration.', 'Sgt. David Miller', 'Protective sacrificial lenses', 420.00, '2024-02-12', '2024-02-14', 'Completed', 'Passed high-vacuum seal leak test.'],
  [5, 'WO-2024-005', 2, 'Overhaul', 'Transmission gear ratio calibration and turbocharger intake overhaul.', 'Depot Tech Team Charlie', 'Turbocharger Cartridge, Gaskets', 6100.00, '2024-02-15', '2024-02-18', 'Completed', 'Road test 100km verified normal operating temperatures.']
];

const SEED_TRANSFERS = [
  [1, 'TRF-2024-801', 4, 'Central Armory - Alpha', 'FOB Echo Outpost', '2024-02-10', 2, 1, 6, 'Routine rotation to support forward patrol missions along Sector North.', 'Completed'],
  [2, 'TRF-2024-802', 7, 'Central Armory - Alpha', 'FOB Echo Outpost', '2024-02-18', 2, 1, 2, 'Aerial reconnaissance drone kit requisition for perimeter surveillance.', 'Completed'],
  [3, 'TRF-2024-803', 2, 'Motor Pool Alpha', 'Forward Depot Delta', '2024-03-05', 4, 1, null, 'Heavy logistical support transfer to replenish FOB winter ammunition supply.', 'In Transit'],
  [4, 'TRF-2024-804', 9, 'Central Armory - Alpha', 'Special Operations Task Unit', '2024-03-12', 3, 2, 6, 'Armament allotment for upcoming live-fire training exercise.', 'Approved'],
  [5, 'TRF-2024-805', 12, 'Motor Pool Alpha', 'Sector 7 Comm Center', '2024-03-15', 2, null, 4, 'Auxiliary backup power supply relocation request for comms tower upgrade.', 'Pending']
];

const SEED_NOTIFICATIONS = [
  [1, 1, 'Transfer Request Pending Approval', 'Major Vance requested transfer TRF-2024-805 (Tactical 60kW Generator) to Sector 7.', 'warning', 0, '/transfers'],
  [2, 1, 'Maintenance Work Order In Progress', 'Work order WO-2024-001 on Scout Recon Buggy is undergoing front strut repair.', 'info', 0, '/maintenance'],
  [3, 2, 'Asset Assigned to Personnel', 'Cougar MRAP Armored Patrol (AST-1004) successfully transferred to FOB Echo.', 'success', 1, '/assets/4'],
  [4, 3, 'Quarterly Armory Calibration Due', 'Optics and night vision batches require quarterly optical check before end of month.', 'warning', 0, '/equipment'],
  [5, 1, 'System Security Audit Completed', 'Automated logistics integrity scan completed with zero discrepancies logged.', 'info', 1, '/settings']
];

const SEED_ACTIVITY_LOGS = [
  [1, 1, 'col_mitchell', 'LOGIN', 'Authentication', 'Admin login successful from Command HQ secure workstation.', '10.0.1.45'],
  [2, 1, 'col_mitchell', 'APPROVE_TRANSFER', 'Transfers', 'Approved transfer TRF-2024-804 for M4A1 SOPMOD tactical carbines.', '10.0.1.45'],
  [3, 2, 'maj_vance', 'UPDATE_ASSET', 'Assets', 'Updated condition state of Scout Rapid Recon Buggy to Under Maintenance.', '10.0.2.19'],
  [4, 3, 'sgt_miller', 'CREATE_MAINTENANCE', 'Maintenance', 'Logged work order WO-2024-002 for Barrett M107A1 sniper inspection.', '10.0.3.82'],
  [5, 1, 'col_mitchell', 'CREATE_PERSONNEL', 'Personnel', 'Registered Corporal Chloe Bennett to Tactical Medical Evacuation.', '10.0.1.45']
];

async function initializeDatabase() {
  const client = db.getClient();
  console.log(`[Database] Verifying schema and demo seed records using [${client.toUpperCase()}] engine...`);

  if (client === 'sqlite') {
    const sqlite = db.getSqlite();
    sqlite.exec(SQLITE_SCHEMA);

    const userCount = sqlite.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
      console.log('[Database] Populating default seed records in SQLite...');
      const insertUser = sqlite.prepare(`
        INSERT OR IGNORE INTO users (id, username, email, password, role, rank_title, military_unit, service_id, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of SEED_USERS) insertUser.run(...row);

      const insertPersonnel = sqlite.prepare(`
        INSERT OR IGNORE INTO personnel (id, service_number, full_name, rank_title, unit, role_assignment, clearance_level, phone, email, status, assigned_base)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of SEED_PERSONNEL) insertPersonnel.run(...row);

      const insertAsset = sqlite.prepare(`
        INSERT OR IGNORE INTO assets (id, asset_code, name, type, serial_number, quantity, status, location, assigned_to_id, purchase_date, last_maintenance_date, next_maintenance_date, description, condition_state, value_usd)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of SEED_ASSETS) insertAsset.run(...row);

      const insertVehicle = sqlite.prepare(`
        INSERT OR IGNORE INTO vehicles (id, asset_id, vehicle_type, registration_no, engine_no, mileage_km, fuel_type, operational_readiness, assigned_driver_id, armor_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of SEED_VEHICLES) insertVehicle.run(...row);

      const insertEquipment = sqlite.prepare(`
        INSERT OR IGNORE INTO equipment (id, asset_id, category, calibration_date, battery_health, serial_no, storage_locker, operational_state)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of SEED_EQUIPMENT) insertEquipment.run(...row);

      const insertMaintenance = sqlite.prepare(`
        INSERT OR IGNORE INTO maintenance (id, work_order_no, asset_id, maintenance_type, description, technician_name, parts_replaced, cost, start_date, completion_date, status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of SEED_MAINTENANCE) insertMaintenance.run(...row);

      const insertTransfer = sqlite.prepare(`
        INSERT OR IGNORE INTO transfers (id, transfer_code, asset_id, source_location, destination_location, transfer_date, requested_by_id, approved_by_id, recipient_personnel_id, reason, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of SEED_TRANSFERS) insertTransfer.run(...row);

      const insertNotif = sqlite.prepare(`
        INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, is_read, link)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of SEED_NOTIFICATIONS) insertNotif.run(...row);

      const insertLog = sqlite.prepare(`
        INSERT OR IGNORE INTO activity_logs (id, user_id, user_name, action, module, details, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const row of SEED_ACTIVITY_LOGS) insertLog.run(...row);
      console.log('[Database] Seed data successfully populated in SQLite.');
    }
  } else if (client === 'mysql') {
    // In MySQL, execute schema.sql and seed.sql if tables don't exist
    try {
      const [tables] = await db.query("SHOW TABLES LIKE 'users'");
      if (tables.length === 0) {
        console.log('[Database] Executing MySQL schema.sql...');
        const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        // Split statements cleanly
        const statements = schemaSql
          .replace(/--.*$/gm, '')
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.toUpperCase().startsWith('CREATE DATABASE') && !s.toUpperCase().startsWith('USE '));

        for (const stmt of statements) {
          await db.query(stmt);
        }

        console.log('[Database] Executing MySQL seed.sql...');
        const seedPath = path.resolve(__dirname, '../../database/seed.sql');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        const seedStatements = seedSql
          .replace(/--.*$/gm, '')
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.toUpperCase().startsWith('USE '));

        for (const stmt of seedStatements) {
          await db.query(stmt);
        }
        console.log('[Database] MySQL tables and seed records initialized successfully.');
      }
    } catch (err) {
      console.error('[Database] Error while initializing MySQL tables:', err.message);
    }
  }
}

module.exports = { initializeDatabase };
