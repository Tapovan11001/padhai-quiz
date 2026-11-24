import { test } from "node:test";
import assert from "node:assert/strict";
import { checkQuiz, retryQueue, score } from "../src/core/quiz.ts";
import { CHAPTER, QUIZ } from "../src/core/sample.ts";
import { makeQuizAgent } from "../src/agent.ts";
import { scriptedModel, lastToolResults } from "../src/harness/index.ts";

test("the sample quiz passes its own checks", () => {
  assert.deepEqual(checkQuiz(QUIZ, CHAPTER), []);
});

test("structure problems are caught", () => {
  const bad = structuredClone(QUIZ);
  bad.questions[0].options.pop();
  bad.questions[1].options[1] = { ...bad.questions[1].options[0] };
  bad.questions[2].answer = 7;
  bad.questions[3].question.hi = "";
  const problems = checkQuiz(bad, CHAPTER).map((i) => `${i.questionId}: ${i.problem}`);
  assert.ok(problems.some((p) => p.startsWith("f1: Needs exactly 4 options")));
  assert.ok(problems.some((p) => p.startsWith("f2: Two options are the same")));
  assert.ok(problems.some((p) => p.startsWith("f3: Answer index 7")));
  assert.ok(problems.some((p) => p.startsWith("f4: Question needs both")));
});

test("answers the chapter doesn't support are flagged", () => {
  const bad = structuredClone(QUIZ);
  bad.questions[4].options[0] = { en: "Photosynthesis enzymes", hi: "प्रकाश संश्लेषण एंजाइम" };
  bad.questions[4].explanation = { en: "Chlorophyll molecules capture sunlight.", hi: "क्लोरोफिल सूर्य का प्रकाश पकड़ता है।" };
  const issues = checkQuiz(bad, CHAPTER);
  assert.equal(issues.length, 1);
  assert.match(issues[0].problem, /isn't clearly supported/);
});

test("scoring, weak topics and retry queue", () => {
  const attempts = QUIZ.questions.map((q, i) => ({ questionId: q.id, chosen: i < 6 ? q.answer : 1, correct: i < 6 }));
  const s = score(QUIZ, attempts);
  assert.equal(s.right, 6);
  assert.equal(s.percent, 75);
  assert.deepEqual(s.weak, ["Fluid friction"]);
  assert.deepEqual(retryQueue(QUIZ, attempts).map((q) => q.id), ["f7", "f8"]);
});

test("agent fixes a rejected quiz and resubmits", async () => {
  const broken = structuredClone(QUIZ);
  broken.questions[0].options[1] = { ...broken.questions[0].options[0] };
  const model = scriptedModel([
    { tools: [{ name: "submit_quiz", input: { quiz: broken } }] },
    (req) => {
      assert.match(lastToolResults(req)[0], /f1.*Two options are the same/s);
      return { tools: [{ name: "submit_quiz", input: { quiz: QUIZ } }] };
    },
    { text: "Made 8 questions." },
  ]);
  const { agent, state, prompt } = makeQuizAgent(model, CHAPTER);
  const r = await agent.run(prompt);
  assert.equal(r.status, "done");
  assert.equal(state.quiz?.questions.length, 8);
  assert.equal(r.toolCalls, 2);
});
