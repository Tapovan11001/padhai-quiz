import { Agent, defineTool, type ModelClient, type TraceEvent } from "./harness/index.ts";
import type { JsonSchema } from "./harness/types.ts";
import { checkQuiz, type Quiz } from "./core/quiz.ts";

const bi: JsonSchema = {
  type: "object",
  properties: { en: { type: "string" }, hi: { type: "string", description: "Hindi in Devanagari" } },
  required: ["en", "hi"],
};

const quizSchema: JsonSchema = {
  type: "object",
  properties: {
    title: bi,
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          topic: { type: "string", description: "Short sub-topic of the chapter, in English" },
          question: bi,
          options: { type: "array", items: bi },
          answer: { type: "integer", minimum: 0, maximum: 3, description: "Index of the correct option" },
          explanation: bi,
        },
        required: ["id", "topic", "question", "options", "answer", "explanation"],
      },
    },
  },
  required: ["title", "questions"],
};

export const SYSTEM = `You write practice quizzes for Indian school students from a chapter they paste in.

Write 6 to 8 multiple-choice questions that test understanding, not just recall of a phrase. Each has exactly 4 options with one correct answer, a one or two sentence explanation, and a short topic label. Wrong options should be plausible mistakes a student might make, not jokes.

Every question, option and explanation must be in both English and Hindi (Devanagari). Write Hindi the way a good school teacher speaks it: simple words, with the English term in brackets where students would know it, e.g. "स्नेहक (लुब्रिकेंट)".

Only ask about what the chapter actually says. Call submit_quiz with the whole quiz. It checks the structure and that every correct answer is supported by the chapter. If it returns problems, fix those questions and submit again. When it's accepted, reply with one short line saying how many questions were made.`;

export function makeQuizAgent(model: ModelClient, chapter: string, onEvent?: (e: TraceEvent) => void) {
  const state: { quiz: Quiz | null } = { quiz: null };
  const submit = defineTool<{ quiz: Quiz }>({
    name: "submit_quiz",
    description: "Submit the quiz. Returns 'accepted', or a list of problems to fix.",
    input: { type: "object", properties: { quiz: quizSchema }, required: ["quiz"] },
    run: ({ quiz }) => {
      const issues = checkQuiz(quiz, chapter);
      if (issues.length) return { accepted: false, problems: issues };
      state.quiz = quiz;
      return { accepted: true, questions: quiz.questions.length };
    },
  });
  const agent = new Agent({ model, system: SYSTEM, tools: [submit], limits: { maxSteps: 5 }, onEvent });
  return { agent, state, prompt: `Chapter:\n\n${chapter}` };
}
