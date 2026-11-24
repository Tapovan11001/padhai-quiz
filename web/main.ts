import { CHAPTER, QUIZ } from "../src/core/sample.ts";
import { retryQueue, score, type Attempt, type Bilingual, type Question, type Quiz } from "../src/core/quiz.ts";
import { makeQuizAgent } from "../src/agent.ts";
import { anthropicModel } from "../src/harness/models/anthropic.ts";

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
type Lang = "both" | "en" | "hi";

let lang: Lang = "both";
let quiz: Quiz = QUIZ;
let queue: Question[] = [];
let pos = 0;
let attempts: Attempt[] = [];
let answered = false;

// The model (and the sample) may put the right answer anywhere, often first.
// Shuffle each question's options the same way every time, seeded by its id.
function order(q: Question): number[] {
  let h = 2166136261;
  for (const c of q.id + q.question.en) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const idx = q.options.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
    const j = h % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function bi(el: HTMLElement, t: Bilingual) {
  el.replaceChildren();
  if (lang !== "hi") {
    const s = document.createElement("span");
    s.className = "en";
    s.textContent = t.en;
    el.append(s);
  }
  if (lang !== "en") {
    const s = document.createElement("span");
    s.className = "hi";
    s.lang = "hi";
    s.textContent = t.hi;
    el.append(s);
  }
}

function start(qs: Question[]) {
  queue = qs;
  pos = 0;
  attempts = [];
  $("result").hidden = true;
  $("card").hidden = false;
  bi($("quiz-title"), quiz.title);
  show();
}

function dots() {
  $("dots").replaceChildren(
    ...queue.map((q, i) => {
      const d = document.createElement("span");
      const a = attempts.find((x) => x.questionId === q.id);
      d.className = a ? (a.correct ? "ok" : "no") : i === pos ? "now" : "";
      return d;
    }),
  );
}

function show() {
  answered = false;
  const q = queue[pos];
  $("progress").textContent = `Question ${pos + 1} of ${queue.length}`;
  $("q-topic").textContent = q.topic;
  bi($("q-text"), q.question);
  $("feedback").hidden = true;
  $("opts").replaceChildren(
    ...order(q).map((i, k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opt";
      b.dataset.i = String(i);
      const letter = document.createElement("span");
      letter.className = "letter";
      letter.textContent = "ABCD"[k] ?? String(k + 1);
      const body = document.createElement("span");
      body.className = "body";
      bi(body, q.options[i]);
      b.append(letter, body);
      b.addEventListener("click", () => choose(i));
      return b;
    }),
  );
  dots();
}

function choose(i: number) {
  if (answered) return;
  answered = true;
  const q = queue[pos];
  const correct = i === q.answer;
  attempts.push({ questionId: q.id, chosen: i, correct });
  for (const b of $("opts").querySelectorAll<HTMLButtonElement>(".opt")) {
    const bi_ = Number(b.dataset.i);
    b.disabled = true;
    if (bi_ === q.answer) b.classList.add("right");
    else if (bi_ === i) b.classList.add("wrong");
  }
  const v = $("verdict");
  v.className = `verdict ${correct ? "good" : "bad"}`;
  bi(v, correct ? { en: "Correct!", hi: "सही जवाब!" } : { en: "Not quite.", hi: "यह सही नहीं है।" });
  bi($("why"), q.explanation);
  $("next").textContent = pos + 1 < queue.length ? "Next question" : "See my result";
  $("feedback").hidden = false;
  dots();
  $("next").focus({ preventScroll: true });
}

function finish() {
  $("card").hidden = true;
  $("result").hidden = false;
  $("progress").textContent = "Done";
  const s = score(quiz, attempts);
  $("r-score").textContent = `${s.right} / ${s.total}`;
  const line = $("r-line");
  if (s.weak.length) bi(line, { en: `Read these parts again: ${s.weak.join(", ")}.`, hi: `इन हिस्सों को फिर से पढ़ें: ${s.weak.join(", ")}` });
  else bi(line, { en: "No weak topics. Well done.", hi: "कोई कमज़ोर विषय नहीं। शाबाश!" });
  $("r-topics").replaceChildren(
    ...Object.entries(s.byTopic).map(([topic, t]) => {
      const row = document.createElement("div");
      row.className = `trow${s.weak.includes(topic) ? " weak" : ""}`;
      const name = document.createElement("span");
      name.textContent = topic;
      const bar = document.createElement("span");
      bar.className = "tbar";
      const fill = document.createElement("i");
      fill.style.width = `${(t.right / t.total) * 100}%`;
      bar.append(fill);
      const num = document.createElement("span");
      num.className = "tnum";
      num.textContent = `${t.right}/${t.total}`;
      row.append(name, bar, num);
      return row;
    }),
  );
  const wrong = retryQueue(quiz, attempts);
  $<HTMLButtonElement>("retry").hidden = wrong.length === 0;
  $("retry").textContent = `Retry the ${wrong.length} I got wrong`;
  dots();
}

$("next").addEventListener("click", () => {
  if (pos + 1 < queue.length) {
    pos++;
    show();
  } else finish();
});
$("retry").addEventListener("click", () => start(retryQueue(quiz, attempts)));
$("restart").addEventListener("click", () => start(quiz.questions));

for (const b of document.querySelectorAll<HTMLButtonElement>(".langs button")) {
  b.addEventListener("click", () => {
    lang = b.dataset.lang as Lang;
    for (const o of document.querySelectorAll<HTMLButtonElement>(".langs button")) o.setAttribute("aria-pressed", String(o === b));
    bi($("quiz-title"), quiz.title);
    if (!$("result").hidden) finish();
    else {
      const keep = answered ? attempts[attempts.length - 1] : null;
      if (keep) attempts.pop();
      show();
      if (keep) choose(keep.chosen);
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
  const k = "abcd1234".indexOf(e.key.toLowerCase());
  if (k >= 0 && !answered && !$("card").hidden) {
    const btn = $("opts").querySelectorAll<HTMLButtonElement>(".opt")[k % 4];
    btn?.click();
  }
});

const ta = $<HTMLTextAreaElement>("chapter");
ta.value = CHAPTER;
$("reset-sample").addEventListener("click", () => {
  ta.value = CHAPTER;
  quiz = QUIZ;
  $("gen-status").textContent = "";
  start(quiz.questions);
});

try { const k = sessionStorage.getItem("pq-key"); if (k) $<HTMLInputElement>("api-key").value = k; } catch {}
$("generate").addEventListener("click", async () => {
  const chapter = ta.value.trim();
  const key = $<HTMLInputElement>("api-key").value.trim();
  const st = $("gen-status");
  if (chapter.split(/\s+/).length < 60) { st.textContent = "Paste a longer chapter, at least a few paragraphs."; return; }
  if (!key) { st.textContent = "Paste an Anthropic API key first."; return; }
  try { sessionStorage.setItem("pq-key", key); } catch {}
  const btn = $<HTMLButtonElement>("generate");
  btn.disabled = true;
  st.textContent = "Claude is reading the chapter…";
  let rounds = 0;
  try {
    const { agent, state, prompt } = makeQuizAgent(
      anthropicModel({ apiKey: key, browser: true, maxTokens: 16000 }),
      chapter,
      (e) => {
        if (e.kind === "tool_result") {
          rounds++;
          st.textContent = e.output.includes('"accepted": true') ? "Checks passed." : `The checker found problems. Claude is fixing them (round ${rounds})…`;
        }
      },
    );
    const r = await agent.run(prompt);
    if (state.quiz) {
      quiz = state.quiz;
      st.textContent = `Made ${quiz.questions.length} questions. Every answer passed the chapter check${rounds > 1 ? ` after ${rounds - 1} fix round${rounds > 2 ? "s" : ""}` : ""}.`;
      start(quiz.questions);
    } else {
      const err = r.trace.find((e) => e.kind === "error");
      st.textContent = err && err.kind === "error"
        ? (/fetch|network|connection/i.test(err.message) ? "Couldn't reach the Claude API from this page. Open the hosted site if this preview blocks outside requests." : err.message)
        : "Claude couldn't make a quiz that passed every check. Try a longer or clearer chapter.";
    }
  } finally {
    btn.disabled = false;
  }
});

start(quiz.questions);
