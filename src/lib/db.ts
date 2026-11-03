import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const DB_PATH = join(process.env.DATA_DIR || join(process.cwd(), "data"), "kryptobase.db");
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

let db: SqlJsDatabase | null = null;

function getDb(): SqlJsDatabase {
  if (db) return db;
  throw new Error("Database not initialized. Call initDb() first.");
}

let initPromise: Promise<SqlJsDatabase> | null = null;

export async function initDb(): Promise<SqlJsDatabase> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const SQL = await initSqlJs();

    if (existsSync(DB_PATH)) {
      const buffer = readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_name TEXT DEFAULT 'Main Wallet 1',
        seed_hash TEXT UNIQUE,
        email TEXT DEFAULT '',
        password TEXT NOT NULL,
        wallet_address TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try { db.run("ALTER TABLE users ADD COLUMN seed_hash TEXT"); } catch {}
    try { db.run("ALTER TABLE users ADD COLUMN wallet_name TEXT DEFAULT 'Main Wallet 1'"); } catch {}
    db.run("CREATE INDEX IF NOT EXISTS idx_users_seed_hash ON users(seed_hash)");

    db.run(`
      CREATE TABLE IF NOT EXISTS balances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        crypto_id TEXT NOT NULL,
        amount REAL DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, crypto_id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS wallet_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        crypto_id TEXT NOT NULL,
        address TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, crypto_id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER,
        receiver_id INTEGER NOT NULL,
        crypto_id TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )
    `);

    persist();
    return db;
  })();

  return initPromise;
}

export function persist() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(DB_PATH, buffer);
}

export function run(sql: string, params: unknown[] = []) {
  const d = getDb();
  d.run(sql, params as never[]);
  persist();
}

export function get<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  const d = getDb();
  const stmt = d.prepare(sql);
  stmt.bind(params as never[]);
  if (stmt.step()) {
    const row = stmt.getAsObject() as T;
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

export function all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const d = getDb();
  const results: T[] = [];
  const stmt = d.prepare(sql);
  stmt.bind(params as never[]);
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}
