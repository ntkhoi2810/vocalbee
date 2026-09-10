import test from "node:test";
import assert from "node:assert/strict";
import { addDays, csvCell, dayKey, emptyProgress, isDue, normalizeAnswer, selectReviews, updateProgress } from "../src/lib/review";
import { WORDS } from "../src/lib/content";

test("Vietnam day boundary and month/year arithmetic", () => {
  assert.equal(dayKey(new Date("2026-09-10T18:00:00Z")), "2026-09-11");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});
test("fixed schedule is unchanged by correct/incorrect responses; adaptive diverges", () => {
  const initial = { ...emptyProgress("w", "2026-09-01"), score: 40, lastDay: "2026-09-01" };
  const correct = updateProgress(initial, { wordId: "w", day: "2026-09-02", correct: true, hint: false, type: "meaning" });
  const wrong = updateProgress(initial, { wordId: "w", day: "2026-09-02", correct: false, hint: false, type: "meaning" });
  assert.equal(correct.nextDay, "2026-09-05");
  assert.equal(wrong.nextDay, "2026-09-03");
  assert.deepEqual(correct.fixedCompleted, wrong.fixedCompleted);
  assert.equal(isDue(correct, "fixed", "2026-09-03"), false);
  assert.equal(isDue(wrong, "fixed", "2026-09-03"), false);
  assert.equal(isDue(correct, "fixed", "2026-09-04"), true);
  assert.equal(isDue(wrong, "fixed", "2026-09-04"), true);
  assert.equal(isDue(correct, "adaptive", "2026-09-03"), false);
  assert.equal(isDue(wrong, "adaptive", "2026-09-03"), true);
});
test("same-day retries and hints cannot inflate memory or intervals", () => {
  const initial = updateProgress(undefined, { wordId: "w", day: "2026-09-01", correct: true, hint: false, type: "meaning" });
  const retry = updateProgress(initial, { wordId: "w", day: "2026-09-01", correct: true, hint: false, type: "usage" });
  assert.equal(retry.score, 40); assert.equal(retry.stage, 0); assert.equal(retry.independentCorrect, 1);
  const hinted = updateProgress(retry, { wordId: "w", day: "2026-09-02", correct: true, hint: true, type: "spelling" });
  assert.equal(hinted.score, 40); assert.equal(hinted.stage, 0); assert.equal(hinted.independentCorrect, 1);
  const again = updateProgress(hinted, { wordId: "w", day: "2026-09-02", correct: true, hint: false, type: "spelling" });
  assert.equal(again.score, 40);
});
test("adaptive prioritizes weak words and errors, fixed ignores error history", () => {
  const a = { ...emptyProgress("a", "2026-09-01"), score: 95 };
  const b = { ...emptyProgress("b", "2026-09-01"), score: 20, spellingErrors: 4, wrong: 4 };
  assert.equal(selectReviews([a,b], "fixed", "2026-09-02", 1)[0].progress.wordId, "a");
  const adaptive = selectReviews([a,b], "adaptive", "2026-09-02", 1)[0];
  assert.equal(adaptive.progress.wordId, "b"); assert.equal(adaptive.type, "spelling");
});
test("scores remain bounded through repeated failures and successes", () => {
  let p = emptyProgress("w", "2026-01-01");
  for (let i = 0; i < 80; i++) p = updateProgress(p, { wordId: "w", day: addDays("2026-01-01", i), correct: i > 20, hint: false, type: "spelling" });
  assert.equal(p.score, 100); assert.equal(p.spellingErrors, 21);
});
test("normalization preserves genuine spelling errors and CSV neutralizes formulas", () => {
  assert.equal(normalizeAnswer("  EnViRonMent  "), "environment");
  assert.notEqual(normalizeAnswer("enviroment"), "environment");
  assert.equal(csvCell('=HYPERLINK("bad")'), '"\'=HYPERLINK(""bad"")"');
});
test("all four grades have unique, complete content and valid cloze sentences", () => {
  assert.equal(WORDS.length, 96); assert.equal(new Set(WORDS.map(w => w.id)).size, WORDS.length);
  for (const grade of [6,7,8,9]) assert.equal(WORDS.filter(w => w.grade === grade).length, 24);
  for (const word of WORDS) {
    assert.ok(word.ipa && word.meaning && word.translation);
    assert.ok(new RegExp(`\\b${word.word}\\b`, "i").test(word.example), word.id);
  }
});
