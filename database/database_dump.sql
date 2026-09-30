PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE users (
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
INSERT INTO users VALUES(1,'col_mitchell','admin@example.com','$2a$10$U1Gelp0EJR0nc48chj8FC.y28QN2Zz3kGdeTtlpcCFPf9r.Zy54Dq','Admin','Colonel','Joint Logistics Command','HQ-ADM-001','Active',NULL,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO users VALUES(2,'maj_vance','manager@example.com','$2a$10$7WNppoNDz31JEUcqkm2Tc.IvVPlqTWef6AHxogYOkq5cx6GJ/Z216','Manager','Major','4th Armored Battalion Depot','MGR-DEP-042','Active',NULL,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO users VALUES(3,'sgt_miller','staff@example.com','$2a$10$FXRe4gXYySc/O/3q/802VuT2tNoDRXaL5mRsiUlvilG3zd0.MmtWC','Staff','Staff Sergeant','Armory Operations Sec-9','STF-ARM-108','Active',NULL,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO users VALUES(4,'capt_rodriguez','rodriguez@example.com','$2a$10$7WNppoNDz31JEUcqkm2Tc.IvVPlqTWef6AHxogYOkq5cx6GJ/Z216','Manager','Captain','Forward Depot Delta','MGR-DEP-099','Active',NULL,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO users VALUES(6,'test_officer','test_officer@mams.internal','$2a$10$ayV67sLnctEDvAiYKgEnJOrZBNGC3bn1RdH62fmTpbExK2p4ZcX/y','Manager','Captain','4th Armored Battalion Depot','MIL-45875','Active',NULL,'2026-09-30 23:20:33','2026-09-30 23:20:33');
INSERT INTO users VALUES(7,'ayankadri','ayankadri@gmail.com','$2a$10$2VTBUj2lsAo5mSAgmuKSaucrlRTUtCtXYB67VlIKCj96jULPFEcNm','Staff','Lieutenant','Joint Logistics Command HQ','MIL-73336','Active',NULL,'2026-09-30 23:24:58','2026-09-30 23:24:58');
INSERT INTO users VALUES(8,'Ayan Kadri','ayankadr12i@gmail.com','$2a$10$b.3pE8.L925HplCZQY1greSgxtPWf2HfSxTzIc3htE.KUsCkI0lKG','Staff','Lieutenant','4th Armored Battalion Depot','MIL-67652','Active',NULL,'2026-09-30 23:34:33','2026-09-30 23:34:33');
CREATE TABLE personnel (
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
INSERT INTO personnel VALUES(1,'SN-849201','Marcus Vance','Major','4th Armored Battalion Depot','Logistics Commander','Top Secret','+1-555-0101','m.vance@mams.internal','Active','Fort Vanguard HQ','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO personnel VALUES(2,'SN-739102','Sarah Jenkins','Captain','101st Reconnaissance Wing','Lead Recon Pilot','Secret','+1-555-0102','s.jenkins@mams.internal','Active','FOB Echo Outpost','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO personnel VALUES(3,'SN-529403','David Miller','Staff Sergeant','Armory Operations Sec-9','Master Armorer','Secret','+1-555-0103','d.miller@mams.internal','Active','Fort Vanguard HQ','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO personnel VALUES(4,'SN-619204','Elena Rostova','Lieutenant','Signals & Cyber Operations','Comms Director','Top Secret','+1-555-0104','e.rostova@mams.internal','Active','Sector 7 Comm Center','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO personnel VALUES(5,'SN-402915','Tariq Al-Mansoor','Chief Warrant Officer','Heavy Maintenance Depot','Lead Mechanic','Confidential','+1-555-0105','t.mansoor@mams.internal','Active','Depot Bravo Maintenance','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO personnel VALUES(6,'SN-910283','James "Ghost" Callahan','Master Sergeant','Special Operations Task Unit','Assault Team Leader','Top Secret','+1-555-0106','j.callahan@mams.internal','Deployed','Task Force Ironclad','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO personnel VALUES(7,'SN-384729','Chloe Bennett','Corporal','Tactical Medical Evacuation','Field Medic Specialist','Secret','+1-555-0107','c.bennett@mams.internal','Active','Fort Vanguard HQ','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO personnel VALUES(8,'SN-194820','Michael Chang','First Lieutenant','Air Defense Logistics','Artillery Officer','Secret','+1-555-0108','m.chang@mams.internal','On Leave','Airbase Sierra','2026-09-30 22:29:56','2026-09-30 22:29:56');
CREATE TABLE assets (
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
INSERT INTO assets VALUES(1,'AST-1001','Guardian Tactical APC (V-8)','Vehicle','APC-2023-88190',1,'Assigned','Depot Bay 3',1,'2023-03-15','2024-01-10','2024-07-15','Multi-role armored transport with reinforced STANAG ballistic plating.','Excellent',380000.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(2,'AST-1002','Oshkosh Heavy Tactical Cargo Truck','Vehicle','TRK-2022-44102',1,'Available','Motor Pool Alpha',NULL,'2022-06-20','2024-02-18','2024-08-20','8x8 heavy payload logistics transport designed for rough terrain supply chains.','Good',245000.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(3,'AST-1003','Scout Rapid Recon Buggy','Vehicle','RCV-2024-11009',1,'Under Maintenance','Depot Bravo Maintenance',2,'2024-01-05','2024-02-28','2024-05-30','Lightweight 4x4 fast recon rover fitted with IR optics mount.','Fair',85000.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(4,'AST-1004','Cougar MRAP Armored Patrol','Vehicle','MRP-2021-93041',1,'Assigned','FOB Echo Outpost',6,'2021-11-12','2023-12-05','2024-06-01','Mine-Resistant Ambush Protected vehicle serving perimeter defense patrols.','Good',420000.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(5,'AST-2001','Harris Falcon III Encrypted Radio Kit','Communication','RAD-2023-55912',4,'Assigned','Sector 7 Comm Center',4,'2023-05-18','2024-01-22','2024-07-22','Tactical multiband backpack radio system with NSA Type-1 cryptographic agility.','Excellent',32000.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(6,'AST-2002','L3Harris AN/PVS-31A Night Vision Goggles','Optics','NVG-2023-77401',12,'Available','Central Armory - Alpha',NULL,'2023-08-10','2024-02-14','2024-08-14','Binocular night vision goggles with white phosphor dual-tube optical fidelity.','Excellent',145000.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(7,'AST-2003','Skydio X2D Recon Quadcopter Drone','Surveillance','UAV-2024-00912',2,'Assigned','FOB Echo Outpost',2,'2024-01-19','2024-02-20','2024-06-15','Autonomous thermal and optical reconnaissance drone with AI obstacle avoidance.','Excellent',42000.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(8,'AST-2004','Field Tactical Surgical Kit (Modular)','Medical Gear','MED-2022-81923',5,'Available','Medical Supply Depot',7,'2022-09-01','2023-11-10','2024-05-10','Rapid deployable field trauma and stabilization station for frontline medic teams.','Good',18500.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(9,'AST-3001','M4A1 SOPMOD Tactical Carbine Batch #4','Weapon','WPN-2022-44018',25,'Assigned','Central Armory - Alpha',3,'2022-04-10','2024-01-05','2024-07-01','Standard issue select-fire tactical carbines fitted with suppressed muzzle adaptors.','Good',62500.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(10,'AST-3002','Barrett M107A1 Long-Range Rifle System','Weapon','WPN-2021-00294',2,'Under Maintenance','Depot Bravo Maintenance',NULL,'2021-07-14','2024-03-01','2024-04-15','Semi-automatic anti-materiel precision rifle with harmonic barrel suppressor.','Fair',36000.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(11,'AST-4001','Caterpillar Armored Heavy Excavator','Heavy Equipment','CAT-2020-55902',1,'Retired','Boneyard Reserve Sector',NULL,'2020-02-11','2023-04-19',NULL,'Fortification earth-mover decommissioned after completing perimeter barriers.','Critical',110000.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(12,'AST-4002','Tactical 60kW Mobile Diesel Generator','Heavy Equipment','GEN-2023-66291',3,'Available','Motor Pool Alpha',NULL,'2023-04-14','2024-02-01','2024-08-01','Ruggedized all-weather sound-dampened auxiliary power generator unit.','Excellent',74000.0,'2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO assets VALUES(13,'AST-6604','T-900 Advanced Combat Recon Drone','Surveillance','DRN-1790788304162',2,'Available','Hangar Bay 4',NULL,'2024-03-01',NULL,NULL,'High altitude thermal optical drone.','Excellent',95000.0,'2026-09-30 22:41:44','2026-09-30 22:41:44');
CREATE TABLE vehicles (
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
INSERT INTO vehicles VALUES(1,1,'APC','MIL-V-88190','ENG-DET-9921',14200,'JP-8 Heavy Fuel','Mission Ready',1,'STANAG Level 3','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO vehicles VALUES(2,2,'Tactical Truck','MIL-T-44102','ENG-CAT-4402',38950,'Diesel','Mission Ready',NULL,'STANAG Level 1','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO vehicles VALUES(3,3,'Reconnaissance Rover','MIL-R-11009','ENG-POL-1088',8400,'Hybrid Electric','In Shop',2,'Light Composite','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO vehicles VALUES(4,4,'Armored Patrol','MIL-M-93041','ENG-CUM-9381',26400,'Diesel','Mission Ready',6,'STANAG Level 2+','2026-09-30 22:29:56','2026-09-30 22:29:56');
CREATE TABLE equipment (
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
INSERT INTO equipment VALUES(1,5,'Encrypted Radio','2024-01-20','96%','EQ-RAD-2023-559','Rack C-04','Fully Operational','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO equipment VALUES(2,6,'Tactical Optics','2024-02-10','100%','EQ-NVG-2023-774','Vault Optical-01','Fully Operational','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO equipment VALUES(3,7,'Drone / UAV','2024-02-18','94%','EQ-UAV-2024-009','Hangar Bay B-2','Fully Operational','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO equipment VALUES(4,8,'Ballistic Gear','2023-11-10','N/A','EQ-MED-2022-819','Med-Locker 09','Fully Operational','2026-09-30 22:29:56','2026-09-30 22:29:56');
CREATE TABLE maintenance (
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
INSERT INTO maintenance VALUES(1,'WO-2024-001',3,'Corrective Repair','Hydraulic front suspension seal rupture after rough field exercise.','CWO Tariq Al-Mansoor','Front Strut Assembly, O-Rings, High-Pressure Line',3420.0,'2024-02-28',NULL,'In Progress','Awaiting OEM replacement bushing arriving next Tuesday.','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO maintenance VALUES(2,'WO-2024-002',10,'Routine Inspection','Borescope inspection and chamber tolerance check. Recoil spring replacement.','Sgt. David Miller','Buffer Spring Assembly, Extractor Pin',850.0,'2024-03-01',NULL,'In Progress','Chamber headspace within factory green tolerances.','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO maintenance VALUES(3,'WO-2024-003',1,'Routine Inspection','6-month comprehensive drivetrain inspection, oil & hydraulic fluids flushed.','CWO Tariq Al-Mansoor','Filters, Heavy Transmission Fluid, Seals',1980.0,'2024-01-08','2024-01-10','Completed','Approved for immediate combat deployment.','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO maintenance VALUES(4,'WO-2024-004',6,'Routine Inspection','White phosphor intensifier tube alignment and gain calibration.','Sgt. David Miller','Protective sacrificial lenses',420.0,'2024-02-12','2024-02-14','Completed','Passed high-vacuum seal leak test.','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO maintenance VALUES(5,'WO-2024-005',2,'Overhaul','Transmission gear ratio calibration and turbocharger intake overhaul.','Depot Tech Team Charlie','Turbocharger Cartridge, Gaskets',6100.0,'2024-02-15','2024-02-18','Completed','Road test 100km verified normal operating temperatures.','2026-09-30 22:29:56','2026-09-30 22:29:56');
CREATE TABLE transfers (
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
INSERT INTO transfers VALUES(1,'TRF-2024-801',4,'Central Armory - Alpha','FOB Echo Outpost','2024-02-10',2,1,6,'Routine rotation to support forward patrol missions along Sector North.','Completed','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO transfers VALUES(2,'TRF-2024-802',7,'Central Armory - Alpha','FOB Echo Outpost','2024-02-18',2,1,2,'Aerial reconnaissance drone kit requisition for perimeter surveillance.','Completed','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO transfers VALUES(3,'TRF-2024-803',2,'Motor Pool Alpha','Forward Depot Delta','2024-03-05',4,1,NULL,'Heavy logistical support transfer to replenish FOB winter ammunition supply.','In Transit','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO transfers VALUES(4,'TRF-2024-804',9,'Central Armory - Alpha','Special Operations Task Unit','2024-03-12',3,2,6,'Armament allotment for upcoming live-fire training exercise.','Approved','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO transfers VALUES(5,'TRF-2024-805',12,'Motor Pool Alpha','Sector 7 Comm Center','2024-03-15',2,NULL,4,'Auxiliary backup power supply relocation request for comms tower upgrade.','Pending','2026-09-30 22:29:56','2026-09-30 22:29:56');
INSERT INTO transfers VALUES(6,'TRF-2026-142',13,'Hangar Bay 4','Sector 7 Outpost','2024-04-01',1,NULL,NULL,'Urgent aerial border surveillance allotment.','Pending','2026-09-30 22:41:44','2026-09-30 22:41:44');
CREATE TABLE notifications (
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
INSERT INTO notifications VALUES(1,1,'Transfer Request Pending Approval','Major Vance requested transfer TRF-2024-805 (Tactical 60kW Generator) to Sector 7.','warning',0,'/transfers','2026-09-30 22:29:56');
INSERT INTO notifications VALUES(2,1,'Maintenance Work Order In Progress','Work order WO-2024-001 on Scout Recon Buggy is undergoing front strut repair.','info',0,'/maintenance','2026-09-30 22:29:56');
INSERT INTO notifications VALUES(3,2,'Asset Assigned to Personnel','Cougar MRAP Armored Patrol (AST-1004) successfully transferred to FOB Echo.','success',1,'/assets/4','2026-09-30 22:29:56');
INSERT INTO notifications VALUES(4,3,'Quarterly Armory Calibration Due','Optics and night vision batches require quarterly optical check before end of month.','warning',0,'/equipment','2026-09-30 22:29:56');
INSERT INTO notifications VALUES(5,1,'System Security Audit Completed','Automated logistics integrity scan completed with zero discrepancies logged.','info',1,'/settings','2026-09-30 22:29:56');
INSERT INTO notifications VALUES(6,NULL,'New Transfer Request Initiated','Requisition TRF-2026-142 awaiting Command sign-off to relocate asset #13.','warning',1,'/transfers','2026-09-30 22:41:44');
CREATE TABLE activity_logs (
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
INSERT INTO activity_logs VALUES(1,1,'col_mitchell','LOGIN','Authentication','Admin login successful from Command HQ secure workstation.','10.0.1.45','2026-09-30 22:29:56');
INSERT INTO activity_logs VALUES(2,1,'col_mitchell','APPROVE_TRANSFER','Transfers','Approved transfer TRF-2024-804 for M4A1 SOPMOD tactical carbines.','10.0.1.45','2026-09-30 22:29:56');
INSERT INTO activity_logs VALUES(3,2,'maj_vance','UPDATE_ASSET','Assets','Updated condition state of Scout Rapid Recon Buggy to Under Maintenance.','10.0.2.19','2026-09-30 22:29:56');
INSERT INTO activity_logs VALUES(4,3,'sgt_miller','CREATE_MAINTENANCE','Maintenance','Logged work order WO-2024-002 for Barrett M107A1 sniper inspection.','10.0.3.82','2026-09-30 22:29:56');
INSERT INTO activity_logs VALUES(5,1,'col_mitchell','CREATE_PERSONNEL','Personnel','Registered Corporal Chloe Bennett to Tactical Medical Evacuation.','10.0.1.45','2026-09-30 22:29:56');
INSERT INTO activity_logs VALUES(6,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 22:31:11');
INSERT INTO activity_logs VALUES(7,2,'maj_vance','LOGIN_SUCCESS','Authentication','Logged in successfully as [Manager]','::1','2026-09-30 22:31:19');
INSERT INTO activity_logs VALUES(8,3,'sgt_miller','LOGIN_SUCCESS','Authentication','Logged in successfully as [Staff]','::1','2026-09-30 22:31:19');
INSERT INTO activity_logs VALUES(9,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 22:41:34');
INSERT INTO activity_logs VALUES(10,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 22:41:44');
INSERT INTO activity_logs VALUES(11,1,'col_mitchell','CREATE_ASSET','Assets','Registered asset [AST-6604]: T-900 Advanced Combat Recon Drone (Surveillance) into FOB Alpha Flight Line','::1','2026-09-30 22:41:44');
INSERT INTO activity_logs VALUES(12,1,'col_mitchell','UPDATE_ASSET','Assets','Updated asset record #13 [AST-6604]','::1','2026-09-30 22:41:44');
INSERT INTO activity_logs VALUES(13,1,'col_mitchell','CREATE_TRANSFER','Transfers','Requested transfer [TRF-2026-142] from Hangar Bay 4 to Sector 7 Outpost','::1','2026-09-30 22:41:44');
INSERT INTO activity_logs VALUES(14,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 22:43:53');
INSERT INTO activity_logs VALUES(15,1,'col_mitchell','LOGOUT','Authentication','User terminated session.','::1','2026-09-30 22:44:14');
INSERT INTO activity_logs VALUES(16,2,'maj_vance','LOGIN_SUCCESS','Authentication','Logged in successfully as [Manager]','::1','2026-09-30 22:44:20');
INSERT INTO activity_logs VALUES(17,3,'sgt_miller','LOGIN_SUCCESS','Authentication','Logged in successfully as [Staff]','::1','2026-09-30 22:51:43');
INSERT INTO activity_logs VALUES(18,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 22:52:32');
INSERT INTO activity_logs VALUES(19,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 23:03:29');
INSERT INTO activity_logs VALUES(20,3,'sgt_miller','LOGOUT','Authentication','User terminated session.','::1','2026-09-30 23:03:49');
INSERT INTO activity_logs VALUES(21,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 23:04:40');
INSERT INTO activity_logs VALUES(22,1,'col_mitchell','LOGOUT','Authentication','User terminated session.','::1','2026-09-30 23:04:44');
INSERT INTO activity_logs VALUES(23,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 23:04:48');
INSERT INTO activity_logs VALUES(24,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 23:11:23');
INSERT INTO activity_logs VALUES(25,1,'col_mitchell','CREATE_USER','Users','Provisioned account [test_operator] with role [Staff]','::1','2026-09-30 23:11:24');
INSERT INTO activity_logs VALUES(26,1,'col_mitchell','UPDATE_USER','Users','Updated user #5 permissions / status','::1','2026-09-30 23:11:24');
INSERT INTO activity_logs VALUES(27,1,'col_mitchell','DELETE_USER','Users','Revoked user account #5 (test_operator)','::1','2026-09-30 23:11:24');
INSERT INTO activity_logs VALUES(28,1,'col_mitchell','LOGOUT','Authentication','User terminated session.','::1','2026-09-30 23:12:12');
INSERT INTO activity_logs VALUES(29,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 23:12:18');
INSERT INTO activity_logs VALUES(30,1,'col_mitchell','LOGOUT','Authentication','User terminated session.','::1','2026-09-30 23:13:46');
INSERT INTO activity_logs VALUES(31,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 23:13:48');
INSERT INTO activity_logs VALUES(32,6,'test_officer','REGISTER_SUCCESS','Authentication','New personnel [test_officer] enlisted with rank [Captain] and service ID [MIL-45875]','::1','2026-09-30 23:20:33');
INSERT INTO activity_logs VALUES(33,6,'test_officer','LOGIN_SUCCESS','Authentication','Logged in successfully as [Manager]','::1','2026-09-30 23:20:42');
INSERT INTO activity_logs VALUES(34,1,'col_mitchell','LOGOUT','Authentication','User terminated session.','::1','2026-09-30 23:22:53');
INSERT INTO activity_logs VALUES(35,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 23:23:38');
INSERT INTO activity_logs VALUES(36,1,'col_mitchell','LOGOUT','Authentication','User terminated session.','::1','2026-09-30 23:23:45');
INSERT INTO activity_logs VALUES(37,7,'ayankadri','REGISTER_SUCCESS','Authentication','New personnel [ayankadri] enlisted with rank [Lieutenant] and service ID [MIL-73336]','::1','2026-09-30 23:24:58');
INSERT INTO activity_logs VALUES(38,7,'ayankadri','LOGIN_SUCCESS','Authentication','Logged in successfully as [Staff]','::1','2026-09-30 23:25:08');
INSERT INTO activity_logs VALUES(39,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 23:29:46');
INSERT INTO activity_logs VALUES(40,1,'col_mitchell','LOGIN_SUCCESS','Authentication','Logged in successfully as [Admin]','::1','2026-09-30 23:33:00');
INSERT INTO activity_logs VALUES(41,1,'col_mitchell','LOGOUT','Authentication','User terminated session.','::1','2026-09-30 23:33:17');
INSERT INTO activity_logs VALUES(42,8,'Ayan Kadri','REGISTER_SUCCESS','Authentication','New personnel [Ayan Kadri] enlisted with rank [Lieutenant] and service ID [MIL-67652]','::1','2026-09-30 23:34:33');
INSERT INTO activity_logs VALUES(43,8,'Ayan Kadri','LOGIN_SUCCESS','Authentication','Logged in successfully as [Staff]','::1','2026-09-30 23:34:39');
PRAGMA writable_schema=ON;
CREATE TABLE IF NOT EXISTS sqlite_sequence(name,seq);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('users',8);
INSERT INTO sqlite_sequence VALUES('personnel',8);
INSERT INTO sqlite_sequence VALUES('assets',13);
INSERT INTO sqlite_sequence VALUES('vehicles',4);
INSERT INTO sqlite_sequence VALUES('equipment',4);
INSERT INTO sqlite_sequence VALUES('maintenance',5);
INSERT INTO sqlite_sequence VALUES('transfers',6);
INSERT INTO sqlite_sequence VALUES('notifications',6);
INSERT INTO sqlite_sequence VALUES('activity_logs',43);
PRAGMA writable_schema=OFF;
COMMIT;
