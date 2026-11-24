# Padhai Quiz

Turns a textbook chapter into a Hindi and English practice quiz, and checks that every answer is actually backed by the chapter before a student sees it.

**Live:** {{live-url}}

## How it works in 100 words

A student pastes a chapter from their textbook. Padhai Quiz turns it into 6 to 8 practice questions, each in both English and Hindi. Claude writes the questions, but it doesn't get the last word. A checker written in plain code tests every question: four different options, one correct answer, both languages filled in, and the answer's key words found in the chapter. If a question fails, it goes back to Claude with the reason, and Claude fixes it. After the quiz, the student sees their score, which topics they're weak in, and can retry only the questions they got wrong.

_Created by Aarov Makhija._

## Why

Students in India often study in one language and get tested in another, and most free quiz tools are English-only. LLMs can write good questions, but they also write confident wrong ones, or ask about things the chapter never taught. For a student revising the night before an exam, a quiz that teaches the wrong answer is worse than no quiz.

So here the model writes, and plain code checks.

## What it does

- Paste any chapter (or use the sample one on friction, written for this project at Class 8 level).
- Claude writes 6 to 8 multiple-choice questions, each with 4 options, an explanation and a topic label, in English and Hindi (Devanagari), with the English term in brackets where students would know it, like "स्नेहक (लुब्रिकेंट)".
- Every quiz goes through `submit_quiz`, which runs `checkQuiz`:
  - exactly 4 options, no two the same, an answer index that points to one of them
  - question, options and explanation filled in both languages
  - no duplicate question ids
  - grounding: at least half the key words of the correct answer and its explanation appear in the chapter
- If anything fails, the tool returns the problems and Claude fixes only those questions and submits again. The quiz is only shown once it passes.
- The student picks English, हिंदी or both, answers each question, sees why the answer is right, and gets a score by topic. Topics under 60% are marked weak, and "Retry the ones I got wrong" replays just those.
- Options are shuffled per question (seeded by the question id), so the right answer isn't always in the same place.

## How the check works

`src/core/quiz.ts` has no AI in it. The grounding check is deliberately simple: lowercase words of 3+ letters, minus common words, compared by their first 5 letters (so "lubricant" matches "lubricants"). It catches the common failure, an answer that brings in an idea the chapter never mentions, without needing a second model call. It won't catch a wrong answer that reuses the chapter's own words, which is why the explanation is shown to the student every time.

## Run it

```bash
npm install
npm test        # 5 tests: sample passes, structure errors, grounding, scoring, agent fix loop
npm run dev     # localhost:5173
```

To generate from your own chapter, paste an Anthropic API key in the page. It stays in that browser tab.

## Layout

| Path | What's in it |
|---|---|
| `src/core/quiz.ts` | Quiz types, `checkQuiz`, scoring, retry queue |
| `src/core/sample.ts` | Sample chapter and its 8-question quiz |
| `src/agent.ts` | Claude agent with the `submit_quiz` tool |
| `src/harness/` | [TinyHarness](https://github.com/Tapovan11001/tinyharness), vendored |
| `web/` | Chapter on the left, quiz card on the right |

## Limits

- The grounding check is word-based. A smarter version would match answers to specific sentences and show the student where in the chapter it came from.
- Hindi quality depends on the model; the checker only confirms the Hindi is there, not that it's good.
- Scores live in the page only. No accounts.

## License

MIT
