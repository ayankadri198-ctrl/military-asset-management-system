# Military Asset Management System (MAMS)

A complete, full-stack enterprise-grade web application designed for military asset, armory, and logistics management. Built with a **React.js** frontend, **Node.js / Express.js** REST API backend, and **MySQL** database with automated schema initialization.

> **Security & Compliance Notice:** This is an educational demonstration / college capstone project. All data, equipment models, serial numbers, callsigns, and personnel entries are **strictly fictional and synthetic**. It contains no real military operational information, weapons deployment information, targeting data, or classified records.

---

## 🎖️ System Overview

The Military Asset Management System provides tactical situational awareness and accountability across defense armories, motor pools, and forward operating bases (FOBs).

### Core Features
- **16 Complete Interactive Pages**: Login, Command Dashboard, Asset Management, Add Asset, Edit Asset, Asset Details, Inventory List, Personnel Management, Vehicle Fleet, Specialized Equipment, Depot Maintenance, Logistics Transfers, Audit Reports, Communications & Notifications, User Profile, and System Settings.
- **Dark Military Tactical Aesthetic**: Tailored CSS design system with radar cyan, tactical emerald, warning amber, and crimson indicators, HUD crosshairs, status chips, and responsive mobile drawers.
- **Interactive Data Visualization**: Recharts dashboards for Asset Operational Status (Donut), Category Density (Bar), Maintenance Work Orders (Horizontal Bar), and 6-Month Logistics Activity (Area Trend).
- **Dual-Engine Persistence**: First-class **MySQL** support via connection pooling (`mysql2/promise`) with automatic schema/seed execution, plus transparent embedded **SQLite** fallback for instant zero-configuration demonstrations.
- **Role-Based Access Control (RBAC)**: Enforced clearances for `Admin`, `Manager`, and `Staff` roles with JWT authentication and bcrypt password encryption.
- **Full Real-Time CRUD Operations**: Dynamic asset intake, work order lifecycle management, custody transfers with approvals, and personnel rosters.
- **CSV Data Export & Audit Logging**: One-click manifest downloads and centralized activity logging for every administrative action.

---

## 🔑 Demo Credentials

The login screen includes **1-click quick-fill buttons** for each role:

| Role | Rank & Name | Email | Password | Clearance Level |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Colonel Mitchell | `admin@example.com` | `Admin@123` | Full Command & User Administration |
| **Manager** | Major Vance | `manager@example.com` | `Manager@123` | Logistics & Maintenance Authority |
| **Staff** | Staff Sgt. Miller | `staff@example.com` | `Staff@123` | Armory Intake & Work Order Logging |

---

## 📁 Project Architecture

```
Mangement/
├── package.json                   # Root orchestrator (concurrent dev runners)
├── README.md                      # Complete system documentation
├── database/
│   ├── schema.sql                 # MySQL schema (9 tables, constraints, FKs)
│   ├── seed.sql                   # Synthetic demo dataset & bcrypt hashes
│   └── military_assets.sqlite    # Auto-generated embedded fallback database
├── backend/
│   ├── package.json               # Express dependencies
│   ├── server.js                  # Master Express server & port orchestration
│   ├── .env.example               # Environment variables template
│   ├── .env                       # Active server environment settings
│   ├── config/
│   │   └── db.js                  # Dual-engine connection manager
│   ├── models/
│   │   └── dbInit.js              # Auto schema executor & seed populator
│   ├── middleware/
│   │   ├── auth.js                # JWT verification & RBAC authorization
│   │   └── errorHandler.js        # Global error & activity logger
│   ├── controllers/
│   │   ├── authController.js      # Login, session, password ciphers
│   │   ├── assetController.js     # Master asset CRUD & filters
│   │   ├── personnelController.js # Military personnel roster CRUD
│   │   ├── vehicleController.js   # Fleet mobility & driver assignment
│   │   ├── equipmentController.js # Comms, optics, and UAV telemetry
│   │   ├── maintenanceController.js# Work orders & component repairs
│   │   ├── transferController.js  # Base relocation & custody approvals
│   │   ├── reportController.js    # Financial valuations & CSV exports
│   │   ├── notificationController.js# System alerts & signals
│   │   ├── userController.js      # Admin account provisioning
│   │   └── dashboardController.js # KPI aggregations & chart metrics
│   └── routes/                    # Express REST route handlers
└── frontend/
    ├── package.json               # Vite + React 18 dependencies
    ├── vite.config.js             # Vite config with API proxy
    ├── index.html                 # Tactical typography & meta headers
    └── src/
        ├── main.jsx               # React entry point
        ├── App.jsx                # Router with 16 pages & ProtectedRoute
        ├── index.css              # Military HUD design system & variables
        ├── components/
        │   ├── Sidebar.jsx        # Collapsible military navigation
        │   ├── Navbar.jsx         # Status indicators, quick search & alerts
        │   ├── Modal.jsx          # Tactical dialog window
        │   ├── ConfirmDialog.jsx  # Security action confirmation
        │   ├── StatCard.jsx       # HUD metric card with color accents
        │   ├── StatusBadge.jsx    # Glowing readiness badge
        │   ├── Pagination.jsx     # Technical pagination toolbar
        │   ├── Toast.jsx          # Signal notification alerts
        │   └── ProtectedRoute.jsx # RBAC authentication guard
        ├── layouts/
        │   └── MainLayout.jsx     # Application frame layout
        ├── pages/                 # All 16 complete pages
        └── services/              # Axios REST API connectors
```

---

## ⚡ Quick Start Guide (Exact Commands)

### Prerequisites
- **Node.js** (v18 or higher recommended; verified on v24.x)
- **npm** (v9 or higher)
- **MySQL Server** (optional — system will automatically connect if running, or gracefully use the included high-performance embedded SQLite database so the app works immediately out-of-the-box!)

---

### Step 1: Install Dependencies

From the project root directory (`/Users/ayankadri/Desktop/Mangement`):

```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install

# 3. Install frontend dependencies
cd ../frontend && npm install

# 4. Return to root
cd ..
```

---

### Step 2: Configure MySQL (Optional)

If you wish to run with a local MySQL server:

1. Start your MySQL service:
   ```bash
   # On macOS via Homebrew:
   brew services start mysql
   # On Linux:
   sudo systemctl start mysql
   # On Windows:
   net start MySQL
   ```

2. Configure credentials in `backend/.env`:
   ```ini
   PORT=5001
   NODE_ENV=development
   JWT_SECRET=super_secret_military_jwt_key_2026_defense_grade
   JWT_EXPIRES_IN=24h

   # MySQL Configuration
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=military_assets_db
   DB_MODE=auto
   ```

---

### Step 3: Create the Database & Seed Data

The backend automatically creates the database and populates seed data on first boot. 

If you prefer to initialize the MySQL database manually via CLI:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

---

### Step 4: Start the Backend Server

```bash
cd backend
npm start
```
*The backend API will start on **`http://localhost:5001`**.*  
*Health Check endpoint: **`http://localhost:5001/api/health`**.*

---

### Step 5: Start the Frontend Application

Open a new terminal tab:
```bash
cd frontend
npm run dev
```
*The React frontend will start on **`http://localhost:5173`**.*

---

### Run Both Concurrently (Alternative Single Command)
From the project root directory:
```bash
npm run dev
```

---

## 📑 16 System Pages Overview

1. **Login Page (`/login`)**: Secure military terminal with instant 1-click demo credential selector for Admin, Manager, and Staff accounts.
2. **Dashboard (`/dashboard`)**: 6 KPI metric cards, 4 interactive Recharts diagrams, recent audit feed, and quick-action shortcuts.
3. **Asset Management (`/assets`)**: Armory master table with search, category filters, status chips, pagination, CSV export, and deletion dialogs.
4. **Add Asset (`/assets/new`)**: Commissioning form with code generator, serial number validator, and personnel custodian assignment.
5. **Edit Asset (`/assets/edit/:id`)**: Form for modifying technical specs, locations, and maintenance intervals.
6. **Asset Details (`/assets/:id`)**: Technical dossier layout with RFID barcode representation, custodian profile, maintenance work order history, and relocation logs.
7. **Inventory List (`/inventory`)**: Stock level monitoring with low-reserve alerts (≤ 2 units) and category groups.
8. **Personnel Management (`/personnel`)**: Officer registry with service IDs, rank, security clearances, and assigned gear counts.
9. **Vehicle Management (`/vehicles`)**: Motor pool fleet with armor standards, mileage counters, fuel specs, and driver assignment.
10. **Equipment Management (`/equipment`)**: Comms, thermal night optics, UAV drones, battery health monitors, and calibration tracking.
11. **Maintenance Records (`/maintenance`)**: Work orders with diagnostic scope, technician names, parts replaced, and automatic asset status synchronization.
12. **Asset Transfer (`/transfers`)**: Logistics relocation orders with approval lifecycle (`Pending` → `Approved` → `In Transit` → `Completed`) and automatic base/custodian updates upon delivery.
13. **Reports & Analytics (`/reports`)**: Valuation statistics, readiness ratios, and one-click CSV manifest downloads.
14. **Notifications (`/notifications`)**: Central alert feed with severity indicators (Critical, Warning, Info, Success) and direct links.
15. **User Profile (`/profile`)**: Operator dossier, security clearance privileges matrix, and bcrypt password cipher update form.
16. **Settings (`/settings`)**: DEFCON threat posture selector, database architecture diagnostics, and administrative account provisioning.

---

## 📡 REST API Documentation

All protected endpoints require an `Authorization: Bearer <JWT>` header.

### Authentication
- `POST /api/auth/login`: Authenticate email & password. Returns JWT token and sanitized profile.
- `GET /api/auth/me`: Retrieve current user profile.
- `POST /api/auth/logout`: Invalidate session and log logout audit.
- `PUT /api/auth/change-password`: Update password cipher with bcrypt hash.

### Assets
- `GET /api/assets`: List assets with search, filters (`type`, `status`, `location`), pagination.
- `GET /api/assets/:id`: Retrieve single asset with maintenance and transfer history.
- `POST /api/assets`: Commission new asset (Admin / Manager).
- `PUT /api/assets/:id`: Update asset record (Admin / Manager).
- `DELETE /api/assets/:id`: Decommission asset (Admin).

### Personnel
- `GET /api/personnel`: List personnel with assigned asset counts.
- `GET /api/personnel/:id`: Retrieve personnel dossier and custody list.
- `POST /api/personnel`: Enroll new officer (Admin / Manager).
- `PUT /api/personnel/:id`: Update personnel details (Admin / Manager).
- `DELETE /api/personnel/:id`: Discharge personnel (Admin).

### Vehicles
- `GET /api/vehicles`: List vehicle fleet with driver names and readiness.
- `GET /api/vehicles/:id`: Get vehicle specifications.
- `POST /api/vehicles`: Commission vehicle (Admin / Manager).
- `PUT /api/vehicles/:id`: Update vehicle status (Admin / Manager).
- `DELETE /api/vehicles/:id`: Decommission vehicle (Admin).

### Equipment
- `GET /api/equipment`: List tactical equipment with battery health and calibration dates.
- `POST /api/equipment`: Catalog new gear (Admin / Manager).
- `PUT /api/equipment/:id`: Update equipment state (Admin / Manager).
- `DELETE /api/equipment/:id`: Decommission equipment (Admin).

### Maintenance
- `GET /api/maintenance`: List all maintenance work orders.
- `POST /api/maintenance`: Open new work order (automatically sets asset to `Under Maintenance`).
- `PUT /api/maintenance/:id`: Update work order status (marking `Completed` restores asset to `Available`).
- `DELETE /api/maintenance/:id`: Delete work order (Admin / Manager).

### Transfers
- `GET /api/transfers`: List asset transfer orders.
- `POST /api/transfers`: Request transfer.
- `PUT /api/transfers/:id/status`: Update status (`Approved`, `In Transit`, `Completed`). When `Completed`, automatically updates the asset's location and custodian.

### Reports & Intelligence
- `GET /api/reports/summary`: Aggregate analytics on valuation, readiness, and maintenance spend.
- `GET /api/reports/export?module=assets`: Export structured dataset for CSV generation.

### Notifications & Audits
- `GET /api/notifications`: Get system notifications and unread count.
- `PUT /api/notifications/:id/read`: Mark single notification read.
- `PUT /api/notifications/read-all`: Mark all notifications read.
- `GET /api/dashboard/stats`: Unified KPI packet with chart datasets.
- `GET /api/activity-logs`: System audit trail.

---

## 🛡️ License & Academic Integrity

Developed as a demonstration full-stack software engineering project. All assets and operational data are strictly fictional.
