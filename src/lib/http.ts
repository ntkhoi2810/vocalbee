import { NextRequest, NextResponse } from "next/server";
import { getDb, getUser, tokenHash } from "./db";
import { AppError } from "./service";
import type { User } from "./types";

export function checkOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || new URL(origin).host !== request.headers.get("host")) throw new AppError("Yêu cầu không cùng nguồn.", 403);
}
export function authenticate(request: NextRequest): User {
  const token = request.cookies.get("vocalbee_session")?.value;
  if (!token) throw new AppError("Vui lòng đăng nhập.", 401);
  const row = getDb().prepare("SELECT user_id FROM auth_sessions WHERE token=? AND expires_at>?").get(tokenHash(token), new Date().toISOString()) as { user_id: string } | undefined;
  const user = row ? getUser(row.user_id) : null;
  if (!user) throw new AppError("Phiên đăng nhập đã hết hạn.", 401);
  return user;
}
export function errorResponse(error: unknown) {
  if (error instanceof AppError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof SyntaxError || error instanceof TypeError) return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  console.error(error);
  return NextResponse.json({ error: "Không thể xử lý yêu cầu. Hãy kiểm tra cấu hình server hoặc thử lại." }, { status: 500 });
}
