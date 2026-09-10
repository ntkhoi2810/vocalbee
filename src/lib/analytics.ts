export function repeatErrors(attempts: { kind: string; wordId: string; type: string; day: string; correct: boolean }[]) {
  const last = new Map<string, { day: string; correct: boolean }>();
  let opportunities = 0; let errors = 0;
  for (const a of attempts) {
    if (a.kind !== "daily") continue;
    const key = `${a.wordId}:${a.type}`; const previous = last.get(key);
    if (previous?.day === a.day) continue;
    if (previous && !previous.correct) { opportunities++; if (!a.correct) errors++; }
    last.set(key, a);
  }
  return { opportunities, errors, rate: opportunities ? Math.round(errors / opportunities * 100) : null };
}
