import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import type { User } from "./types";

const globalDb = globalThis as unknown as { vocalbeeDb?: DatabaseSync };
export function demoEnabled() { return process.env.VOCALBEE_DEMO === "true" || (process.env.VOCALBEE_DEMO !== "false" && process.env.NODE_ENV !== "production"); }
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, stored: string) {
  const [salt, key] = stored.split(":");
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(key, "hex"));
}
export function tokenHash(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function getDb(): DatabaseSync {
  if (globalDb.vocalbeeDb) return globalDb.vocalbeeDb;
  const dir = resolve(process.env.VOCALBEE_DATA_DIR || "data");
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(join(dir, "vocalbee.sqlite"));
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;
    PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL, owner_id TEXT, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS auth_sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS login_failures (username TEXT PRIMARY KEY, count INTEGER NOT NULL, reset_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS progress (user_id TEXT NOT NULL REFERENCES users(id), word_id TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(user_id,word_id));
    CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), day TEXT NOT NULL, kind TEXT NOT NULL, scope TEXT NOT NULL, complete INTEGER NOT NULL DEFAULT 0, data TEXT NOT NULL, UNIQUE(user_id,day,kind,scope));
    CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), session_id TEXT NOT NULL REFERENCES sessions(id), item_id TEXT NOT NULL, created_at TEXT NOT NULL, data TEXT NOT NULL, UNIQUE(session_id,item_id));
    CREATE TABLE IF NOT EXISTS mode_switches (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS experiments (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id), data TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS attempts_user ON attempts(user_id,created_at);
    CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id,complete);
    CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY);
    INSERT OR IGNORE INTO schema_version VALUES (1);
  `);
  const existing = db.prepare("SELECT id,data FROM users WHERE username = 'teacher'").get();
  if (existing && !demoEnabled() && JSON.parse(String(existing.data)).demo) {
    db.close();
    throw new Error("This database contains demo credentials. Use VOCALBEE_DEMO=true for demos, or a new VOCALBEE_DATA_DIR with VOCALBEE_ADMIN_PASSWORD for production.");
  }
  if (!existing) {
    const demo = demoEnabled();
    const password = demo ? "VocalBee2026!" : process.env.VOCALBEE_ADMIN_PASSWORD;
    if (!password || password.length < 12) { db.close(); throw new Error("Set VOCALBEE_ADMIN_PASSWORD (12+ characters) or VOCALBEE_DEMO=true before starting."); }
    const teacher: User = { id: randomUUID(), username: "teacher", name: "Giáo viên VocalBee", grade: 7, role: "teacher", mode: "adaptive", demo, assignedGroup: null, experimentId: null };
    db.prepare("INSERT INTO users VALUES (?,?,?,?,?)").run(teacher.id, teacher.username, hashPassword(password), null, JSON.stringify(teacher));
    if (demo) for (const grade of [6, 7, 8, 9] as const) {
      const student: User = { id: randomUUID(), username: `student${grade}`, name: `Bạn học lớp ${grade}`, grade, role: "student", mode: "adaptive", demo: true, assignedGroup: null, experimentId: null };
      db.prepare("INSERT INTO users VALUES (?,?,?,?,?)").run(student.id, student.username, hashPassword("VocalBee2026!"), teacher.id, JSON.stringify(student));
    }
  }
  globalDb.vocalbeeDb = db;
  return db;
}
export function transaction<T>(fn: () => T): T {
  const db = getDb(); db.exec("BEGIN IMMEDIATE");
  try { const result = fn(); db.exec("COMMIT"); return result; }
  catch (error) { db.exec("ROLLBACK"); throw error; }
}
export function getJson<T>(sql: string, ...params: (string | number)[]): T | null {
  const row = getDb().prepare(sql).get(...params) as { data: string } | undefined;
  return row ? JSON.parse(row.data) as T : null;
}
export function allJson<T>(sql: string, ...params: (string | number)[]): T[] {
  return (getDb().prepare(sql).all(...params) as { data: string }[]).map(row => JSON.parse(row.data) as T);
}
export function getUser(id: string) { return getJson<User>("SELECT data FROM users WHERE id=?", id); }
export function saveUser(user: User) { getDb().prepare("UPDATE users SET data=? WHERE id=?").run(JSON.stringify(user), user.id); }
