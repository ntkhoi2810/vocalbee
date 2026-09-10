import { randomInt, randomUUID } from "node:crypto";
import { allJson, getDb, getJson, getUser, hashPassword, saveUser, transaction } from "./db";
import { CONTENT_VERSION, WORD_MAP, WORDS } from "./content";
import { addDays, ALGORITHM_VERSION, csvCell, dayKey, isDue, normalizeAnswer, selectReviews, updateProgress } from "./review";
import type { AppState, ExerciseType, Experiment, Feedback, Grade, Mode, Phase, Progress, Question, SessionView, StudentSummary, User, Word } from "./types";
import { parseCsv } from "./csv";
import { repeatErrors } from "./analytics";

export class AppError extends Error { constructor(message: string, public status = 400) { super(message); } }
interface Item { id: string; wordId: string; type: ExerciseType; reason: string; isNew: boolean; options: string[]; }
interface Session {
  id: string; userId: string; day: string; kind: string; scope: string; mode: Mode;
  items: Item[]; cursor: number; correct: number; feedback: Feedback | null;
  startedAt: string; itemStartedAt: string; hinted: boolean; experimentId: string | null;
  contentVersion: string; algorithmVersion: string;
}
interface Attempt {
  wordId: string; type: ExerciseType; answer: string; correct: boolean; hint: boolean;
  mode: Mode; kind: string; day: string; reason: string; responseTimeMs: number;
  experimentId: string | null; assignedGroup: Mode | null; grade: Grade; demo: boolean;
  algorithmVersion: string; contentVersion: string; score: number; isSameDayRetry: boolean;
}
const now = () => new Date().toISOString();
export const getProgress = (userId: string) => allJson<Progress>("SELECT data FROM progress WHERE user_id=?", userId);
const getExperiment = (user: User) => user.experimentId ? getJson<Experiment>("SELECT data FROM experiments WHERE id=?", user.experimentId) : null;
const getAttempts = (userId: string) => allJson<Attempt>("SELECT data FROM attempts WHERE user_id=? ORDER BY created_at", userId);
const activeSession = (userId: string) => getJson<Session>("SELECT data FROM sessions WHERE user_id=? AND complete=0 ORDER BY rowid DESC LIMIT 1", userId);
const userSessions = (userId: string) => allJson<Session>("SELECT data FROM sessions WHERE user_id=?", userId);
function studentOnly(user: User) { if (user.role !== "student") throw new AppError("Chức năng này dành cho học sinh.", 403); }
function teacherOnly(user: User) { if (user.role !== "teacher") throw new AppError("Bạn không có quyền quản lý thực nghiệm.", 403); }
function safeQuestion(item: Item, session: Session): Question {
  const word = WORD_MAP.get(item.wordId)!;
  const cloze = word.example.replace(new RegExp(`\\b${word.word}\\b`, "i"), "_____");
  const prompt = item.type === "meaning" ? `“${word.word}” có nghĩa là gì?` : item.type === "spelling" ? `Viết từ đã học có nghĩa là “${word.meaning}”.` : `${cloze}\nChọn từ mang nghĩa “${word.meaning}”.`;
  return { id: item.id, wordId: item.wordId, type: item.type, prompt, options: item.options, reason: item.reason, newWord: item.isNew ? word : null, hint: session.hinted ? `${word.word[0]}… · ${word.word.length} chữ cái · ${word.meaning}` : "" };
}
function view(session: Session): SessionView {
  return { id: session.id, mode: session.mode, kind: session.kind, total: session.items.length, answered: session.cursor, correct: session.kind === "daily" || session.cursor >= session.items.length ? session.correct : 0, complete: session.cursor >= session.items.length, question: session.items[session.cursor] ? safeQuestion(session.items[session.cursor], session) : null, feedback: session.feedback };
}
function makeItem(word: Word, type: ExerciseType, reason: string, isNew = false): Item {
  const pool = WORDS.filter(w => w.grade === word.grade && w.id !== word.id);
  // Shuffle on the server and persist choices so reloads cannot reroll a question.
  for (let i = pool.length - 1; i > 0; i--) { const j = randomInt(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const options = type === "spelling" ? [] : [word, ...pool.slice(0, 3)].map(w => type === "meaning" ? w.meaning : w.word);
  for (let i = options.length - 1; i > 0; i--) { const j = randomInt(i + 1); [options[i], options[j]] = [options[j], options[i]]; }
  return { id: randomUUID(), wordId: word.id, type, reason, isNew, options };
}
function saveSession(session: Session) {
  getDb().prepare("UPDATE sessions SET data=?,complete=? WHERE id=?").run(JSON.stringify(session), Number(session.cursor >= session.items.length), session.id);
}
function assertSessionAllowed(user: User, session: Session) {
  if (session.contentVersion !== CONTENT_VERSION || session.algorithmVersion !== ALGORITHM_VERSION) throw new AppError("Phiên này dùng phiên bản nội dung hoặc thuật toán khác. Hãy liên hệ giáo viên để khôi phục đúng phiên bản.", 409);
  const exp = getExperiment(user);
  if (session.experimentId !== user.experimentId) throw new AppError("Phiên học thuộc đợt khác. Hãy tải lại trang.", 409);
  if (!exp) return;
  if (session.kind === "daily" && exp.phase !== "learning") throw new AppError("Đợt thực nghiệm hiện không ở giai đoạn học.", 409);
  if (session.kind !== "daily" && session.kind !== exp.phase) throw new AppError("Bài kiểm tra này đã đóng.", 409);
}
export function startSession(user: User, kind: string, topic?: string): SessionView {
  studentOnly(user);
  return transaction(() => {
    const existing = activeSession(user.id);
    if (existing) { assertSessionAllowed(user, existing); return view(existing); }
    const day = dayKey(); const exp = getExperiment(user);
    if (exp && (exp.contentVersion !== CONTENT_VERSION || exp.algorithmVersion !== ALGORITHM_VERSION)) throw new AppError("Đợt thực nghiệm được khóa ở phiên bản khác. Hãy khôi phục phiên bản đã dùng khi tạo đợt.", 409);
    const assessment = kind !== "daily";
    if (assessment && (!exp || !["baseline", "post", "retention"].includes(kind) || kind !== exp.phase)) throw new AppError("Chưa có bài kiểm tra được mở.");
    if (!assessment && exp && exp.phase !== "learning") throw new AppError("Hãy hoàn thành bài kiểm tra theo giai đoạn giáo viên mở.");
    if (exp && !assessment && !userSessions(user.id).some(s => s.scope === exp.id && s.kind === "baseline" && s.cursor === s.items.length)) throw new AppError("Bạn chưa hoàn thành pre-test. Hãy liên hệ giáo viên.");
    const scope = exp?.id ?? "personal";
    const previous = getJson<Session>("SELECT data FROM sessions WHERE user_id=? AND kind=? AND scope=? AND (?=1 OR day=?)", user.id, kind, scope, Number(assessment), day);
    if (previous) return view(previous);
    const allWords = WORDS.filter(w => w.grade === user.grade);
    const progress = getProgress(user.id);
    let items: Item[];
    if (assessment) {
      // Same 12 target words and exercise types across phases and both modes.
      items = allWords.filter((_, i) => i % 2 === 0).map((w, i) => makeItem(w, (["meaning", "spelling", "usage"] as const)[i % 3], "Bài kiểm tra nghiên cứu"));
    } else {
      const candidates = exp || !topic ? allWords : allWords.filter(w => w.topic === topic);
      const fresh = candidates.filter(w => !progress.some(p => p.wordId === w.id)).slice(0, 5);
      const reviews = selectReviews(progress.filter(p => allWords.some(w => w.id === p.wordId)), user.mode, day, 8);
      items = [
        ...fresh.map(w => makeItem(w, "meaning", "Khám phá từ mới", true)),
        ...reviews.map(r => makeItem(WORD_MAP.get(r.progress.wordId)!, r.type, r.reason)),
      ];
      const usageWords = [...fresh, ...reviews.map(r => WORD_MAP.get(r.progress.wordId)!)].slice(0, 5);
      items.push(...usageWords.map(w => makeItem(w, "usage", "Luyện sử dụng từ trong câu")));
      if (!items.length) throw new AppError("Chủ đề này đã học hết. Hãy chọn Ôn tập hoặc một chủ đề khác.");
    }
    const session: Session = { id: randomUUID(), userId: user.id, day, kind, scope, mode: user.mode, items, cursor: 0, correct: 0, feedback: null, startedAt: now(), itemStartedAt: now(), hinted: false, experimentId: exp?.id ?? null, contentVersion: CONTENT_VERSION, algorithmVersion: ALGORITHM_VERSION };
    getDb().prepare("INSERT INTO sessions (id,user_id,day,kind,scope,data) VALUES (?,?,?,?,?,?)").run(session.id, user.id, day, kind, scope, JSON.stringify(session));
    return view(session);
  });
}
function ownedSession(user: User, id: string): Session {
  const session = getJson<Session>("SELECT data FROM sessions WHERE id=? AND user_id=?", id, user.id);
  if (!session) throw new AppError("Không tìm thấy phiên học.", 404);
  assertSessionAllowed(user, session);
  return session;
}
export function answerQuestion(user: User, data: { sessionId: string; itemId: string; answer: string }): { session: SessionView; feedback: Feedback | null } {
  studentOnly(user);
  return transaction(() => {
    const session = ownedSession(user, data.sessionId);
    const duplicate = getJson<Attempt>("SELECT data FROM attempts WHERE session_id=? AND item_id=?", session.id, data.itemId);
    if (duplicate) return { session: view(session), feedback: session.feedback };
    const item = session.items[session.cursor];
    if (!item || item.id !== data.itemId) throw new AppError("Câu hỏi đã thay đổi. Hãy tải lại phiên học.", 409);
    if (session.feedback) throw new AppError("Hãy chuyển sang câu tiếp theo.", 409);
    const word = WORD_MAP.get(item.wordId)!;
    const expected = item.type === "meaning" ? word.meaning : word.word;
    const variants: Record<string, string[]> = { neighbour: ["neighbor"], practise: ["practice"] };
    const accepted = item.type === "spelling" ? [expected, ...(variants[word.word] ?? [])] : [expected];
    const correct = accepted.some(value => normalizeAnswer(data.answer) === normalizeAnswer(value));
    const day = dayKey();
    const previous = getJson<Progress>("SELECT data FROM progress WHERE user_id=? AND word_id=?", user.id, word.id);
    let score = previous?.score ?? 0;
    if (session.kind === "daily") {
      const updated = updateProgress(previous ?? undefined, { wordId: word.id, day, correct, hint: session.hinted, type: item.type });
      score = updated.score;
      getDb().prepare("INSERT INTO progress VALUES (?,?,?) ON CONFLICT(user_id,word_id) DO UPDATE SET data=excluded.data").run(user.id, word.id, JSON.stringify(updated));
    }
    const attempt: Attempt = { wordId: word.id, type: item.type, answer: data.answer, correct, hint: session.hinted, mode: session.mode, kind: session.kind, day, reason: item.reason, responseTimeMs: Math.max(0, Date.now() - Date.parse(session.itemStartedAt)), experimentId: session.experimentId, assignedGroup: user.assignedGroup, grade: user.grade, demo: user.demo, algorithmVersion: ALGORITHM_VERSION, contentVersion: CONTENT_VERSION, score, isSameDayRetry: previous?.lastDay === day };
    getDb().prepare("INSERT INTO attempts VALUES (?,?,?,?,?,?)").run(randomUUID(), user.id, session.id, item.id, now(), JSON.stringify(attempt));
    if (correct) session.correct++;
    session.cursor++;
    // Assessments intentionally withhold per-question correctness and answer keys.
    session.feedback = session.kind === "daily" ? { correct, answer: expected, explanation: `${word.example}\n${word.translation}`, score } : null;
    session.itemStartedAt = now(); session.hinted = false;
    saveSession(session);
    return { session: view(session), feedback: session.feedback };
  });
}
export function nextQuestion(user: User, id: string) {
  return transaction(() => {
    const session = ownedSession(user, id);
    if (!session.feedback) return view(session);
    session.feedback = null; session.itemStartedAt = now(); session.hinted = false; saveSession(session); return view(session);
  });
}
export function hintQuestion(user: User, id: string) {
  return transaction(() => {
    const session = ownedSession(user, id);
    if (session.kind !== "daily") throw new AppError("Bài kiểm tra không có gợi ý.");
    session.hinted = true; saveSession(session); return view(session);
  });
}
export function changeMode(user: User, mode: Mode) {
  studentOnly(user);
  if (!["fixed", "adaptive"].includes(mode)) throw new AppError("Chế độ không hợp lệ.");
  transaction(() => {
    const current = getUser(user.id)!;
    if (current.mode === mode) return;
    getDb().prepare("INSERT INTO mode_switches VALUES (?,?,?,?)").run(randomUUID(), user.id, now(), JSON.stringify({ from: current.mode, to: mode, experimentId: current.experimentId }));
    current.mode = mode; saveUser(current);
  });
}
export function getState(user: User): AppState {
  const progress = getProgress(user.id); const attempts = getAttempts(user.id).filter(a => a.kind === "daily");
  const sessions = userSessions(user.id); const today = dayKey(); const exp = getExperiment(user);
  const activity = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i - 6); const list = attempts.filter(a => a.day === day);
    return { day, count: list.length, correct: list.filter(a => a.correct).length };
  });
  const completeDays = new Set(sessions.filter(s => s.kind === "daily" && s.cursor === s.items.length).map(s => s.day));
  let streak = 0; let cursor = completeDays.has(today) ? today : addDays(today, -1);
  while (completeDays.has(cursor)) { streak++; cursor = addDays(cursor, -1); }
  const independent = attempts.filter(a => !a.isSameDayRetry);
  const state: AppState = {
    user, words: exp && exp.phase !== "learning" ? [] : WORDS.filter(w => w.grade === user.grade), progress, activity, experiment: exp,
    session: activeSession(user.id) ? view(activeSession(user.id)!) : null,
    assessmentDone: sessions.filter(s => s.scope === exp?.id && s.kind !== "daily" && s.cursor === s.items.length).map(s => s.kind),
    challengeDone: sessions.some(s => s.day === today && s.kind === "daily" && s.cursor === s.items.length), streak,
    stats: { learned: progress.length, mastered: progress.filter(p => p.score >= 80 && p.independentCorrect >= 2).length, due: progress.filter(p => isDue(p, user.mode, today)).length, accuracy: independent.length ? Math.round(independent.filter(a => a.correct).length / independent.length * 100) : 0, totalAttempts: attempts.length, studyDays: new Set(attempts.map(a => a.day)).size },
  };
  if (user.role === "teacher") {
    const students = allJson<User>("SELECT data FROM users WHERE owner_id=?", user.id).map(student => {
      const all = getAttempts(student.id); const learning = all.filter(a => a.kind === "daily");
      const exams = userSessions(student.id).filter(s => s.scope === student.experimentId && s.cursor === s.items.length);
      const score = (kind: string) => { const s = exams.find(s => s.kind === kind); return s ? Math.round(s.correct / s.items.length * 100) : null; };
      const switches = getDb().prepare("SELECT count(*) AS n FROM mode_switches WHERE user_id=?").get(student.id) as { n: number };
      const repeats = repeatErrors(learning);
      return { ...student, attempts: learning.length, learned: getProgress(student.id).length, switches: switches.n, fixed: learning.filter(a => a.mode === "fixed").length, adaptive: learning.filter(a => a.mode === "adaptive").length, pre: score("baseline"), post: score("post"), retention: score("retention"), studyDays: new Set(learning.map(a => a.day)).size, completedDays: new Set(userSessions(student.id).filter(s => s.kind === "daily" && s.cursor === s.items.length).map(s => s.day)).size, repeatOpportunities: repeats.opportunities, repeatErrors: repeats.errors } satisfies StudentSummary;
    });
    state.teacher = { students, experiments: allJson<Experiment>("SELECT data FROM experiments WHERE owner_id=?", user.id) };
  }
  return state;
}
export function createStudent(teacher: User, data: { username: string; name: string; grade: number; password: string }) {
  teacherOnly(teacher);
  if (!/^[a-zA-Z0-9_-]{3,32}$/.test(data.username) || !data.name.trim() || data.name.length > 80 || ![6,7,8,9].includes(data.grade) || data.password.length < 8 || data.password.length > 128) throw new AppError("Tên đăng nhập 3–32 ký tự không dấu; mật khẩu từ 8 ký tự; chọn lớp 6–9.");
  if (getDb().prepare("SELECT id FROM users WHERE username=?").get(data.username.toLowerCase())) throw new AppError("Tên đăng nhập đã tồn tại.");
  const student: User = { id: randomUUID(), username: data.username.toLowerCase(), name: data.name.trim(), grade: data.grade as Grade, role: "student", mode: "adaptive", demo: false, assignedGroup: null, experimentId: null };
  getDb().prepare("INSERT INTO users VALUES (?,?,?,?,?)").run(student.id, student.username, hashPassword(data.password), teacher.id, JSON.stringify(student));
}
export function createExperiment(teacher: User, data: { name: string; grade: number }) {
  teacherOnly(teacher);
  if (!data.name.trim() || data.name.length > 100 || ![6,7,8,9].includes(data.grade)) throw new AppError("Nhập tên đợt và khối lớp hợp lệ.");
  const createdAt = now();
  const exp: Experiment = { id: randomUUID(), name: data.name.trim(), grade: data.grade as Grade, phase: "baseline", createdAt, retentionAt: null, contentVersion: CONTENT_VERSION, algorithmVersion: ALGORITHM_VERSION, phaseHistory: [{ phase: "baseline", at: createdAt }] };
  getDb().prepare("INSERT INTO experiments VALUES (?,?,?)").run(exp.id, teacher.id, JSON.stringify(exp));
}
export function importStudents(teacher: User, csv: string): number {
  teacherOnly(teacher);
  if (typeof csv !== "string" || csv.length > 18000) throw new AppError("CSV tối đa 18.000 ký tự.");
  let rows: string[][];
  try { rows = parseCsv(csv); } catch (error) { throw new AppError((error as Error).message); }
  if (rows.shift()?.join(",") !== "username,name,grade,password") throw new AppError("Dòng đầu cần đúng: username,name,grade,password");
  if (!rows.length || rows.length > 200) throw new AppError("Mỗi lần nhập từ 1 đến 200 học sinh.");
  return transaction(() => {
    rows.forEach((row, index) => {
      if (row.length !== 4) throw new AppError(`Dòng ${index + 2} phải có 4 cột.`);
      try { createStudent(teacher, { username: row[0], name: row[1], grade: Number(row[2]), password: row[3] }); }
      catch (error) { throw new AppError(`Dòng ${index + 2}: ${(error as Error).message}`); }
    });
    return rows.length;
  });
}
export function resetStudentPassword(teacher: User, userId: string, password: string) {
  teacherOnly(teacher);
  if (typeof password !== "string" || password.length < 8 || password.length > 128) throw new AppError("Mật khẩu cần từ 8 đến 128 ký tự.");
  if (!getDb().prepare("SELECT id FROM users WHERE id=? AND owner_id=?").get(userId, teacher.id)) throw new AppError("Không tìm thấy học sinh của bạn.", 404);
  transaction(() => {
    getDb().prepare("UPDATE users SET password=? WHERE id=?").run(hashPassword(password), userId);
    getDb().prepare("DELETE FROM auth_sessions WHERE user_id=?").run(userId);
  });
}
function ownedExperiment(teacher: User, id: string): Experiment {
  teacherOnly(teacher);
  const exp = getJson<Experiment>("SELECT data FROM experiments WHERE id=? AND owner_id=?", id, teacher.id);
  if (!exp) throw new AppError("Không tìm thấy đợt thực nghiệm.", 404);
  return exp;
}
export function assignStudents(teacher: User, experimentId: string, ids: string[]) {
  transaction(() => {
    const exp = ownedExperiment(teacher, experimentId);
    if (exp.phase !== "baseline") throw new AppError("Chỉ phân nhóm khi đợt đang ở giai đoạn pre-test.");
    if (!ids.length || ids.length > 200 || new Set(ids).size !== ids.length) throw new AppError("Chọn từ 1 đến 200 học sinh khác nhau.");
    const students = ids.map(id => getJson<User>("SELECT data FROM users WHERE id=? AND owner_id=?", id, teacher.id));
    for (const student of students) {
      if (!student || student.grade !== exp.grade || student.experimentId || getProgress(student.id).length || userSessions(student.id).length) throw new AppError("Chỉ chọn học sinh cùng khối, chưa tham gia đợt và chưa học bộ từ. Hãy cấp tài khoản nghiên cứu mới.");
    }
    const members = allJson<User>("SELECT data FROM users WHERE owner_id=?", teacher.id).filter(u => u.experimentId === exp.id);
    let fixed = members.filter(u => u.assignedGroup === "fixed").length; let adaptive = members.length - fixed;
    const shuffled = students as User[];
    for (let i = shuffled.length - 1; i > 0; i--) { const j = randomInt(i + 1); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    for (const student of shuffled) {
      const mode: Mode = fixed === adaptive ? (randomInt(2) ? "fixed" : "adaptive") : fixed < adaptive ? "fixed" : "adaptive";
      if (mode === "fixed") fixed++; else adaptive++;
      saveUser({ ...student, mode, assignedGroup: mode, experimentId: exp.id });
    }
  });
}
export function changePhase(teacher: User, experimentId: string, phase: Phase) {
  transaction(() => {
    const exp = ownedExperiment(teacher, experimentId);
    const phases: Phase[] = ["baseline", "learning", "post", "waiting", "retention", "closed"];
    if (phases[phases.indexOf(exp.phase) + 1] !== phase) throw new AppError("Chỉ được chuyển sang giai đoạn kế tiếp.");
    const members = allJson<User>("SELECT data FROM users WHERE owner_id=?", teacher.id).filter(u => u.experimentId === exp.id);
    if (!members.length) throw new AppError("Hãy phân nhóm học sinh trước.");
    if (["baseline", "post", "retention"].includes(exp.phase)) {
      const missing = members.some(u => !userSessions(u.id).some(s => s.scope === exp.id && s.kind === exp.phase && s.cursor === s.items.length));
      if (missing) throw new AppError("Tất cả học sinh cần hoàn thành bài kiểm tra trước khi chuyển giai đoạn.");
    }
    if (members.some(u => activeSession(u.id))) throw new AppError("Còn học sinh đang làm dở phiên học. Hãy hoàn thành trước khi chuyển.");
    if (phase === "waiting") exp.retentionAt = addDays(dayKey(), 5);
    if (phase === "retention" && exp.retentionAt && dayKey() < exp.retentionAt) throw new AppError(`Retention test mở sớm nhất ngày ${exp.retentionAt} (sau 5 ngày).`);
    exp.phase = phase;
    exp.phaseHistory.push({ phase, at: now() });
    getDb().prepare("UPDATE experiments SET data=? WHERE id=?").run(JSON.stringify(exp), exp.id);
  });
}
export function exportCsv(teacher: User, kind: string, experimentId?: string): string {
  teacherOnly(teacher);
  if (experimentId) ownedExperiment(teacher, experimentId);
  const students = allJson<User>("SELECT data FROM users WHERE owner_id=?", teacher.id).filter(u => !experimentId || u.experimentId === experimentId);
  let rows: unknown[][];
  if (kind === "summary") {
    rows = [["student_code", "grade", "demo", "experiment_id", "assigned_group", "current_mode", "fixed_attempt_count", "adaptive_attempt_count", "mode_switch_count", "pre_score", "post_score", "retention_score", "paired_gain", "study_days", "completed_challenge_days", "repeated_errors", "repeat_opportunities", "learning_started_at", "post_opened_at", "retention_opened_at", "algorithm_version", "content_version"]];
    const summaries = getState(teacher).teacher!.students;
    for (const student of summaries.filter(s => students.some(u => u.id === s.id))) {
      const exp = getExperiment(student);
      const phaseTime = (phase: Phase) => exp?.phaseHistory.find(entry => entry.phase === phase)?.at ?? "";
      rows.push([student.id, student.grade, student.demo, student.experimentId, student.assignedGroup, student.mode, student.fixed, student.adaptive, student.switches, student.pre, student.post, student.retention, student.pre !== null && student.post !== null ? student.post-student.pre : null, student.studyDays, student.completedDays, student.repeatErrors, student.repeatOpportunities, phaseTime("learning"), phaseTime("post"), phaseTime("retention"), exp?.algorithmVersion ?? ALGORITHM_VERSION, exp?.contentVersion ?? CONTENT_VERSION]);
    }
  } else if (kind === "switches") {
    rows = [["student_code", "demo", "at", "from_mode", "to_mode", "experiment_id"]];
    for (const student of students) {
      const switches = getDb().prepare("SELECT created_at,data FROM mode_switches WHERE user_id=? ORDER BY created_at").all(student.id) as { created_at: string; data: string }[];
      for (const row of switches) { const d = JSON.parse(row.data); if (!experimentId || d.experimentId === experimentId) rows.push([student.id, student.demo, row.created_at, d.from, d.to, d.experimentId]); }
    }
  } else {
    rows = [["student_code", "grade", "demo", "assigned_group", "actual_mode", "experiment_id", "session_id", "item_id", "answered_at", "kind", "word_id", "exercise_type", "submitted_answer", "correct", "used_hint", "same_day_retry", "response_time_ms", "memory_score", "selection_reason", "algorithm_version", "content_version"]];
    for (const student of students) {
      const attempts = getDb().prepare("SELECT session_id,item_id,created_at,data FROM attempts WHERE user_id=? ORDER BY created_at").all(student.id) as { session_id: string; item_id: string; created_at: string; data: string }[];
      for (const row of attempts) { const a = JSON.parse(row.data) as Attempt; if (!experimentId || a.experimentId === experimentId) rows.push([student.id, a.grade, a.demo, a.assignedGroup, a.mode, a.experimentId, row.session_id, row.item_id, row.created_at, a.kind, a.wordId, a.type, a.answer, a.correct, a.hint, a.isSameDayRetry, a.responseTimeMs, a.score, a.reason, a.algorithmVersion, a.contentVersion]); }
    }
  }
  return "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n");
}
