// Quiz shape, quality checks and scoring. No AI in this file.

export interface Bilingual {
  en: string;
  hi: string;
}

export interface Question {
  id: string;
  topic: string;
  question: Bilingual;
  options: Bilingual[]; // exactly 4
  answer: number; // index into options
  explanation: Bilingual;
}

export interface Quiz {
  title: Bilingual;
  questions: Question[];
}

export interface QuizIssue {
  questionId: string;
  problem: string;
}

const STOP = new Set(["the", "and", "that", "this", "with", "from", "because", "which", "than", "more", "less", "into", "they", "their", "there", "when", "what", "have", "been", "were", "used", "make", "makes", "does", "always", "only", "are", "for", "can", "not", "but", "you", "its", "has", "was", "very", "also", "some", "just"]);
const words = (s: string) => s.toLowerCase().match(/[a-z]{3,}/g)?.filter((w) => !STOP.has(w)) ?? [];
const stem = (w: string) => w.slice(0, 5);

/**
 * Checks a quiz before a student sees it:
 * structure (4 distinct options, one valid answer, both languages filled)
 * and grounding (the correct answer's key words appear in the chapter, so the
 * quiz only tests what the chapter actually teaches).
 */
export function checkQuiz(quiz: Quiz, chapter: string): QuizIssue[] {
  const issues: QuizIssue[] = [];
  const chapterStems = new Set(words(chapter).map(stem));
  const seen = new Set<string>();
  for (const q of quiz.questions) {
    const add = (problem: string) => issues.push({ questionId: q.id, problem });
    if (seen.has(q.id)) add("Duplicate question id.");
    seen.add(q.id);
    if (!q.question.en.trim() || !q.question.hi.trim()) add("Question needs both English and Hindi text.");
    if (!q.explanation.en.trim() || !q.explanation.hi.trim()) add("Explanation needs both English and Hindi text.");
    if (q.options.length !== 4) add(`Needs exactly 4 options, has ${q.options.length}.`);
    if (q.options.some((o) => !o.en.trim() || !o.hi.trim())) add("Every option needs English and Hindi text.");
    const norm = q.options.map((o) => o.en.trim().toLowerCase());
    if (new Set(norm).size !== norm.length) add("Two options are the same.");
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) {
      add(`Answer index ${q.answer} doesn't point to an option.`);
      continue;
    }
    const key = words(q.options[q.answer].en + " " + q.explanation.en);
    if (key.length) {
      const supported = key.filter((w) => chapterStems.has(stem(w))).length / key.length;
      if (supported < 0.5) add(`The answer "${q.options[q.answer].en}" isn't clearly supported by the chapter text.`);
    }
  }
  return issues;
}

export interface Attempt {
  questionId: string;
  chosen: number;
  correct: boolean;
}

export function score(quiz: Quiz, attempts: Attempt[]) {
  const byTopic = new Map<string, { right: number; total: number }>();
  for (const a of attempts) {
    const q = quiz.questions.find((x) => x.id === a.questionId);
    if (!q) continue;
    const t = byTopic.get(q.topic) ?? { right: 0, total: 0 };
    t.total++;
    if (a.correct) t.right++;
    byTopic.set(q.topic, t);
  }
  const right = attempts.filter((a) => a.correct).length;
  const weak = [...byTopic.entries()].filter(([, t]) => t.right / t.total < 0.6).map(([topic]) => topic);
  return { right, total: attempts.length, percent: attempts.length ? Math.round((right / attempts.length) * 100) : 0, byTopic: Object.fromEntries(byTopic), weak };
}

/** Questions to retry: the ones answered wrong, in the order they were asked. */
export function retryQueue(quiz: Quiz, attempts: Attempt[]): Question[] {
  const wrong = new Set(attempts.filter((a) => !a.correct).map((a) => a.questionId));
  return quiz.questions.filter((q) => wrong.has(q.id));
}
