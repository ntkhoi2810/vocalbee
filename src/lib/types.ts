export type Mode = "fixed" | "adaptive";
export type Grade = 6 | 7 | 8 | 9;
export type ExerciseType = "meaning" | "spelling" | "usage";
export type Phase = "baseline" | "learning" | "post" | "waiting" | "retention" | "closed";
export interface Word {
  id: string; grade: Grade; topic: string; word: string; ipa: string;
  meaning: string; example: string; translation: string;
}
export interface Progress {
  wordId: string; score: number; stage: number; firstDay: string;
  lastDay: string; nextDay: string; correct: number; wrong: number;
  meaningErrors: number; spellingErrors: number; usageErrors: number;
  fixedCompleted: number[]; independentCorrect: number;
}
export interface User {
  id: string; name: string; username: string; grade: Grade; role: "student" | "teacher";
  mode: Mode; demo: boolean; assignedGroup: Mode | null; experimentId: string | null;
}
export interface Question {
  id: string; wordId: string; type: ExerciseType; prompt: string; options: string[];
  reason: string; newWord: Word | null; hint: string;
}
export interface Feedback { correct: boolean; answer: string; explanation: string; score: number; }
export interface SessionView {
  id: string; mode: Mode; kind: string; total: number; answered: number; correct: number;
  complete: boolean; question: Question | null; feedback: Feedback | null;
}
export interface Experiment {
  id: string; name: string; grade: Grade; phase: Phase; createdAt: string; retentionAt: string | null;
  contentVersion: string; algorithmVersion: string; phaseHistory: { phase: Phase; at: string }[];
}
export interface Activity { day: string; count: number; correct: number; }
export interface StudentSummary extends User {
  attempts: number; learned: number; switches: number; fixed: number; adaptive: number;
  pre: number | null; post: number | null; retention: number | null;
  studyDays: number; completedDays: number; repeatOpportunities: number; repeatErrors: number;
}
export interface AppState {
  user: User; words: Word[]; progress: Progress[]; activity: Activity[];
  session: SessionView | null; experiment: Experiment | null;
  assessmentDone: string[]; challengeDone: boolean; streak: number;
  stats: { learned: number; mastered: number; due: number; accuracy: number; totalAttempts: number; studyDays: number };
  teacher?: { students: StudentSummary[]; experiments: Experiment[] };
}
