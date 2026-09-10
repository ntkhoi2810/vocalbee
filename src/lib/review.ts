import type { ExerciseType, Mode, Progress } from "./types";

export const ALGORITHM_VERSION = "vocalbee-1.0";
export const INTERVALS = [1, 3, 7, 14, 30];
export const FIXED_OFFSETS = [1, 3, 7, 14, 30];
export function dayKey(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}
export function addDays(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function emptyProgress(wordId: string, day: string): Progress {
  return { wordId, score: 0, stage: 0, firstDay: day, lastDay: "", nextDay: addDays(day, 1), correct: 0, wrong: 0, meaningErrors: 0, spellingErrors: 0, usageErrors: 0, fixedCompleted: [], independentCorrect: 0 };
}
export function fixedDue(p: Progress, today: string): number | undefined {
  return FIXED_OFFSETS.find(offset => !p.fixedCompleted.includes(offset) && addDays(p.firstDay, offset) <= today);
}
export function isDue(p: Progress, mode: Mode, today: string): boolean {
  return mode === "fixed" ? fixedDue(p, today) !== undefined : p.nextDay <= today;
}
export function updateProgress(previous: Progress | undefined, input: { wordId: string; day: string; correct: boolean; hint: boolean; type: ExerciseType }): Progress {
  const p = structuredClone(previous ?? emptyProgress(input.wordId, input.day));
  const independent = p.lastDay !== input.day;
  if (input.correct) p.correct++; else {
    p.wrong++;
    if (input.type === "meaning") p.meaningErrors++;
    if (input.type === "spelling") p.spellingErrors++;
    if (input.type === "usage") p.usageErrors++;
  }
  if (!input.correct) {
    p.score = Math.max(0, p.score - 20); p.stage = 0; p.nextDay = addDays(input.day, 1);
  } else if (independent && !input.hint) {
    p.score = previous ? Math.min(100, p.score + 15) : 40;
    p.independentCorrect++;
    if (previous && p.nextDay <= input.day) p.stage = Math.min(INTERVALS.length - 1, p.stage + 1);
    p.nextDay = addDays(input.day, INTERVALS[p.stage]);
  } else if (input.hint) {
    p.nextDay = addDays(input.day, 1);
  }
  // An actual retrieval satisfies elapsed fixed milestones in either mode.
  // This avoids duplicate overdue prompts after switching modes.
  p.fixedCompleted = FIXED_OFFSETS.filter(offset => p.fixedCompleted.includes(offset) || addDays(p.firstDay, offset) <= input.day);
  p.lastDay = input.day;
  return p;
}
export function selectReviews(progress: Progress[], mode: Mode, today: string, count: number): { progress: Progress; reason: string; type: ExerciseType }[] {
  const ordered = [...progress].sort((a, b) => {
    const dueA = isDue(a, mode, today); const dueB = isDue(b, mode, today);
    if (dueA !== dueB) return dueA ? -1 : 1;
    if (mode === "fixed") {
      const dateA = addDays(a.firstDay, fixedDue(a, today) ?? 365);
      const dateB = addDays(b.firstDay, fixedDue(b, today) ?? 365);
      return dateA.localeCompare(dateB) || a.wordId.localeCompare(b.wordId);
    }
    return a.nextDay.localeCompare(b.nextDay) || a.score - b.score || b.wrong - a.wrong || a.wordId.localeCompare(b.wordId);
  });
  return ordered.slice(0, count).map((p, i) => {
    const errors: [ExerciseType, number][] = [["meaning", p.meaningErrors], ["spelling", p.spellingErrors], ["usage", p.usageErrors]];
    const types = ["meaning", "spelling", "usage"] as const;
    const dominant = errors.sort((a, b) => b[1] - a[1])[0];
    const repetitions = p.correct + p.wrong;
    // Keep exposure to all skills, even when one historic error type dominates.
    const type = mode === "fixed" ? types[(i + p.fixedCompleted.length) % 3] : dominant[1] > 0 && repetitions % 4 !== 0 ? dominant[0] : types[repetitions % 3];
    const reason = mode === "fixed" ? "Theo lịch ôn cố định" : p.nextDay < today ? "Đã quá hạn ôn" : p.nextDay === today ? "Đến hạn ôn hôm nay" : p.wrong > 0 ? "Củng cố từ từng mắc lỗi" : "Củng cố từ đã học";
    return { progress: p, reason, type };
  });
}
export function normalizeAnswer(value: string): string {
  return value.normalize("NFC").trim().toLocaleLowerCase("en").replace(/\s+/g, " ");
}
export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
