import test, { after } from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { rmSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { allJson, getDb, getJson, getUser } from "../src/lib/db";
import { answerQuestion, assignStudents, changeMode, changePhase, createExperiment, createStudent, exportCsv, getState, hintQuestion, importStudents, nextQuestion, resetStudentPassword, startSession } from "../src/lib/service";
import { WORD_MAP } from "../src/lib/content";
import type { Experiment, User } from "../src/lib/types";

const dir = resolve("data", `test-${randomUUID()}`);
process.env.VOCALBEE_DATA_DIR = dir; process.env.VOCALBEE_DEMO = "true";
const db = getDb();
const teacher = getJson<User>("SELECT data FROM users WHERE username='teacher'")!;
const student = getJson<User>("SELECT data FROM users WHERE username='student7'")!;
after(() => { db.close(); rmSync(dir, { recursive: true, force: true }); });

test("CSV roster import is atomic and teachers own password resets", () => {
  assert.throws(() => importStudents(teacher, "username,name,grade,password\nimport_a,Student A,6,password123\nimport_b,Student B,5,password123"), /Dòng 3/);
  assert.equal(getJson<User>("SELECT data FROM users WHERE username='import_a'"), null);
  assert.equal(importStudents(teacher, "username,name,grade,password\nimport_a,Student A,6,password123"), 1);
  const imported = getJson<User>("SELECT data FROM users WHERE username='import_a'")!;
  assert.throws(() => resetStudentPassword(student, imported.id, "newPassword123"), /quyền/);
  resetStudentPassword(teacher, imported.id, "newPassword123");
  assert.equal(getState(imported).progress.length, 0);
});

test("mode switching preserves active session, answer deduplication and daily cap", () => {
  let session = startSession(student, "daily");
  assert.equal(session.mode, "adaptive");
  changeMode(student, "fixed");
  const updated = getUser(student.id)!;
  assert.equal(updated.mode, "fixed");
  assert.equal(startSession(updated, "daily").mode, "adaptive");
  const originalItem = session.question!;
  const answer = WORD_MAP.get(originalItem.wordId)!.meaning;
  const response = answerQuestion(updated, { sessionId: session.id, itemId: originalItem.id, answer });
  answerQuestion(updated, { sessionId: session.id, itemId: originalItem.id, answer });
  assert.equal(getState(updated).stats.totalAttempts, 1);
  assert.equal(getState(updated).progress.length, 1);
  session = nextQuestion(updated, response.session.id);
  const other = getJson<User>("SELECT data FROM users WHERE username='student6'")!;
  assert.throws(() => answerQuestion(other, { sessionId: session.id, itemId: session.question!.id, answer: "x" }), /Không tìm thấy/);
  while (!session.complete) {
    const q = session.question!; const word = WORD_MAP.get(q.wordId)!;
    session = answerQuestion(updated, { sessionId: session.id, itemId: q.id, answer: q.type === "meaning" ? word.meaning : word.word }).session;
    session = nextQuestion(updated, session.id);
  }
  const state = getState(updated);
  assert.equal(state.challengeDone, true); assert.equal(state.streak, 1);
  assert.equal(state.stats.learned, 5); assert.equal(state.stats.totalAttempts, 10);
  assert.ok(state.progress.every(p => p.score === 40));
  assert.equal(startSession(updated, "daily").id, session.id);
  assert.ok(exportCsv(teacher, "attempts").includes('"adaptive"'));
  assert.ok(exportCsv(teacher, "switches").includes('"fixed"'));
});
test("hint flag cannot be cleared by calling next without answering", () => {
  const user = getJson<User>("SELECT data FROM users WHERE username='student8'")!;
  const session = startSession(user, "daily");
  hintQuestion(user, session.id);
  const after = nextQuestion(user, session.id);
  assert.ok(after.question?.hint);
  const result = answerQuestion(user, { sessionId: session.id, itemId: session.question!.id, answer: WORD_MAP.get(session.question!.wordId)!.meaning });
  assert.equal(result.feedback!.score, 0);
});
test("research enrollment, baseline isolation, phase guards and permissions", () => {
  for (const suffix of ["a", "b"]) createStudent(teacher, { name: `Research ${suffix}`, username: `research_${suffix}`, grade: 9, password: "TestPass123!" });
  createExperiment(teacher, { name: "Grade 9 research", grade: 9 });
  const exp = allJson<Experiment>("SELECT data FROM experiments")[0];
  const users = allJson<User>("SELECT data FROM users WHERE username LIKE 'research_%'");
  assignStudents(teacher, exp.id, users.map(u => u.id));
  const enrolled = users.map(u => getUser(u.id)!);
  assert.notEqual(enrolled[0].assignedGroup, enrolled[1].assignedGroup);
  assert.throws(() => startSession(enrolled[0], "daily"), /kiểm tra/);
  assert.throws(() => changePhase(teacher, exp.id, "learning"), /hoàn thành/);
  assert.throws(() => exportCsv(enrolled[0], "attempts"), /quyền/);
  for (const user of enrolled) {
    assert.equal(getState(user).words.length, 0);
    let exam = startSession(user, "baseline");
    const original = exam.id;
    assert.throws(() => hintQuestion(user, exam.id), /không có gợi ý/);
    while (!exam.complete) {
      const q = exam.question!; assert.equal(q.newWord, null); const word = WORD_MAP.get(q.wordId)!;
      const result = answerQuestion(user, { sessionId: exam.id, itemId: q.id, answer: q.type === "meaning" ? word.meaning : word.word });
      assert.equal(result.feedback, null); if (!result.session.complete) assert.equal(result.session.correct, 0);
      exam = result.session;
    }
    assert.equal(exam.correct, 12);
    assert.equal(startSession(user, "baseline").id, original);
    assert.equal(getState(user).progress.length, 0);
  }
  changePhase(teacher, exp.id, "learning");
  assert.equal(getState(enrolled[0]).words.length, 24);
  changeMode(enrolled[0], enrolled[0].mode === "fixed" ? "adaptive" : "fixed");
  assert.equal(getUser(enrolled[0].id)!.assignedGroup, enrolled[0].assignedGroup);
  changePhase(teacher, exp.id, "post");
  for (const user of enrolled) {
    let exam = startSession(getUser(user.id)!, "post");
    while (!exam.complete) exam = answerQuestion(user, { sessionId: exam.id, itemId: exam.question!.id, answer: "incorrect" }).session;
  }
  changePhase(teacher, exp.id, "waiting");
  assert.throws(() => changePhase(teacher, exp.id, "retention"), /sớm nhất/);
  assert.throws(() => startSession(enrolled[0], "daily"), /kiểm tra/);
  const csv = exportCsv(teacher, "attempts", exp.id);
  assert.ok(csv.includes('"baseline"')); assert.ok(csv.includes('"post"'));
  assert.ok(!csv.includes('"Research a"')); assert.ok(!csv.includes('"research_a"'));
  const summary = exportCsv(teacher, "summary", exp.id);
  assert.ok(summary.includes('"paired_gain"')); assert.ok(summary.includes('"learning_started_at"'));
  const stored = getJson<Experiment>("SELECT data FROM experiments WHERE id=?", exp.id)!;
  assert.deepEqual(stored.phaseHistory.map(p => p.phase), ["baseline", "learning", "post", "waiting"]);
  db.prepare("UPDATE experiments SET data=? WHERE id=?").run(JSON.stringify({ ...stored, algorithmVersion: "old-version" }), stored.id);
  assert.throws(() => startSession(enrolled[0], "daily"), /phiên bản khác/);
});
