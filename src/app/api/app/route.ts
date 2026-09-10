import { NextRequest, NextResponse } from "next/server";
import { authenticate, checkOrigin, errorResponse } from "@/lib/http";
import { answerQuestion, AppError, assignStudents, changeMode, changePhase, createExperiment, createStudent, exportCsv, getState, hintQuestion, importStudents, nextQuestion, resetStudentPassword, startSession } from "@/lib/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const user = authenticate(request);
    if (request.nextUrl.searchParams.has("export")) {
      const kind = request.nextUrl.searchParams.get("export")!;
      if (!["attempts", "switches", "summary"].includes(kind)) throw new AppError("Loại báo cáo không hợp lệ.");
      const csv = exportCsv(user, kind, request.nextUrl.searchParams.get("experiment") || undefined);
      return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="vocalbee-${kind}.csv"`, "Cache-Control": "no-store" } });
    }
    return NextResponse.json(getState(user), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
export async function POST(request: NextRequest) {
  try {
    checkOrigin(request);
    const user = authenticate(request);
    const body = await request.json();
    if (JSON.stringify(body).length > 20000) throw new AppError("Yêu cầu quá lớn.", 413);
    switch (body.action) {
      case "mode": changeMode(user, body.mode); break;
      case "start": return NextResponse.json({ session: startSession(user, body.kind ?? "daily", body.topic) });
      case "answer":
        if (typeof body.answer !== "string" || body.answer.length > 200 || !body.answer.trim()) throw new AppError("Hãy nhập hoặc chọn một đáp án.");
        return NextResponse.json(answerQuestion(user, body));
      case "next": return NextResponse.json({ session: nextQuestion(user, body.sessionId) });
      case "hint": return NextResponse.json({ session: hintQuestion(user, body.sessionId) });
      case "createStudent": createStudent(user, body); break;
      case "createExperiment": createExperiment(user, body); break;
      case "importStudents": return NextResponse.json({ count: importStudents(user, body.csv) });
      case "resetPassword": resetStudentPassword(user, body.userId, body.password); break;
      case "assign":
        if (!Array.isArray(body.studentIds) || !body.studentIds.every((id: unknown) => typeof id === "string")) throw new AppError("Danh sách học sinh không hợp lệ.");
        assignStudents(user, body.experimentId, body.studentIds); break;
      case "phase": changePhase(user, body.experimentId, body.phase); break;
      default: throw new AppError("Thao tác không hợp lệ.");
    }
    return NextResponse.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
