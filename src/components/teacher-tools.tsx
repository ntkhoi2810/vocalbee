"use client";

import { useState } from "react";
import { ArrowDownToLine, FileUp, KeyRound, LoaderCircle } from "lucide-react";
import type { AppState, StudentSummary } from "@/lib/types";

export function TeacherTools({ state, reload }: { state: AppState; reload: () => Promise<void> }) {
  const [csv, setCsv] = useState(""); const [studentId, setStudentId] = useState(""); const [password, setPassword] = useState("");
  const [experimentId, setExperimentId] = useState(""); const [includeDemo, setIncludeDemo] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const teacher = state.teacher!;
  const execute = async (body: Record<string, unknown>) => {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/app", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      await reload(); setNotice(body.action === "importStudents" ? `Đã nhập ${result.count} tài khoản. Dữ liệu hợp lệ được lưu cùng một giao dịch.` : "Đã đặt lại mật khẩu và kết thúc các phiên đăng nhập cũ.");
      setCsv(""); setPassword("");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  };
  const members = teacher.students.filter(s => s.experimentId === experimentId && (includeDemo || !s.demo));
  const average = (students: StudentSummary[], value: (s: StudentSummary) => number | null) => {
    const values = students.map(value).filter((v): v is number => v !== null);
    return values.length ? `${(values.reduce((s,n) => s+n, 0) / values.length).toFixed(1)} (n=${values.length})` : "—";
  };
  return <div className="teacher-tools">
    <div className="summary-export"><a className="button secondary small" href={`/api/app?export=summary${experimentId ? `&experiment=${experimentId}` : ""}`}><ArrowDownToLine size={16} /> Xuất tổng hợp kết quả CSV</a></div>
    <section className="card research-summary"><div className="section-title"><h2>So sánh theo nhóm ban đầu</h2></div><p className="muted small-text">Chọn một đợt để xem kết quả cùng khối. Thang điểm 100; dấu “—” nghĩa là chưa đủ dữ liệu.</p><div className="summary-controls"><label>Đợt nghiên cứu<select value={experimentId} onChange={e => setExperimentId(e.target.value)}><option value="">Chọn một đợt</option>{teacher.experiments.map(exp => <option key={exp.id} value={exp.id}>{exp.name} · Lớp {exp.grade}</option>)}</select></label><label className="checkbox-label"><input type="checkbox" checked={includeDemo} onChange={e => setIncludeDemo(e.target.checked)} /> Bao gồm dữ liệu demo</label></div>{experimentId ? <div className="table-wrap"><table><thead><tr><th>Nhóm</th><th>Học sinh</th><th>Pre-test</th><th>Post-test</th><th>Tăng điểm cặp</th><th>Retention</th><th>Lỗi lặp lại</th><th>Ngày hoàn thành TB</th></tr></thead><tbody>{(["fixed", "adaptive"] as const).map(mode => {
      const students = members.filter(s => s.assignedGroup === mode);
      const opportunities = students.reduce((sum,s) => sum+s.repeatOpportunities, 0);
      const errors = students.reduce((sum,s) => sum+s.repeatErrors, 0);
      return <tr key={mode}><td><strong>{mode === "fixed" ? "A · Cố định" : "B · Thích ứng"}</strong></td><td>{students.length}</td><td>{average(students,s => s.pre)}</td><td>{average(students,s => s.post)}</td><td>{average(students,s => s.pre !== null && s.post !== null ? s.post - s.pre : null)}</td><td>{average(students,s => s.retention)}</td><td>{opportunities ? `${Math.round(errors/opportunities*100)}% (${errors}/${opportunities})` : "—"}</td><td>{average(students,s => s.completedDays)}</td></tr>;
    })}</tbody></table></div> : <p className="page-note">Không gộp điểm của nhiều khối vì bộ từ và độ khó khác nhau.</p>}<p className="page-note">Tăng điểm chỉ dùng học sinh có đủ pre/post. Lỗi lặp lại: sai ở lần gặp tiếp theo của cùng từ và dạng bài vào ngày khác, sau một lỗi trước đó. Lượt luyện lại cùng ngày không nằm trong mẫu số. Đây là thống kê mô tả, chưa phải kiểm định ý nghĩa thống kê.</p></section>
    <div className="utility-grid"><section className="card utility-card"><span className="topic-mini mint"><FileUp size={21} /></span><h3>Nhập danh sách học sinh</h3><p>CSV UTF-8, tối đa 200 học sinh. Toàn bộ danh sách được kiểm tra trước khi lưu; nếu một dòng lỗi, không tạo tài khoản nào.</p><a className="text-button" href="/students-template.csv" download><ArrowDownToLine size={15} /> Tải CSV mẫu</a><label>Chọn tệp CSV<input type="file" accept=".csv,text/csv" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 60000) { setError("Tệp quá lớn. Chỉ nhận CSV tối đa 60 KB."); return; } try { setCsv(await file.text()); setError(""); } catch { setError("Không thể đọc tệp CSV."); } }} /></label><label>Nội dung CSV<textarea rows={5} value={csv} onChange={e => setCsv(e.target.value)} maxLength={18000} placeholder={'username,name,grade,password\nlop7_hs01,Học sinh 01,7,MatKhauRieng123!'} /></label><button className="button primary" disabled={busy || !csv.trim()} onClick={() => execute({ action: "importStudents", csv })}>{busy ? <LoaderCircle size={17} className="spin" /> : <FileUp size={17} />} Nhập tài khoản</button></section>
    <section className="card utility-card"><span className="topic-mini lavender"><KeyRound size={21} /></span><h3>Hỗ trợ đăng nhập</h3><p>Cấp lại mật khẩu cho học sinh của bạn. Lịch sử học, nhóm nghiên cứu và tiến độ vẫn được giữ nguyên.</p><form onSubmit={e => { e.preventDefault(); execute({ action: "resetPassword", userId: studentId, password }); }}><label>Học sinh<select value={studentId} required onChange={e => setStudentId(e.target.value)}><option value="">Chọn học sinh</option>{teacher.students.map(s => <option key={s.id} value={s.id}>{s.username} · {s.name}</option>)}</select></label><label>Mật khẩu mới<input type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} /></label><button className="button secondary" type="submit" disabled={busy || !studentId}>Đặt lại mật khẩu <KeyRound size={16} /></button></form><div className="info-note">CSV mẫu chứa mật khẩu minh họa. Thay bằng mật khẩu riêng trước khi cấp cho học sinh.</div></section></div>
    {error && <div className="alert error" role="alert">{error}</div>}{notice && <div className="info-note" role="status">{notice}</div>}
  </div>;
}
