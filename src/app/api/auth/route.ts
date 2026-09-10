import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { demoEnabled, getDb, tokenHash, verifyPassword } from "@/lib/db";
import { AppError } from "@/lib/service";
import { checkOrigin, errorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ demo: demoEnabled() }); }
export async function POST(request: NextRequest) {
  try {
    checkOrigin(request);
    const body = await request.json();
    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!/^[a-z0-9_-]{3,32}$/.test(username) || password.length > 128) throw new AppError("Tài khoản hoặc mật khẩu không đúng.", 401);
    const db = getDb();
    const limit = db.prepare("SELECT count,reset_at FROM login_failures WHERE username=?").get(username) as { count: number; reset_at: number } | undefined;
    if (limit && limit.reset_at > Date.now() && limit.count >= 10) throw new AppError("Bạn đã thử quá nhiều lần. Hãy thử lại sau 15 phút.", 429);
    const row = db.prepare("SELECT id,password FROM users WHERE username=?").get(username) as { id: string; password: string } | undefined;
    if (!row || !verifyPassword(password, row.password)) {
      const count = limit && limit.reset_at > Date.now() ? limit.count + 1 : 1;
      db.prepare("INSERT INTO login_failures VALUES (?,?,?) ON CONFLICT(username) DO UPDATE SET count=excluded.count,reset_at=excluded.reset_at").run(username, count, limit && limit.reset_at > Date.now() ? limit.reset_at : Date.now() + 900000);
      throw new AppError("Tài khoản hoặc mật khẩu không đúng.", 401);
    }
    db.prepare("DELETE FROM login_failures WHERE username=?").run(username);
    db.prepare("DELETE FROM auth_sessions WHERE expires_at<?").run(new Date().toISOString());
    const token = randomBytes(32).toString("hex");
    db.prepare("INSERT INTO auth_sessions VALUES (?,?,?)").run(tokenHash(token), row.id, new Date(Date.now() + 7 * 86400000).toISOString());
    const response = NextResponse.json({ ok: true });
    response.cookies.set("vocalbee_session", token, { httpOnly: true, sameSite: "lax", secure: process.env.VOCALBEE_SECURE_COOKIE === "true", path: "/", maxAge: 7 * 86400 });
    return response;
  } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: NextRequest) {
  try {
    checkOrigin(request);
    const token = request.cookies.get("vocalbee_session")?.value;
    if (token) getDb().prepare("DELETE FROM auth_sessions WHERE token=?").run(tokenHash(token));
    const response = NextResponse.json({ ok: true }); response.cookies.delete("vocalbee_session"); return response;
  } catch (error) { return errorResponse(error); }
}
