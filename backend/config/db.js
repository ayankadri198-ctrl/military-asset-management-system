const mysql = require('mysql2/promise');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let activeClient = 'none';
let mysqlPool = null;
let sqliteDb = null;

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'military_assets_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
};

const DB_MODE = (process.env.DB_MODE || 'auto').toLowerCase();

/**
 * Initialize SQLite fallback instance
 */
function initSqlite() {
  const possibleDirs = [
    process.env.DB_DIR,
    path.resolve(__dirname, '../database'),
    path.resolve(__dirname, '../../database'),
    path.resolve(process.cwd(), 'database'),
    path.resolve(process.cwd(), '../database')
  ].filter(Boolean);

  let dbDir = possibleDirs.find(d => fs.existsSync(d));
  if (!dbDir) {
    dbDir = path.resolve(__dirname, '../../database');
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch {
      dbDir = path.resolve(__dirname, '../database');
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  const dbPath = process.env.DB_PATH || path.join(dbDir, 'military_assets.sqlite');
  sqliteDb = new Database(dbPath);
  sqliteDb.pragma('journal_mode = WAL');
  sqliteDb.pragma('foreign_keys = ON');

  console.log(`[Database] Initialized SQLite local engine at: ${dbPath}`);
  activeClient = 'sqlite';
}

/**
 * Initialize MySQL Connection Pool and Auto-Create Database if needed
 */
async function initMySQL() {
  // First connect without specifying database to ensure database exists
  const tempPool = mysql.createPool({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    waitForConnections: true,
    connectionLimit: 2
  });

  await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  await tempPool.end();

  // Create main pool connected to the target database
  mysqlPool = mysql.createPool(dbConfig);
  // Test connection
  const conn = await mysqlPool.getConnection();
  conn.release();
  console.log(`[Database] Successfully connected to MySQL at ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  activeClient = 'mysql';
}

/**
 * Connect to database according to DB_MODE ('auto', 'mysql', or 'sqlite')
 */
async function connectDB() {
  if (DB_MODE === 'sqlite') {
    initSqlite();
    return;
  }

  try {
    console.log(`[Database] Attempting connection to MySQL (${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database})...`);
    await initMySQL();
  } catch (err) {
    if (DB_MODE === 'mysql') {
      console.error('[Database] CRITICAL: MySQL connection failed and DB_MODE is set strictly to mysql.');
      throw err;
    }

    console.warn(`[Database] NOTICE: Could not connect to MySQL server (${err.message}).`);
    console.warn('[Database] Initiating seamless fallback to embedded SQLite engine for instant college demo availability...');
    initSqlite();
  }
}

/**
 * Universal query interface compatible with mysql2 promise style:
 * const [rows] = await db.query(sql, params);
 */
async function query(sql, params = []) {
  if (activeClient === 'mysql' && mysqlPool) {
    return await mysqlPool.query(sql, params);
  }

  if (activeClient === 'sqlite' && sqliteDb) {
    const trimmed = sql.trim();
    const isSelect = /^SELECT|^PRAGMA|^SHOW|^DESCRIBE/i.test(trimmed);

    // Map MySQL specific functions or types if any
    let transformedSql = trimmed
      .replace(/NOW\(\)/gi, "datetime('now', 'localtime')")
      .replace(/CURRENT_TIMESTAMP\(\)/gi, "datetime('now', 'localtime')")
      .replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT')
      .replace(/INT AUTOINCREMENT/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP/gi, "TEXT DEFAULT (datetime('now', 'localtime'))");

    if (isSelect) {
      const stmt = sqliteDb.prepare(transformedSql);
      const rows = stmt.all(...params);
      return [rows, []];
    } else {
      const stmt = sqliteDb.prepare(transformedSql);
      const info = stmt.run(...params);
      return [
        {
          insertId: Number(info.lastInsertRowid),
          affectedRows: info.changes
        },
        []
      ];
    }
  }

  throw new Error('[Database] Database is not initialized.');
}

module.exports = {
  connectDB,
  query,
  getClient: () => activeClient,
  getPool: () => mysqlPool,
  getSqlite: () => sqliteDb
};
