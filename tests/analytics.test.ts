import test from "node:test";
import assert from "node:assert/strict";
import { repeatErrors } from "../src/lib/analytics";
import { parseCsv } from "../src/lib/csv";

test("repeated errors use the next separate-day opportunity of the same word and skill", () => {
  const base = { kind: "daily", wordId: "word", type: "spelling" };
  const result = repeatErrors([
    { ...base, day: "2026-09-01", correct: false },
    { ...base, day: "2026-09-01", correct: true },
    { ...base, type: "meaning", day: "2026-09-02", correct: true },
    { ...base, kind: "post", day: "2026-09-02", correct: true },
    { ...base, day: "2026-09-02", correct: false },
    { ...base, day: "2026-09-03", correct: true },
    { ...base, day: "2026-09-04", correct: true },
  ]);
  assert.deepEqual(result, { opportunities: 2, errors: 1, rate: 50 });
  assert.equal(repeatErrors([]).rate, null);
});
test("CSV import supports UTF-8 BOM, quoted commas and escaped quotes", () => {
  assert.deepEqual(parseCsv('\uFEFFusername,name,grade,password\r\na,"Nguyễn, ""An""",7,password123\r\n'), [["username","name","grade","password"],["a",'Nguyễn, "An"',"7","password123"]]);
  assert.throws(() => parseCsv('a,"unclosed'), /Thiếu/);
  assert.throws(() => parseCsv('a,"valid"invalid'), /không hợp lệ/);
});
